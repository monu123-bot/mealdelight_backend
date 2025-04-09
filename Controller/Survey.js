const Survey = require("../Models/Survey");
const mongoose = require("mongoose");
const Waitlist = require("../Models/Waitlist");
// const sendEmail = require("../notificationServices/SendEmail");
const  sendEmail  = require("../notificationServices/SendEmail");


const getSurveyById = async (req, res) => {

  try {
    const { surveyId } = req.params;

    if (!surveyId) {
      return res.status(400).json({ message: "Survey ID is required." });
    }

    const survey = await Survey.findById(surveyId);

    if (!survey) {
      return res.status(404).json({ message: "Survey not found." });
    }

    res.status(200).json(survey);
  } catch (error) {
    console.error("Error fetching survey:", error);
    res.status(500).json({ message: "Server error fetching survey data." });
  }
}

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
      console.log(basicInfo)
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
      // const COUPON_LINK = `${process.env.CLIENT_URL}/survey/continue/${savedSurvey._id}`;
      const COUPON_LINK = `${process.env.CLIENT_URL}/survey/continue/${savedSurvey._id}`;

      const recieverrsEmail = basicInfo.email;
      const subject = "Survey Started Successfully";
      const text = "Thankyou";
      const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Survey Initiated</title>
      </head>
      <body style="margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f5f7fa; color:#333333;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background:#ffffff; border-radius:6px; overflow:hidden;">
          <tr>
            <td style="padding:25px 20px; text-align:center; background-color:#fdf6ed;">
              <h1 style="color:#d47d35; margin:0; font-size:24px;">Survey Initiated</h1>
              <p style="font-size:16px; margin-top:10px;">Thank you for sharing your thoughts with Meal Delight</p>
            </td>
          </tr>
      
          <tr>
            <td style="padding:25px 30px;">
              <p style="font-size:16px; line-height:1.5; margin:10px 0;">Survey Reference: <span style="color:#d47d35;">${savedSurvey._id}</span></p>
              <p style="font-size:16px; line-height:1.5; margin:15px 0;">We value your input and appreciate you taking the time to start this survey. Complete all sections to receive your special discount code.</p>
              
              <p style="font-size:16px; line-height:1.5; margin:15px 0;">Your feedback helps us improve our meal offerings and provide better service.</p>
              
              <div style="text-align:center; margin:25px 0 15px 0;">
                <a href="${COUPON_LINK}" style="background-color:#d47d35; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:4px; font-weight:bold; display:inline-block; font-size:16px;">Continue Your Survey</a>
              </div>
              
              <p style="font-size:14px; line-height:1.5; margin:20px 0 10px; color:#666666;">
                You can return to complete your survey at any time within the next 7 days.
              </p>
            </td>
          </tr>
      
           <!-- Footer -->
    <tr>
      <td style="background-color:#f7f7f7; padding:20px; text-align:center; border-top:1px solid #eeeeee;">
        <p style="margin:0 0 10px; font-size:14px; color:#666666;">Thank you for your participation,</p>
        <p style="margin:0; font-size:14px; color:#2e8b57;">Meal Delight Team</p>
        <p style="margin:15px 0 0; font-size:12px; color:#999999;">
          Meal Delight Inc., Sec 28 Gurugram, Haryana, India<br>
          <a href="https://www.themealdelight.in" style="color:#999999;">www.themealdelight.in</a><br>
        </p>
        <p style="margin:5px 0 0; font-size:12px; color:#999999;">
          <a href="mailto:survey@themealdelight.in?subject=unsubscribe" style="color:#999999;">Unsubscribe</a> | 
          <a href="{{PRIVACY_POLICY_LINK}}" style="color:#999999;">Privacy Policy</a>
        </p>
      </td>
    </tr>
        </table>
      </body>
      </html>
      `;
      const emailSent = await sendEmail(recieverrsEmail, subject, text, html,process.env.SURVEY_EMAIL,process.env.SURVEY_EMAILSMTPGOOGLEKEY);
      if (!emailSent) {
        console.error("Failed to send email.");
        // return res.status(500).json({ message: "Failed to send email." });
      }
      else{
        console.log("Email sent successfully.");
      }
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
      const recieverrsEmail = updatedSurvey.surveyData.basicInfo.email;
      const subject = "Survey Completed Successfully";
      const text = "Thankyou";
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Survey Confirmation</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f7fa; font-family:Arial, sans-serif; color:#333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background-color:#ffffff; border-radius:6px; overflow:hidden;">
    
    <!-- Header -->
    <tr>
      <td style="background-color:#f0f7f0; padding:25px 20px; text-align:center;">
        <h1 style="color:#2e8b57; margin:0; font-size:24px;">Survey Confirmation</h1>
        <p style="font-size:16px; margin-top:10px;">Thank you for completing your feedback with Meal Delight</p>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding:25px 30px;">
        <p style="font-size:16px; line-height:1.5; margin:10px 0;">Survey Reference: <span style="color:#2e8b57;">${updatedSurvey._id}</span></p>
        <p style="font-size:16px; line-height:1.5; margin:15px 0;">We appreciate your input which helps us improve our service quality.</p>
        <p style="font-size:16px; line-height:1.5; margin:15px 0;">Please find your appreciation discount code below:</p>
        
        <div style="background-color:#f7fbf7; padding:15px; text-align:center; border-radius:5px; font-size:18px; font-weight:bold; color:#2e8b57; border:1px solid #dee2e6; margin:20px 0;">
          ${survey.discountCode}
        </div>

        
        
        <p style="font-size:14px; line-height:1.5; margin:20px 0 10px; color:#666666;">
          This discount code is valid for 30 days from today. Please contact us if you have any questions.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color:#f7f7f7; padding:20px; text-align:center; border-top:1px solid #eeeeee;">
        <p style="margin:0 0 10px; font-size:14px; color:#666666;">Thank you for your participation,</p>
        <p style="margin:0; font-size:14px; color:#2e8b57;">Meal Delight Team</p>
        <p style="margin:15px 0 0; font-size:12px; color:#999999;">
          Meal Delight Inc., Sec 28 Gurugram, Haryana, India<br>
          <a href="https://www.themealdelight.in" style="color:#999999;">www.themealdelight.in</a><br>
        </p>
        <p style="margin:5px 0 0; font-size:12px; color:#999999;">
          <a href="mailto:survey@themealdelight.in?subject=unsubscribe" style="color:#999999;">Unsubscribe</a> | 
          <a href="{{PRIVACY_POLICY_LINK}}" style="color:#999999;">Privacy Policy</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

      const emailSent = await sendEmail(recieverrsEmail, subject, text, html,process.env.CEO_EMAIL,process.env.CEO_EMAILSMTPGOOGLEKEY);
      const emailSentToAdmin = await sendEmail('monudixit0007@gmail.com', "new survey submitted", "one more survey", `<p>Survey from : ${recieverrsEmail} Survey ID: ${updatedSurvey._id}</p>`,process.env.SURVEY_EMAIL,process.env.SURVEY_EMAILSMTPGOOGLEKEY);
      if (!emailSent) {
        console.error("Failed to send email.");
        // return res.status(500).json({ message: "Failed to send email." });
      }
      else{
        console.log("Email sent successfully.");
      }

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


const sendSurveyCompletedNotification = async (req, res) => {
 

  try {
    // Find all surveys with incomplete steps
    const incompleteSurveys = await Survey.find({ completedSteps: { $lt: 7 } });

    if (!incompleteSurveys.length) {
      return res.status(200).json({ message: "All surveys are completed." });
    }

    // Send customized email to each user
    for (const survey of incompleteSurveys) {
      const { phone, surveyData, _id } = survey;
      const email = surveyData?.basicInfo?.email;
      const name = surveyData?.basicInfo?.fullName || "there";

      // Skip if email is not available
      if (!email) continue;
      const surveyLink = `${process.env.CLIENT_URL}/survey/continue/${survey._id}`;

      const subject = "Complete Your Meal Preference Survey";
      const text = `Hi ${name},\n\nWe noticed you haven’t completed your survey yet. Your responses help us better understand your meal preferences. Click the link below to finish it:\n\n${surveyLink}\n\nThank you!`;
      const html = `
        <!DOCTYPE html>
