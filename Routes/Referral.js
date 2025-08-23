const express = require('express')
const bodyParser = require('body-parser')
const {getReferrals,generateReferralCode,redeemReferral} = require('../Controller/Referral.js')
const { userAuth } = require('../Middleware/userAuth')
// const {} = require('../middleware/Auth')
// const passport = require('passport');
const ReferralRouter = express.Router()

const jsonparser = bodyParser.json()
ReferralRouter.get("/get_referrals",userAuth,getReferrals)
ReferralRouter.get("/generate_code",userAuth,generateReferralCode)
ReferralRouter.post("/redeem_referral",userAuth,redeemReferral)
module.exports = ReferralRouter