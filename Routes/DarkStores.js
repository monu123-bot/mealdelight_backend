const express = require('express')
const bodyParser = require('body-parser')
const { getDarkKitchens } = require('../Controller/DarkStores')


// const {} = require('../middleware/Auth')
// const passport = require('passport');

const DarkKitchenRouter = express.Router()
const jsonparser = bodyParser.json()
DarkKitchenRouter.get("/get-list",getDarkKitchens)
module.exports = DarkKitchenRouter