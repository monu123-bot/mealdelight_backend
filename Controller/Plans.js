

const Plans = require('../Models/Plans');
const User = require('../Models/User');
const Coupon = require('../Models/Coupon');
// const User = require('../Models/User');
const PlansTransaction = require('../Models/PlansTransaction');
// const Transaction = require('../Models/Transaction'); // Adjust path as necessary
const mongoose = require('mongoose');
const DeliveryAddress = require('../Models/DeliveryAddress');
const Menu = require('../Models/Menu');
const Referral = require('../Models/Referral');
const getPlans = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1; // Page number from query parameter, default to 1
      const limit = parseInt(req.query.limit) || 5; // Limit from query parameter, default to 5
      const skip = (page - 1) * limit; // Calculate skip value for pagination

      // Fetch all available plans with pagination
      const plans = await Plans.find({})
          .skip(skip)
          .limit(limit);

      // Get the total count of all plans
      const totalCount = await Plans.countDocuments();

      const hasMore = skip + limit < totalCount;

      res.status(200).json({ plans, totalCount, hasMore });
  } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

const Subscribe = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { planId, couponName, addressId } = req.body;
    const currentDate = new Date();

    // ✅ Find existing transaction (with session)
    const existingTransaction = await PlansTransaction.findOne({
      user_id: new mongoose.Types.ObjectId(req.user),
      plan_id: new mongoose.Types.ObjectId(planId),
      address_id: new mongoose.Types.ObjectId(addressId),
      expiringAt: { $gte: currentDate },
    }).session(session);

    let remainingDays = 0;
    if (existingTransaction) {
      const timeDiff = existingTransaction.expiringAt - currentDate;
      remainingDays = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));
      existingTransaction.expiringAt = new Date(
        currentDate.getTime() - 24 * 60 * 60 * 1000
      );
      await existingTransaction.save({ session });
    }

    // ✅ Fetch required data with session
    const plan = await Plans.findById(planId).session(session);
    const coupon = couponName
      ? await Coupon.findOne({ name: couponName }).session(session)
      : null;
    const user1 = await User.findById(req.user).session(session);

    // ✅ Price calculation
    const priceWithDiscount =
      plan.price - (plan.price * plan.discount) / 100;
    const priceWithCoupon = coupon
      ? priceWithDiscount - (priceWithDiscount * coupon.discount) / 100
      : priceWithDiscount;

    const requiredAmount = priceWithCoupon;

    if (requiredAmount <= user1.walletbalance) {
      // Deduct wallet balance
      user1.walletbalance -= requiredAmount;
      await user1.save({ session });

      // New expiry date
      const newExpiringAt = new Date(
        currentDate.getTime() +
          (plan.period + remainingDays) * 24 * 60 * 60 * 1000
      );

      // New transaction
      const transactionData = {
        user_id: user1._id,
        plan_id: plan._id,
        address_id: addressId,
        coupon_id: coupon ? coupon._id : null,
        amount: requiredAmount,
        expiringAt: newExpiringAt,
      };

      const newTransaction = new PlansTransaction(transactionData);
      await newTransaction.save({ session });

      // ✅ Mark referral success if plan >= 30 days
      if (plan.period >= 30) {
        const is_referred = await Referral.findOne({
          user_id: req.user,
          status: "active",
        }).session(session);

        if (is_referred) {
          is_referred.status = "success";
          await is_referred.save({ session });
        }
      }

      // ✅ Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: "Subscription successful",
        requiredAmount,
        remainingBalance: user1.walletbalance,
      });
    } else {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        message: "Insufficient wallet balance",
        requiredAmount,
        walletBalance: user1.walletbalance,
      });
    }
  } catch (error) {
    console.error("Error during subscription:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Internal server error" });
  }
};

  
  const getDuePlans = async (req, res) => {
    const userId = req.params.userId;
  
    try {
      // Get the current date and the date 1 day later
      const currentDate = new Date();
      const oneDayLater = new Date();
      oneDayLater.setDate(currentDate.getDate() + 1);
  
      // Find transactions where expiry is within 1 day
      const transactions = await PlansTransaction.aggregate([
        {
          $match: {
            user_id: mongoose.Types.ObjectId(userId),
            createdAt: {
              $gte: currentDate,
              $lte: oneDayLater
            }
          }
        },
        {
          $lookup: {
            from: 'plans', // Reference the plans collection
            localField: 'plan_id',
            foreignField: '_id',
            as: 'planDetails'
          }
        },
        {
          $unwind: '$planDetails'
        },
        {
          $project: {
            _id: 1,
            amount: 1,
            createdAt: 1,
            planName: '$planDetails.name',
            expiryDate: {
              $add: ['$createdAt', 30 * 24 * 60 * 60 * 1000] // Expiry date: 1 month from purchase
            }
          }
        },
        {
          $match: {
            expiryDate: { $lte: oneDayLater }
          }
        },
        { $sort: { createdAt: -1 } }
      ]);
  
      if (transactions.length === 0) {
        return res.status(404).json({ message: 'No transactions expiring within 1 day found' });
      }
  
      return res.status(200).json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
 
  const fetchMyPlans = async (req, res) => {
    try {
        const userId = req.user;

        // Fetch active plans with pagination
        const plansBought = await PlansTransaction.aggregate([
            {
                // Match records by user_id and expiringAt greater than or equal to the current date
                $match: {
                    user_id: new mongoose.Types.ObjectId(userId),
                    expiringAt: { $gte: new Date() }, // Filter active plans
                }
            },
            {
                // Lookup plan details from the 'plans' collection
                $lookup: {
                    from: 'plans', // The collection to join
                    localField: 'plan_id', // The field from PlansTransaction collection
                    foreignField: '_id', // The field from Plans collection
                    as: 'planDetails', // The name of the new array field with matched documents
                }
            },
            {
                // Unwind the 'planDetails' array to treat each entry as a separate document
                $unwind: '$planDetails'
            },
            {
                // Project the desired fields
                $project: {
                    _id: 1,
                    user_id: 1,
                    plan_id: 1,
                    coupon_id: 1,
                    address_id:1,
                    amount: 1,
                    purchasedDate: '$createdAt', // Include purchase date (createdAt from PlansTransaction)
                    expiringAt: 1, // Include expiringAt date
                    'planDetails.name': 1,
                    'planDetails.price': 1,
                    'planDetails.discount': 1,
                    'planDetails.menu': 1,
                    'planDetails.period': 1,
                    
                }
            },
            {
                // Sort by purchased date in descending order (most recent first)
                $sort: { purchasedDate: -1 }
            }
        ]);

        res.status(200).json({ plans: plansBought });
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const get5Plans = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get page number from query parameter, default to 1
    const limit = parseInt(req.query.limit) || 5; // Get limit from query parameter, default to 5
    const skip = (page - 1) * limit;

    // Aggregation pipeline
    const plans = await Plans.aggregate([
      // {
      //   $match: { isHome: true } // Filter plans where isHome is true
      // },
      {
        $skip: skip // Pagination: skip
      },
      {
        $limit: limit // Pagination: limit
      }
    ]);

    res.status(200).json({ plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  const getPlanDetails = async (req, res) => {
    try {
      // Retrieve plan_id from query parameters
      const planId = req.query.id;
  
      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }
  
      // Fetch plan details from the database
      const plan = await Plans.findById(planId);
  
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
  
      // Respond with the plan details
      res.status(200).json(plan);
    } catch (error) {
      console.error("Error fetching plan details:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  const pausePlan = async (req, res) => {
    const { PausePlanTransactionId,selectedDates } = req.body;
    const userId = req.user;  // Assuming user is attached to the request object by middleware
  
    if (!PausePlanTransactionId || !selectedDates) {
      return res.status(400).json({ message: 'planTransactionId and selectedDates are required.' });
    }
  
    try {
      // Find the plansTransaction document by planTransactionId
      const planTransaction = await PlansTransaction.findById(PausePlanTransactionId);
  
      if (!planTransaction) {
        return res.status(404).json({ message: 'Plan transaction not found.' });
      }
  
      // Check if the userId in the request matches the userId in the planTransaction document
      if (planTransaction.user_id.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You are not authorized to modify this plan.' });
      }
  
      // Add selected dates to the pausedDates array
      // Ensure that only unique dates are added to avoid duplicates
      
  
      // Update the pausedDates field
      planTransaction.pausedDates = selectedDates;
  
      // Save the updated document
      await planTransaction.save();
  
      res.status(200).json({ message: 'Dates saved successfully!', selectedDates });
    } catch (err) {
      console.error('Error saving dates:', err);
      res.status(500).json({ message: 'Failed to save dates.' });
    }
  };
  
  const getPausedSlots = async (req, res) => {
    const { planTransactionId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user); // Convert userId from token to ObjectId
    
    try {
      // Find the plan transaction by ID and ensure it belongs to the correct user
      const planTransaction = await PlansTransaction.findById(planTransactionId);
      console.log(planTransaction.user_id, userId);
  
      if (!planTransaction) {
        return res.status(404).json({ message: 'Plan transaction not found.' });
      }
  
      // Check if the planTransaction belongs to the current user by comparing ObjectIds
      if (!planTransaction.user_id.equals(userId)) {
        return res.status(403).json({ message: 'You do not have permission to access this plan.' });
      }
  
      // Return the pausedSlots data
      res.status(200).json({ pausedSlots: planTransaction.pausedDates });
    } catch (err) {
      console.error('Error fetching paused slots:', err);
      res.status(500).json({ message: 'Failed to fetch paused slots.' });
    }
  };

  const GetMenu = async (req, res) => {

    try {
      const { id } = req.query;// Get menu ID from query parameter
      console.log(id)
      const menu = await Menu.findOne({_id:id}); // Fetch menu by ID
      if (!menu) {
        return res.status(404).json({ message: 'Menu not found' });
      }
      res.status(200).json(menu);
    } catch (error) {
      console.error('Error fetching menu:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  module.exports = { getPlans ,Subscribe,fetchMyPlans,get5Plans,getPlanDetails,pausePlan,getPausedSlots,GetMenu};
