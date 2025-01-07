// middleware/auth.js

// const passport = require('passport');
const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated


// Middleware to restrict access to authenticated users only
exports.userAuth = (req, res, next) => {
    
    const token = req.headers.authorization.split(" ")[2]

    // console.log("token in require auth  ....",token)
    jwt.verify(token,process.env.SECRET_KEY, (err,data)=>{
      if(err){
        console.log("error is ",err)
        return res.status(401).json({msg:"error in verifying token"})
      }
      else{
      
        req.user = data.user
        console.log('auth user is ',req.user)
        // console.log("verified is ",data)
        
        return next()
      }
    })
    
  
   
};