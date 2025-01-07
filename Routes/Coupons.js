const express = require('express')
const bodyParser = require('body-parser')
const {verifyCoupon} = require('../Controller/Coupons')
const { userAuth } = require('../Middleware/userAuth')

// const {} = require('../middleware/Auth')
// const passport = require('passport');

const CouponsRouter = express.Router()
const jsonparser = bodyParser.json()
CouponsRouter.get("/verify",verifyCoupon)
module.exports = CouponsRouter