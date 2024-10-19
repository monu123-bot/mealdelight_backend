const Otp = require("../Models/Otp");
const https = require('follow-redirects').https;
const fs = require('fs');
const crypto = require('crypto');
const User = require("../Models/User");
// Utility function to generate a random 4-digit OTP
const generateOtp = () => {
    return crypto.randomInt(1000, 9999); // Generates a 4-digit OTP
};

// Simulated SMS service function to send OTP
const sentSMS = async (otp, phone) => {
    var options = {
        'method': 'POST',
        'hostname': 'your-sms-service.com', // Replace with your SMS service base URL
        'path': '/2fa/2/pin?ncNeeded=true',
        'headers': {
            'Authorization': 'Bearer your-authorization-token', // Add your authorization token
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        'maxRedirects': 20
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, function (res) {
            let chunks = [];

            res.on('data', function (chunk) {
                chunks.push(chunk);
            });

            res.on('end', function () {
                const body = Buffer.concat(chunks);
                console.log(body.toString());
                resolve(body.toString());
            });

            res.on('error', function (error) {
                console.error(error);
                reject(error);
            });
        });

        const postData = JSON.stringify({
            "applicationId": "1234567", // Replace with your actual app ID
            "messageId": "7654321", // Replace with your actual message ID
            "from": "YourServiceName", // Sender name or number
            "to": phone, // The phone number receiving the OTP
            "placeholders": {
                "otp": otp // OTP placeholder sent to user
            }
        });

        req.write(postData);
        req.end();
    });
};
const isPhoneValid = (val)=>{
    if(!val){
        return false
    }
    // Remove spaces, dashes, or parentheses (common formatting symbols)
  const sanitizedVal = val.replace(/[\s\-()]/g, '');

  // Regular expression to validate 10-digit Indian phone number starting with 6-9
  const phoneRegex = /^[6-9]\d{9}$/;

  // Optional country code (+91) with 10-digit phone number
  const phoneWithCountryCodeRegex = /^(\+91)?[6-9]\d{9}$/;

  // Log the value being checked (for debugging purposes)
//   console.log(sanitizedVal);

  // Check if phone number is valid with or without country code
  if (phoneWithCountryCodeRegex.test(sanitizedVal)) {
    return true;
  }

  return false;
  }
// Controller to send OTP
const sentOtp = async (req, res) => {
    const { phone } = req.body;

    // Check if the phone number is provided
    if (!phone) {
        return res.status(400).json({ msg: 'Phone number is required.' });
    }

    // Validate phone number format according to Indian standards
    const isValidPhone = isPhoneValid(phone); // Assuming you have the `isPhoneValid` function from before
    if (!isValidPhone) {
        return res.status(400).json({ msg: 'Invalid phone number format.' });
    }

    try {
        // Check if the phone number is already registered in the database
        const existingUser = await User.findOne({ phone: phone });
        if (existingUser) {
            return res.status(201).json({ msg: 'Phone number already registered.' });
        }

        // Generate OTP and expiration time (5 minutes from now)
        const otp = generateOtp(); // Assuming this function generates an OTP
        const expireAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

        console.log('Sending OTP to phone:', phone, otp);

        // Send OTP via SMS
        // Uncomment the line below when you have the actual SMS sending service integrated
        // await sentSMS(otp, phone);

        // Store OTP in the database with phone and expiration time
        const otpData = new Otp({
            phone: phone, // Associate the OTP with the phone number
            otp: otp,
            expireAt: expireAt
        });

        const resp = await otpData.save(); // Save OTP and phone to the database

        // Respond with success and OTP details (in a real system, you wouldn't send the OTP in the response)
        res.status(200).json(resp);
    } catch (error) {
        console.error('Error in sending OTP:', error);
        res.status(500).json({ msg: 'Error in sending OTP from backend.' });
    }
};

const verifyOtp = async(req,res)=>{
    const id = req.body.id
    const otp = req.body.otp
    console.log(id,otp)
    try {
        const resp = await Otp.findOne({_id:id})
        console.log(resp.otp,otp,resp)
       if (resp.otp==otp){
        res.status(200).json({msg:"verified"})
       }
       else{
        res.status(201).json({msg:"Wrong OTP"})
       }
    } catch (error) {
        console.log(error)
        res.status(400).json({msg:"backend errorin verification "})
    }

}

module.exports = {sentOtp,verifyOtp}