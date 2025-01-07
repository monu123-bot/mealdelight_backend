const mongoose = require('mongoose');

// Subdocument schema for geolocation

const darkKitchen = new mongoose.Schema({
  name: { // done
    type: String,
    required: true,
  },
  
  thumbnail:{  //done
    type:String,
  },
  images: [{ //done
    type: String,
  }],
  location: { //done
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  category: { //done
    type: String,
    enum: ['cafe', 'restaurant', 'bar','kitchen'],
    default:'kitchen'
  },
  
  cousine:[{    // done
    type: String,
    enum: ['italian', 'chinese', 'indian',''],
    default:''
  }],
  
  menuType:{   //done
    type:String,
    enum:['veg','nonveg','omnivores'],
    default:'veg'
  },
  state:{
    type:String,
  },
  city:{
    type:String,
  }
  ,
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  startDate:{
    type:Date,
  },
  isActive:{
    type:Boolean
  }
});
darkKitchen.index({ location: '2dsphere' });
const DarkKitchen = mongoose.model('darkkitchen', darkKitchen);
module.exports = DarkKitchen;