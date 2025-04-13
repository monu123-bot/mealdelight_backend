const express = require('express')
const bodyParser = require('body-parser')
const {getPlans,Subscribe,fetchMyPlans,get5Plans,getPlanDetails,pausePlan,getPausedSlots,GetMenu} = require('../Controller/Plans')
const { userAuth } = require('../Middleware/userAuth')
// const {} = require('../middleware/Auth')
// const passport = require('passport');
const PlansRouter = express.Router()

const jsonparser = bodyParser.json()
PlansRouter.get("/get_plans",userAuth,getPlans)
PlansRouter.post("/subscribe",userAuth,Subscribe)
PlansRouter.get("/get_my_plans",userAuth,fetchMyPlans)
PlansRouter.get("/get_all_plans",get5Plans)
PlansRouter.get("/plandetails",getPlanDetails)
PlansRouter.post("/pausePlan",userAuth,pausePlan)
PlansRouter.get("/menu",GetMenu)
PlansRouter.get("/getPausedSlots/:planTransactionId",userAuth,getPausedSlots)
module.exports = PlansRouter