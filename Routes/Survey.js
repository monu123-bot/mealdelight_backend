
const express = require('express')
const bodyParser = require('body-parser')
const { addSurvey,joinWaitlist,getSurveyById}=require('../Controller/Survey')
// const {sentOtp,verifyOtp} = require('../Controller/Plans')

// const {} = require('../middleware/Auth')
// const passport = require('passport');
const SurveyRouter = express.Router()

const jsonparser = bodyParser.json()
SurveyRouter.post("/marketanalysis",addSurvey)
SurveyRouter.post("/joinwaitlist",joinWaitlist)
SurveyRouter.get("/marketanalysis/:surveyId",getSurveyById)
module.exports = SurveyRouter