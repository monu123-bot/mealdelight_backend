const mongoose   = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose');
const UserSchema = mongoose.Schema({
    
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        default:''
    },
    
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true
    },
    gender:{
        type:String,
        default:''
    },
    
    phone:{
        type:String,
        
        required:true
    },
    image:{
        type:String,
        default:'#'
    },
    
    dob:{
        type:Date,
        default:''
    },
    
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    password:{
        type:String,
        default:'admin'
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
      walletbalance:{
        type:Number,
        default:0
      },
      address:{
        type:String,
        required:true

      },
      plans:[{
     type:mongoose.Schema.Types.ObjectId,
     required:true
      }],

      
    createdAt:{
        type:Number,
        default:Date.now()
    }
    

})
// UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.models.UserSchema || mongoose.model('user', UserSchema);
// module.exports = mongoose.model('user',UserSchema)