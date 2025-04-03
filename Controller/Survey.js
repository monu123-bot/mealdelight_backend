const Survey = require("../Models/Survey");
const mongoose = require("mongoose");
const Waitlist = require("../Models/waitlist");

const joinWaitlist = async (req, res) => {


  try {
    const { email } = req.body;
    console.log("Request body:", req.body);

    // Validate email
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const newWaitlistEntry = new Waitlist({ email });
    await newWaitlistEntry.save();

    return res.status(200).json({ message: "Successfully joined the waitlist." });
  } catch (error) {
    console.error("Error joining waitlist:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}


const generateToken =async (phone) => {
  console.log("Phone number:", phone);
  let result = [];
  for (let i = 0; i < phone.length - 1; i++) {
    let sum = parseInt(phone[i]) + parseInt(phone[i + 1]);
    result.push(sum);
  }
  let chrArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'];
  let discountCode = '';
  for (let i = 0; i < result.length; i++) {
    let index = result[i] % chrArr.length;
    discountCode += chrArr[index];
  }
  return discountCode;
};
const addSurvey = async (req, res) => {
  try {
    const  step  = req.body.step;
    
    // STEP 1: Create a new survey
    if (step == 1) {
      const {  step, basicInfo} = req.body;
      const phone = basicInfo.phone;
      
      // Check if phone number already exists
      const existingSurvey = await Survey.findOne({ phone });
      if (existingSurvey) {
        return res.status(200).json({ 
          message: "Phone number already exists.", 
          surveyId: existingSurvey._id 
        });
      }
      
      const newSurvey = new Survey({
        phone: phone,
        completedSteps: step,
        surveyData: { basicInfo: basicInfo },
      });
      
      const savedSurvey = await newSurvey.save();
      return res.status(200).json({ 
        message: "Survey data saved successfully.", 
        surveyId: savedSurvey._id 
      });
    } 
    
    // STEP 2+: Update an existing survey
    else if (step==2) {
      const { step,data, surveyId, step_name } = req.body;
      console.log(data, surveyId, step_name);
      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found." });
      }
      
      // Update the survey data with the new step data
      survey.surveyData['location'] = data;
      survey.completedSteps = step;
      
      const updatedSurvey = await survey.save();
      return res.status(200).json({ 
        message: "Survey data updated successfully.", 
        surveyId: updatedSurvey._id 
      });
       
    } 
    else if (step==3) {
      const { step,data, surveyId, step_name } = req.body;
      console.log(data, surveyId, step_name);
      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found." });
      }
      
      // Update the survey data with the new step data
      survey.surveyData['currentFoodDetails'] = data;
      survey.completedSteps = step;
      
      const updatedSurvey = await survey.save();
      return res.status(200).json({ 
        message: "Survey data updated successfully.", 
        surveyId: updatedSurvey._id 
      });
       
    } 
    else if (step==4) {
      const { step,data, surveyId, step_name } = req.body;
      console.log(data, surveyId, step_name);
      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found." });
      }
      
      // Update the survey data with the new step data
      survey.surveyData['mealPreferences'] = data;
      survey.completedSteps = step;
      
      const updatedSurvey = await survey.save();
      return res.status(200).json({ 
        message: "Survey data updated successfully.", 
        surveyId: updatedSurvey._id 
      });
       
    } 
    else if (step==5) {
      const { step,data, surveyId, step_name } = req.body;
      console.log(data, surveyId, step_name);
      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found." });
      }
      
      // Update the survey data with the new step data
      survey.surveyData['workHabitats'] = data;
      survey.completedSteps = step;
      
      const updatedSurvey = await survey.save();
      return res.status(200).json({ 
        message: "Survey data updated successfully.", 
        surveyId: updatedSurvey._id 
      });
       
    } 
    else if (step==6) {
      const { step,data, surveyId, step_name } = req.body;
      console.log(data, surveyId, step_name);
      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found." });
      }
      
      // Update the survey data with the new step data
      survey.surveyData['budget'] = data;
      survey.completedSteps = step;
      
      const updatedSurvey = await survey.save();
      return res.status(200).json({ 
        message: "Survey data updated successfully.", 
        surveyId: updatedSurvey._id 
      });
       
    } 
    else if (step==7) {
      const { step,data, surveyId, step_name } = req.body;
      console.log(data, surveyId, step_name);
      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found." });
      }
      
      // Update the survey data with the new step data
      survey.surveyData['customizations'] = data;
      survey.completedSteps = step;
      
      const updatedSurvey = await survey.save();
      return res.status(200).json({ 
        message: "Survey data updated successfully.", 
        surveyId: updatedSurvey._id 
      });
       
    } 
    else if (step==8) {
      const { step,data, surveyId, step_name } = req.body;
      console.log(data, surveyId, step_name);
      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found." });
      }
      const discount_token = await generateToken(survey.phone);
      // Update the survey data with the new step data
      survey.surveyData['recommendations'] = data;
      survey.completedSteps = step;
      survey.discountCode = discount_token;
      
      const updatedSurvey = await survey.save();
      return res.status(200).json({ 
        message: "Survey data updated successfully.", 
        surveyId: updatedSurvey._id ,
        discountCode: discount_token

      });
       
    } 
    
    else {
      return res.status(400).json({ 
        message: "Invalid request. Missing required parameters." 
      });
    }
  } catch (error) {
    console.error("Error in survey operation:", error);
    return res.status(500).json({ 
      message: "Internal server error.", 
      error: error.message 
    });
  }
};

module.exports = { addSurvey,joinWaitlist };