const express = require('express')
const bodyParser = require('body-parser')
const {deliveryStatus} = require('../Controller/DeliveryStatus')
// const { userAuth } = require('../Middleware/userAuth')

// const {} = require('../middleware/Auth')
// const passport = require('passport');

const DeliveryStatus = express.Router()
const jsonparser = bodyParser.json()
DeliveryStatus.post("/delivery",deliveryStatus)
module.exports = DeliveryStatus