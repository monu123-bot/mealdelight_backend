const mongoose   = require('mongoose')

const DelAddressSchema = mongoose.Schema({
    user_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users', // Referencing the 'users' collection
      required: true
    },
    recievers_name:{
        type:String,
        required:true
    },
    recievers_phone:{
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
      isDefault:{
type:Boolean,
require:true

      },
    createdAt:{
        type:Number,
        default:Date.now()
    }
    

})
// DelAddressSchema.plugin(passportLocalMongoose);
module.exports = mongoose.models.DelAddressSchema || mongoose.model('deliveryAddress', DelAddressSchema);
// module.exports = mongoose.model('user',DelAddressSchema)