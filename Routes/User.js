const express = require('express')
const bodyParser = require('body-parser')
const {login,createUser,fetchUserDetails,getPaymentHistory,getSubscriptionHistory} = require('../Controller/User')
const { userAuth } = require('../Middleware/userAuth')
// const {} = require('../middleware/Auth')
// const passport = require('passport');
const UserRouter = express.Router()

const jsonparser = bodyParser.json()
UserRouter.post("/login",login)
UserRouter.post("/create",createUser)
UserRouter.get("/user_details",userAuth,fetchUserDetails)
UserRouter.get("/payment_history",userAuth,getPaymentHistory)
UserRouter.get("/history",userAuth,getSubscriptionHistory)

module.exports = UserRouter