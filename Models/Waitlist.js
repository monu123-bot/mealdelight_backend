const mongoose = require('mongoose');

// Subdocument schema for geolocation

const waitlist= new mongoose.Schema({
  
    email:{
        type:String,
        required:true
    }
    ,
    createdAt:{
        type:Number,
        default:Date.now()
    }
  
  
});

const Waitlist = mongoose.model('Waitlist', waitlist);

module.exports = Waitlist
