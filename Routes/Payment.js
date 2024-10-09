const express = require('express')
const bodyParser = require('body-parser')
const {createOrder,updateOrderStatus} = require('../Controller/Payment')
const { userAuth } = require('../Middleware/userAuth')

// const {} = require('../middleware/Auth')
// const passport = require('passport');

const PaymentRouter = express.Router()
const jsonparser = bodyParser.json()
PaymentRouter.post("/create_order",userAuth,createOrder)
PaymentRouter.post("/update_order_status",userAuth,updateOrderStatus)
module.exports = PaymentRouter