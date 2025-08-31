const mongoose = require('mongoose');

const plansTransaction = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    plan_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'plans',
        required:true
    },
    address_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'deliveryAddress',
        required:true
    },
    packing_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'packaging',
        required:true
    },
    coupon_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'coupons',
        default:null
    },
    amount:{
        type:Number,
        required:true
    },
    expiringAt:{
        type:Date,
        required:true
    },
    pausedDates:{
        type:Array
        
    }
},{


    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the model
module.exports = mongoose.model('plansTransaction', plansTransaction);
