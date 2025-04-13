const express = require('express')
const bodyParser = require('body-parser')
const {AddMenu} = require('../Controller/Admin')
// const { userAuth } = require('../Middleware/userAuth')

// const {} = require('../middleware/Auth')
// const passport = require('passport');

const AdminRouter = express.Router()
const jsonparser = bodyParser.json()
AdminRouter.post("/addmenu",AddMenu)
module.exports = AdminRouter