const mongoose = require('mongoose');

const packagingSchema = new mongoose.Schema({
    
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        default:0
    },
    currency:{
        type:String,
        default:"INR"
    }
    
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the model
module.exports = mongoose.model('packaging', packagingSchema);
