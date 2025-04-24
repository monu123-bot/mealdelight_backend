const express = require('express')
const bodyParser = require('body-parser')
const {AddMenu,Login,Register,GetMenu,addPlan} = require('../Controller/Admin')
const { adminAuth } = require('../Middleware/adminAuth')
// const { userAuth } = require('../Middleware/userAuth')

// const {} = require('../middleware/Auth')
// const passport = require('passport');

const AdminRouter = express.Router()
const jsonparser = bodyParser.json()
AdminRouter.post("/addmenu",AddMenu)
AdminRouter.post("/login",Login)
AdminRouter.post("/register",Register)
AdminRouter.get("/getMenu",adminAuth,GetMenu)
AdminRouter.post("/addplan",adminAuth,addPlan)
module.exports = AdminRouter