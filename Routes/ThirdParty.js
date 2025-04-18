const express = require('express')
const bodyParser = require('body-parser')
const {GenerateKetoMeal} = require('../Controller/ThirdParty')
// const { userAuth } = require('../Middleware/userAuth')

// const {} = require('../middleware/Auth')
// const passport = require('passport');

const KetoRouter = express.Router()
const jsonparser = bodyParser.json()
KetoRouter.get("/ketorecepies",GenerateKetoMeal)
module.exports = KetoRouter
