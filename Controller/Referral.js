
const Referral = require('../Models/Referral');
const mongoose = require('mongoose');
const crypto = require('crypto');
const getReferrals = async (req, res) => {
  try {
    const user_id = req.user; // current logged in user (referrer)
    console.log("user id in get referrals is ", user_id);
    const my_referral_code = await Referral.findOne({ user_id: user_id });
    console.log("my referral code is ", my_referral_code);
    const referee_data = await Referral.aggregate([
      {
        $match: { referredBy: new mongoose.Types.ObjectId(user_id) }
      },
      {
        $lookup: {
          from: "users",                 // collection to join
          localField: "user_id",         // field in referral
          foreignField: "_id",           // field in users
          as: "refereeDetails"
        }
      },
      {
        $unwind: "$refereeDetails"       // convert array to object
      },
      {
        $project: {
          referralId: "$_id",
          status: 1,
          createdAt: 1,
          redemmed:1,
          redemmed_amount:1,
          "referee.id": "$refereeDetails._id",
          "referee.firstName": "$refereeDetails.firstName",
          "referee.lastName": "$refereeDetails.lastName",
          "referee.phone": "$refereeDetails.phone"
        }
      }
    ]);

    if (!referee_data || referee_data.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No referrals found for this user.",
        my_referral_code: my_referral_code ? my_referral_code.referralCode : null,
        data: []
      });
    }

    console.log("referee data are ", referee_data);

    return res.status(200).json({
      success: true,
      data: referee_data,
      my_referral_code: my_referral_code ? my_referral_code.referralCode : null
    });
  } catch (error) {
    console.error("Error in getReferrals:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};



const generateReferralCode = async (req, res) => {
  try {
    const user_id = req.user;
    console.log("user id in generate referral code is ", user_id);

    // Check if the user already has a referral code
    let existingReferral = await Referral.findOne({ user_id: user_id });
    if (existingReferral) {
      return res.status(200).json({
        success: true,
        message: "Referral code already exists.",
        referralCode: existingReferral.referralCode,
      });
    }

    // Generate unique string using user_id + timestamp + random
    // const uniqueString = user_id.toString() + Date.now().toString() + Math.random().toString();

    // Convert to base36 and take first 5 chars
    const referralCode = crypto.createHash("sha256")     // hash with SHA-256
        .update(user_id.toString()) // feed userId string
        .digest("hex")             // hex string
        .substring(0, 5)           // first 5 chars
        .toUpperCase(); 

    // Create a new referral document
    const newReferral = new Referral({
      user_id: user_id,
      referralCode: referralCode,
      referredBy: null,
      status: null,
    });

    await newReferral.save();

    return res.status(201).json({
      success: true,
      message: "Referral code generated successfully.",
      referralCode: referralCode,
    });
  } catch (error) {
    console.error("Error in generateReferralCode:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

const redeemReferral = async (req, res) => {
  try {
    const user_id = req.user; // current logged in user (referrer)
    const referralId = req.body.referralId; // referral document ID to redeem

    console.log("user id in redeem referral is ", user_id);
    console.log("referral id to redeem is ", referralId);

    // Find the referral document
    const referral = await Referral.findOne({ _id: referralId, referredBy: user_id });
    
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found or you are not authorized to redeem this referral.",
      });
    }

    if (referral.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Referral is not in a redeemable state.",
      });
    }

    if (referral.redemmed) {
      return res.status(400).json({
        success: false,
        message: "Referral has already been redeemed.",
      });
    }

    // Mark as redeemed
    referral.redemmed = true;
    await referral.save();

    // Update referrer's wallet
    const referer = await User.findOne({ _id: user_id });
    referer.walletbalance += referral.redemmed_amount;
    await referer.save();

    // ✅ Add a transaction record
    const transaction = new Transaction({
      userId: user_id,
      type: "credit", // money coming in
      amount: referral.redemmed_amount,
      source: "referral", // so you know it came from referral
      referralId: referral._id, // link back to the referral
      status: "completed",
      createdAt: new Date(),
    });
    await transaction.save();

    return res.status(200).json({
      success: true,
      message: `Successfully redeemed ${referral.redemmed_amount} points from the referral.`,
      redemmed_amount: referral.redemmed_amount,
      transactionId: transaction._id
    });

  } catch (error) {
    console.error("Error in redeemReferral:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};



module.exports = {getReferrals,generateReferralCode,redeemReferral}