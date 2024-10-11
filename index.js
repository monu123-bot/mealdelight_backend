const { createServer } = require("http");
const jwt = require("jsonwebtoken");
const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const Coupon = require("./Models/Coupon");
const secretKeyJWT = "asdasdsadasdasdasdsa";
const planSchema = require('./Models/Plans')
// Database Connection
const db = require('./config/db');
// console.log(db)
db();


// Miscellaneous
// const faker = require('faker');
const passport = require('passport');
const session = require('express-session');

// Express App Initialization
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: `${process.env.CLIENT_URL}`  // Replace with your frontend URL
}));

// app.use(
//     cors(
//       {
//       origin: `${process.env.CLIENT_URL}` || "http://localhost:3000" ,
//       // origin:"http://localhost:3000",
//       methods: ["GET", "POST"],
//       credentials: true,
//     }
//   )
//   );

  // Middleware to parse JSON and URL-encoded bodies
  app.use(express.json());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 100000, limit: "50mb" }));
  
  // Enable CORS for all routes
  // app.use(cors({ credentials: true }));
  app.use(cookieParser());


  const addPlan = async () => {
    try {
      // Get data from the request body
      const { name, price, discount, menu,period ,isCoupon} = {
        name: 'Trial Plan 3',
        price: 300,
        discount: 7,
        menu: 'https://www.canva.com/design/DAGS53cj2zw/VID2rEIuW4gf8iMphy8RGQ/view',
        period:2,
        isCoupon:true
      };
  
      // Validation check for required fields
      if (!name || !price || !menu) {
        return res.status(400).json({ message: 'Name, price, and menu are required.' });
      }
  
      // Create a new plan
      const newPlan = new planSchema({
        name,
        price,
        discount: discount || 0, // Default discount to 0 if not provided
        menu,
        period,
        isCoupon
      });
  
      // Save the plan to the database
      const savedPlan = await newPlan.save();
      console.log('plan added')
      // Send response
      
    } catch (error) {
      console.error('Error adding plan:', error);
      
    }
  };
  
// addPlan()



// const addCoupon = async () => {
//   try {
//     // Get data for the coupon
//     const { name, discount, reedems, expiry } = {
//       name: 'NAVARATRI20',
//       discount: 20,
//       reedems: 4,
//       expiry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Adding 2 days in milliseconds
//     };

//     // Create a new coupon
//     const newCoupon = new Coupon({
//       name,
//       discount: discount || 0, // Default discount to 0 if not provided
//       reedems,
//       expiry
//     });

//     // Save the coupon to the database
//     const savedCoupon = await newCoupon.save();
//     console.log('Coupon added:', savedCoupon);

//     // Send response
//     return { message: 'Coupon added successfully', coupon: savedCoupon };
//   } catch (error) {
//     console.error('Error adding coupon:', error);
//     throw new Error('Internal server error'); // Or handle error appropriately
//   }
// };

  
// addCoupon()
  
const UserRouter = require('./Routes/User');
const PaymentRouter = require('./Routes/Payment');
const PlansRouter = require('./Routes/Plans');
const CouponsRouter = require('./Routes/Coupons')

app.use("/user", UserRouter);
app.use("/payment",PaymentRouter)
app.use("/plans",PlansRouter)
app.use("/coupons",CouponsRouter)

app.listen(PORT, () => {
  console.log('Server is running on port:', PORT);
});