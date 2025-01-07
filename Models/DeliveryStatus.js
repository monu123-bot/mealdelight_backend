const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    planId:{
        type:String,
        required:true
    },
    message:{
        type:String,
        default:2
    },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the model
module.exports = mongoose.model('deliverystatus', couponSchema);