<html>
<head>
  <style>
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f9f9f9;
      margin: 0;
      padding: 20px;
      color: #333;
    }

    .container {
      max-width: 600px;
      margin: auto;
      background-color: #ffffff;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      animation: fadeIn 1s ease-in-out;
    }

    h2 {
      color: #2f855a;
      animation: pulse 1.5s infinite ease-in-out;
    }

    p {
      font-size: 16px;
      line-height: 1.6;
    }

    .btn {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 25px;
      background-color: #28a745;
      color: #fff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      transition: background-color 0.3s ease, transform 0.2s ease;
      animation: fadeIn 1s ease-in-out;
    }

    .btn:hover {
      background-color: #218838;
      transform: scale(1.05);
    }

    .footer {
      font-size: 13px;
      color: #888;
      margin-top: 30px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Hi ${name},</h2>
    <p>We noticed you haven’t completed your <strong>Meal Preference Survey</strong> yet.</p>
    <p>Your insights help us customize meals just for you — healthier, tastier, and right on your budget.</p>
    <p>Click the button below to complete the survey and unlock personalized recommendations!</p>
    <a href="${surveyLink}" target="_blank" class="btn">Complete Survey Now</a>
    <p class="footer">Thank you for your time and support! 🍽️</p>
  </div>
</body>
</html>
      `;

      await sendEmail(email, subject, text, html);
    }

    return res.status(200).json({ message: "Reminder emails sent to incomplete survey users." });
  } catch (error) {
    console.error("Error sending survey notifications:", error);
    return res.status(500).json({ message: "Failed to send survey completion notifications." });
  }
  

}
module.exports = { addSurvey,joinWaitlist,getSurveyById,sendSurveyCompletedNotification };