
const express = require('express')
const bodyParser = require('body-parser')
const { addSurvey } = require('../Controller/Survey')
// const {sentOtp,verifyOtp} = require('../Controller/Plans')

// const {} = require('../middleware/Auth')
// const passport = require('passport');
const SurveyRouter = express.Router()

const jsonparser = bodyParser.json()
SurveyRouter.post("/marketanalysis",addSurvey)

module.exports = SurveyRouter