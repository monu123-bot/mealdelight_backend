const express = require('express')
const bodyParser = require('body-parser')
const { sendOtp,verifyOtp,sendOtp_f } = require('../Controller/Phone')
// const {sentOtp,verifyOtp} = require('../Controller/Plans')

// const {} = require('../middleware/Auth')
// const passport = require('passport');
const PhoneRouter = express.Router()

const jsonparser = bodyParser.json()
PhoneRouter.post("/verifyotp",verifyOtp)
PhoneRouter.post("/sentotp",sendOtp)
PhoneRouter.post("/sentotp_f",sendOtp_f) // For frontend specific endpoint
module.exports = PhoneRouter