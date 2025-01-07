const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    
    otp:{
        type:String,
        required:true
    },
    
    expireAt:{
        type:Date,
        required:true
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the model
module.exports = mongoose.model('otps', otpSchema);
