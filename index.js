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
const DarkKitchen = require('./Models/DarkKitchen')
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

// app.use(cors({
//   origin: `${process.env.CLIENT_URL}`  // Replace with your frontend URL
// }));

app.use(
    cors(
      {
      origin: `${process.env.CLIENT_URL}` || "http://localhost:3000"  ,
      // origin:"http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    }
  )
  );

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
      const { name, price, discount, menu,period ,isCoupon,thumbnail} = {
        name: 'North Indian Plan',
        price: 5000,
        discount: 15,
        menu: '67fb714191ce67838a208bb9',
        period:30,
        isCoupon:true,
        thumbnail:'https://www.eatingwell.com/thmb/6ppa_TjBBdbsguYwOUL99hk2qWc=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/EW-Meal-Plans-Mediterranean-Day-05-3x2-9aa76ee89adc4c56a802a8bc3a7141c8.jpg'
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
        isCoupon,
        thumbnail
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
async function addDarkKitchen({ name, locationType, coordinates,state,city,postalCode,startDate }) {
  try {
    // Validate required fields
    if (!name || !locationType || !coordinates || coordinates.length !== 2) {
      throw new Error('All required fields (name, locationType, coordinates) must be provided.');
    }

    // Create the darkKitchen document
    const newDarkKitchen = new DarkKitchen({
      name,
      location: {
        type: locationType,
        coordinates,
      },
      state,
      city,
      postalCode,
      startDate

    });

    // Save to the database
    const savedDarkKitchen = await newDarkKitchen.save();
    console.log('DarkKitchen added successfully:', savedDarkKitchen);
    return savedDarkKitchen;
  } catch (error) {
    console.error('Error adding darkKitchen:', error.message);
    throw error;
  }
}
const addKitchen = async ()=>{
  try {
    const newDarkKitchen = await addDarkKitchen({
      name: 'This Kitchen',
      locationType: 'Point',
      coordinates: [77.1025, 28.7041], // Longitude and Latitude
      state:'Telangana',
      city:'Hyderabad',
      postalCode:500081,
      startDate:Date.now()
    });
    console.log('New DarkKitchen:', newDarkKitchen);
  } catch (error) {
    console.error('Failed to add DarkKitchen:', error.message);
  }
}

// addKitchen()
const UserRouter = require('./Routes/User');
const PaymentRouter = require('./Routes/Payment');
const PlansRouter = require('./Routes/Plans');
const CouponsRouter = require('./Routes/Coupons')
const PhoneRouter = require('./Routes/Phone');
const DarkKitchenRouter = require('./Routes/DarkStores');
const DeliveryStatus=require('./Routes/DeliveryStatus')
const BlogRouter = require('./Routes/Blogs')
const SurveyRouter = require('./Routes/Survey')
const AdminRouter = require('./Routes/Admin');
const { default: mongoose } = require("mongoose");
app.use("/user", UserRouter);
app.use("/payment",PaymentRouter)
app.use("/blog", BlogRouter);
app.use("/plans",PlansRouter)
app.use("/coupons",CouponsRouter)
app.use("/phone",PhoneRouter)
app.use("/darkkitchen",DarkKitchenRouter)
app.use('/Delivery',DeliveryStatus)
app.use('/survey',SurveyRouter)
app.use('/admin',AdminRouter)
app.listen(PORT, () => {
  console.log('Server is running on port:', PORT);
});