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
const addSurvey = async (req, res) => {
  try {
    const { step, surveyId, step_name, data, basicInfo } = req.body;
    console.log("Request body:", req.body);
    
    // STEP 1: Create a new survey
    if (step == 1 && basicInfo) {
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
    else if (surveyId && step_name && data) {
      // Validate survey ID
      if (!mongoose.Types.ObjectId.isValid(surveyId)) {
        return res.status(400).json({ message: "Invalid survey ID." });
      }
      
      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found." });
      }
      
      // Build the update object using MongoDB dot notation
      const updateData = {};
      updateData[`surveyData.${step_name}`] = data;
      
      console.log("Updating survey with:", {
        surveyId,
        step_name,
        updateData
      });
      
      // Use findByIdAndUpdate with MongoDB update operators
      const updatedSurvey = await Survey.findByIdAndUpdate(
        surveyId,
        {
          $set: updateData,
          $max: { completedSteps: step } // Only increase if new step is higher
        },
        { new: true, runValidators: true }
      );
      
      if (!updatedSurvey) {
        return res.status(500).json({ message: "Failed to update survey." });
      }
      
      return res.status(200).json({ 
        message: "Survey data updated successfully.",
        surveyId: updatedSurvey._id,
        completedSteps: updatedSurvey.completedSteps
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