const mongoose = require('mongoose');

// Subdocument schema for geolocation

const tagSchema = new mongoose.Schema({
  
    name:{
        type:String,
        required:true
    },
    count:{
        type:Number,
        default:0
    }
    ,
    createdAt:{
        type:Number,
        default:Date.now()
    }
  
  
});

const Tags = mongoose.model('tag', tagSchema);

module.exports = Tags;
