const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    
    user_id:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'users', // Referencing the 'users' collection
          required: true
        },
    referralCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // Referencing the 'users' collection
        required: false
    },
    status: {
        type: String,
        enum: ['active', 'success', 'failed',null],
        default: null
    },
    redemmed: {
        type: Boolean,
        default: false
    },
    redemmed_amount: {
        type: Number,   
        default: 200
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the model
module.exports = mongoose.model('referral', referralSchema);
