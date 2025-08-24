const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    thumbnail:{
        type:String,
        default:'#'
    },
    discount:{
        type:Number,
        default:0
    },
    period:{
        type:Number,
        default:30

    },
    isCoupon:{
    type:String,
    default:false
    },
    menu:{
         type: mongoose.Schema.Types.ObjectId,
                ref: 'WeeklyMenu', // Referencing the 'users' collection
                required: true
    },
    isHome:{
        type:Boolean,
        default:false
    },
    includes:{
        type:[Boolean,Boolean,Boolean], // breakfast,lunch,dinner
        required:true
    },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the model
module.exports = mongoose.model('plans', planSchema);
