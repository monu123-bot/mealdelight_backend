
const User = require('../Models/User')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
// var cryptojs = require('crypto-js')
// const { default: mongoose, MongooseError } = require('mongoose')
// const sendEmail = require('../functions/SendEmail')
const bcrypt = require('bcryptjs')
const PaymentOrder = require('../Models/PaymentOrder');
const PlansTransaction = require('../Models/PlansTransaction');
const DeliveryAddress = require('../Models/DeliveryAddress');

const verifyLogin = async (req,res)=>{


    try {
        const token = req.headers.authorization.split(" ")[1]
        if( token===undefined || !token ){
 
            return res.status(400).json({msg:"error in verifying token"})


        }
        console.log("token in require auth  ....",token)
        jwt.verify(token,process.env.SECRET_KEY,(err,data)=>{
          if(err){
            console.log("error is ",err)
            return res.status(400).json({msg:"error in verifying token"})
          }
          else{
    
            req.user = data.user
            console.log("verified is ",data)
            
            return res.status(200).json({msg:'token is valid'})
          }
        })
    } catch (error) {
        return res.status(400).json({msg:"error in verifying token"})
    }
}
const login = async (req, res) => {
    try {
      const { phone, password } = req.body;
  
      // Find user by phone number
      let user = await User.findOne({ phone });
      if (user) {
        // Compare the password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          console.log('User authenticated successfully');
  
          // Generate JWT token
          const token = jwt.sign({ user: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
  
          // Set response headers
          res.setHeader("Access-Control-Expose-Headers", '*, authorization');
          res.setHeader('Authorization', 'Bearer ' + token);
  
          // Send success response
          return res.status(200).json({ msg: "Logged in successfully" });
        } else {
          return res.status(401).json({ msg: "Incorrect password" });
        }
      } else {
        return res.status(404).json({ msg: "User not found" });
      }
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ msg: "Server error" });
    }
  };

const createUser =async (req,res) =>{
    try {
        const { firstName, lastName, email, phone, password } = req.body;
    
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
          return res.status(400).json({ msg: 'User already exists with this phone' });
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const user = new User({
          firstName,
          lastName,
          email,
          phone,
          password: hashedPassword,
          
        });
    
        await user.save();
        res.status(200).json({ msg: 'User created successfully' });
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ msg: 'Server error' });
      }
}
const fetchUserDetails = async (req,res)=>{
    try {
        const id = req.user; // The user ID obtained from the decoded token
    
        // Fetch user details from the database
        const user = await User.findOne({_id:id}).select('-password'); // Exclude password field
        if (!user) {
          return res.status(404).json({ msg: 'User not found' });
        }
    
        // Send user details in response
        res.status(200).json(user);
      } catch (error) {
        console.error('Error fetching user details:', error.message);
        res.status(500).json({ msg: 'Server error' });
      }
}
const getPaymentHistory =async (req,res)=>{
  const userId = req.user; // Assuming `authenticateUser` middleware adds `user` to `req`
  const page = parseInt(req.query.page) || 1;
  const limit = 5; // Number of records per page

  try {
    // Find payments for the authenticated user, sorted by the most recent
    const paymentHistory = await PaymentOrder.find({ customer_id: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Send the payment history to the client
    res.status(200).json(paymentHistory);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ msg: 'Error fetching payment history' });
  }
}
const getSubscriptionHistory = async (req,res)=>{
  
    try {
      const userId = req.user;
      const page = parseInt(req.query.page) || 1; // Get the page number from query params, default to 1
      const limit = parseInt(req.query.limit) || 10; // Number of items per page, default to 10
      const skip = (page - 1) * limit;
  
      // Fetch user's transactions with pagination
      const result = await PlansTransaction.aggregate([
        {
          $match: { user_id:new mongoose.Types.ObjectId(userId) } // Fetch transactions for the specific user
        },
        {
          $lookup: {
            from: 'plans', // Name of the `plans` collection
            localField: 'plan_id', // Field in `plansTransaction`
            foreignField: '_id', // Field in `plans` collection
            as: 'planDetails' // Store the result in `planDetails`
          }
        },
        {
          $unwind: '$planDetails' // Unwind the `planDetails` array (since we're only fetching one plan per transaction)
        },
        {
          $addFields: {
            expiryDate: {
              $add: ['$createdAt', { $multiply: ['$planDetails.period', 1000 * 60 * 60 * 24] }] // Add `period` days to `createdAt`
            }
          }
        },
        {
          $sort: { createdAt: -1 } // Sort by purchase date in descending order (most recent first)
        },
        {
          $project: {
            _id: 0, // Do not return the _id field
            planName: '$planDetails.name', // Plan name from `planDetails`
            purchaseDate: '$createdAt', // Transaction purchase date
            expiryDate: 1 // Calculated expiry date
          }
        },
        {
          $skip: skip // Skip documents based on pagination
        },
        {
          $limit: limit // Limit the number of documents returned
        }
      ]);
  
      // Count total transactions for the user
      const total = await PlansTransaction.countDocuments({ user_id:userId });
  
      res.status(200).json({
        result,
        hasMore: skip + result.length < total,  // Check if there are more transactions to load
      });
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  
}

const VerifyToken = async (req, res) => {
  try {
    // Get userId from the request (assumes middleware has set req.user after token verification)
    const userId = req.user;
    console.log('User ID is:', userId);

    // Find the user in the database by ID
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the user details as the response
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const addAddress = async (req, res) => {
  try {
    const user_id = new mongoose.Types.ObjectId(req.user)
      // Validate the request body
      const {
          recievers_name,
          recievers_phone,
          street,
          apartment,
          city,
          state,
          country,
          postalCode,
          address,
          isDefault
      } = req.body;

      if (
          !recievers_name ||
          !recievers_phone ||
          !street ||
          !city ||
          !state ||
          !postalCode ||
          !address 
      ) {
          return res.status(400).json({ message: "All required fields must be filled" });
      }

      // Save address to the database
      const newAddress = new DeliveryAddress({
        user_id,
          recievers_name,
          recievers_phone,
          street,
          apartment,
          city,
          state,
          country: country || "IN",
          postalCode,
          address,
          isDefault,
          createdAt: Date.now()
      });

      await newAddress.save();

      // Send success response
      return res.status(201).json({
          message: "Address added successfully",
          address: newAddress
      });
  } catch (error) {
      console.error('Error in saving address:', error.message);
      return res.status(500).json({
          message: "Internal Server Error",
          error: error.message
      });
  }
};

const fetchAddress = async (req, res) => {
  try {
    // Extract page and limit from query params
    // const { page = 1, limit = 2 } = req.query;

    // Assuming the user ID is available from `req.user` (via `authenticateToken` middleware)
    const userId = new mongoose.Types.ObjectId(req.user);

    // Calculate the skip value for pagination
    // const skip = (page - 1) * limit;

    // Fetch the addresses with pagination
    const addresses = await DeliveryAddress.find({ user_id:userId }).lean(); // `lean()` gives plain JavaScript objects instead of Mongoose documents

    // Count the total number of addresses for the user
    const totalAddresses = await DeliveryAddress.countDocuments({ user_id:userId });

    // Determine if more addresses are available
    // const hasMore = skip + addresses.length < totalAddresses;

    return res.status(200).json({
      address: addresses,
      hasMore:false,
    });
  } catch (error) {
    console.error('Error fetching addresses:', error.message);
    return res.status(500).json({
      message: 'Failed to fetch addresses',
      error: error.message,
    });
  }
};


module.exports = {login,createUser,fetchUserDetails,getPaymentHistory,getSubscriptionHistory,VerifyToken,addAddress,fetchAddress}