const mongoose = require('mongoose');

const paymentOrderSchema = new mongoose.Schema({
    order_amount: {
        type: Number,
        required: true
    },
    order_currency: {
        type: String,
        default: "INR",
        required: true
    },
    order_id: {
        type: String,
        required: true,
        unique: true
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // Referencing the 'users' collection
        required: true
    },
    order_meta: {
        return_url: {
            type: String,
            required: true
        },
        notify_url: {
            type: String,
            required: true
        },
        payment_methods: {
            type: String,
            required: true
        }
    },
    order_status:{
       type:String,
       enum:['SUCCESS','FAILED'],
       default:'FAILED'
    },
    order_expiry_time: {
        type: Date,
        required: true
    }
    ,
    claim_status:{
        type:String,
        enum:['Not claimed','Under review','Payment completed','Payment rejected'],
        default:'Not claimed'
    }
    ,
    isClaimed:{
        type:Boolean,
        default:false
    },
    isClaimApproved:{
        type:Boolean,
        default:false
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the model
module.exports = mongoose.model('PaymentOrder', paymentOrderSchema);
