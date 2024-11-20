const mongoose   = require('mongoose')

const DelAddressSchema = mongoose.Schema({
    
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        
        required:true
    },
    
    street: {
        type: String,
        required: true,
        trim: true
      },
      apartment: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        required: true,
        trim: true
      },
      country: {
        type: String,
        default:"IN"
      },
      postalCode: {
        type: String,
        required: true,
        trim: true
      },
      
      address:{
        type:String,
        required:true

      },

    createdAt:{
        type:Number,
        default:Date.now()
    }
    

})
// DelAddressSchema.plugin(passportLocalMongoose);
module.exports = mongoose.models.DelAddressSchema || mongoose.model('user', DelAddressSchema);
// module.exports = mongoose.model('user',DelAddressSchema)