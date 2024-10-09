
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookie = require('cookie');
const axios = require('axios');
const Plans = require('../Models/Plans');
const User = require('../Models/User');
const Coupon = require('../Models/Coupon');
// const User = require('../Models/User');
const PlansTransaction = require('../Models/PlansTransaction');
// const Transaction = require('../Models/Transaction'); // Adjust path as necessary
const mongoose = require('mongoose')

const getPlans = async (req, res) => {
    // try {
    //     let userId = req.user
    //     const page = parseInt(req.query.page) || 1; // Get page number from query parameter, default to 1
    //     const limit = parseInt(req.query.limit) || 5; // Get limit from query parameter, default to 5
    //     const skip = (page - 1) * limit;
    
    //     // Fetch plans with pagination
    //     const plans = await Plans.find()
    //       .skip(skip)
    //       .limit(limit);
    
    //     // Check if there are more plans
    //     const totalPlans = await Plans.countDocuments();
    //     const hasMore = skip + limit < totalPlans;
    
    //     res.status(200).json({ plans, hasMore });
    //   } catch (error) {
    //     console.error('Error fetching plans:', error);
    //     res.status(500).json({ message: 'Internal server error' });
    //   }


    try {
        let userId = req.user; // Assuming req.user contains the user's ID
        const page = parseInt(req.query.page) || 1; // Get page number from query parameter, default to 1
        const limit = parseInt(req.query.limit) || 5; // Get limit from query parameter, default to 5
        const skip = (page - 1) * limit;

        // Aggregation pipeline
        const plans = await Plans.aggregate([
            {
                // Lookup to join with plansTransaction
                $lookup: {
                    from: 'planstransactions', // The name of the transactions collection
                    localField: '_id', // Field from the plans collection
                    foreignField: 'plan_id', // Field from the plansTransaction collection
                    as: 'subscriptions' // Name for the joined data
                }
            },
            {
                // Match plans where the user_id is not in the subscriptions
                $match: {
                    subscriptions: {
                        $not: {
                            $elemMatch: { user_id:new mongoose.Types.ObjectId(userId) }
                        }
                    }
                }
            },
            {
                // Pagination: skip and limit
                $skip: skip
            },
            {
                $limit: limit
            }
        ]);

        // Check total count of plans ignoring the subscribed ones
        const totalPlans = await Plans.aggregate([
            {
                $lookup: {
                    from: 'planstransactions',
                    localField: '_id',
                    foreignField: 'plan_id',
                    as: 'subscriptions'
                }
            },
            {
                $match: {
                    subscriptions: {
                        $not: {
                            $elemMatch: { user_id:new mongoose.Types.ObjectId(userId) }
                        }
                    }
                }
            },
            {
                $count: 'total' // Count the total number of plans
            }
        ]);

        const totalCount = totalPlans.length > 0 ? totalPlans[0].total : 0;
        const hasMore = skip + limit < totalCount;

        res.status(200).json({ plans, hasMore });
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  };

  const Subscribe = async (req, res) => {
    const planId = req.body.planId;
    const couponName = req.body.couponName;
  
    try {
      const plan = await Plans.findById(planId);
      const coupon = couponName ? await Coupon.findOne({ name: couponName }) : null; // Fetch coupon only if provided
      const user1 = await User.findById(req.user)
  
      // Calculate the price after discount and coupon
      const priceWithDiscount = plan.price - (plan.price * plan.discount) / 100;
      const priceWithCoupon = coupon ? priceWithDiscount - (priceWithDiscount * coupon.discount) / 100 : priceWithDiscount;
  
      const requiredAmount = priceWithCoupon;
  
      if (requiredAmount <= user1.walletbalance) {
        // Decrease user wallet balance by required amount
        user1.walletbalance -= requiredAmount;
        await user1.save();
  
        // Add transaction to transactions collection
        const transactionData = {
          user_id: user1._id,
          plan_id: plan._id,
          coupon_id: coupon ? coupon._id : null, // Store coupon ID if applied
          amount: requiredAmount
        };
  
        
        const transaction = new PlansTransaction(transactionData);
        await transaction.save();
  
        // Return a success response
        return res.status(200).json({
          message: 'Subscription successful',
          requiredAmount,
          remainingBalance: user1.walletbalance
        });
      } else {
        // Return an error response if insufficient balance
        return res.status(400).json({
          message: 'Insufficient wallet balance',
          requiredAmount,
          walletBalance: user1.walletbalance
        });
      }
    } catch (error) {
      console.error('Error during subscription:', error);
      return res.status(500).json({ message: 'Internal server error' });
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
  
 
const fetchMyPlans = async (req,res)=>{
    try {
        let userId = req.user
        
        // Fetch plans with pagination
        const plansBought = await PlansTransaction.aggregate([
            {
              // Match records by user_id
              $match: {
                user_id:new mongoose.Types.ObjectId(userId),
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
                amount: 1,
                purchasedDate: '$createdAt', // Include purchase date (createdAt from PlansTransaction)
                'planDetails.name': 1,
                'planDetails.price': 1,
                'planDetails.discount': 1,
                'planDetails.menu': 1,
                'planDetails.period':1
              }
            },
            {
              // Sort by purchased date in descending order (most recent first)
              $sort: { purchasedDate: -1 }
            }
          ]);
          

        res.status(200).json({ plans:plansBought});

      } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
}


  module.exports = { getPlans ,Subscribe,fetchMyPlans};
