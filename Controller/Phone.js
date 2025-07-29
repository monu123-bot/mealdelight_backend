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

const sendOtp = async (req, res) => {
    const { phone } = req.body;

    // Validate phone input
    if (!phone) {
        return res.status(400).json({ msg: 'Phone number is required.' });
    }

    // Validate phone number format
    if (!isPhoneValid(phone)) {
        return res.status(400).json({ msg: 'Invalid phone number format.' });
    }

    try {
        // Check if the phone number is already registered
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(201).json({ msg: 'Phone number already registered.' });
        }

        // Generate OTP and set expiration time (5 minutes from now)
        const otp = generateOtp();
        const expireAt = Date.now() + 5 * 60 * 1000;

        console.log('Sending OTP to phone:', phone, otp);

        // Send OTP via Infobip API (WhatsApp message template)
        const options = {
            method: 'POST',
            hostname: 'mm55k6.api.infobip.com',
            path: '/whatsapp/1/message/template',
            headers: {
                Authorization: 'App 314cf76906e6e8c0b058df3319ca0943-66cd03b4-5ccf-44b1-9562-0649a4d5ff43',
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            maxRedirects: 20
        };

        const postData = JSON.stringify({
            messages: [
                {
                    from: '447860099299',
                    to: `91${phone}`,
                    messageId: 'fc83b2b3-1fe0-45e5-9608-6174db09578d',
                    content: {
                        templateName: 'test_whatsapp_template_en',
                        templateData: {
                            body: {
                                placeholders: [`${otp} is your OTP for Meal delight` ]
                            }
                        },
                        language: 'en'
                    }
                }
            ]
        });

        const apiRequest = https.request(options, (apiResponse) => {
            let chunks = [];

            apiResponse.on('data', (chunk) => {
                chunks.push(chunk);
            });

            apiResponse.on('end', () => {
                const body = Buffer.concat(chunks);
                console.log('Infobip response:', body.toString());
            });

            apiResponse.on('error', (error) => {
                console.error('Error from Infobip:', error);
            });
        });

        apiRequest.write(postData);
        apiRequest.end();

        // Store OTP and expiration in the database
        const otpData = new Otp({
            phone,
            otp,
            expireAt
        });

        const savedOtp = await otpData.save();

        // Respond with success message (do not send OTP in production response)
        res.status(200).json({ msg: 'OTP sent successfully', otpId: savedOtp._id });
    } catch (error) {
        console.error('Error in sending OTP:', error);
        res.status(500).json({ msg: 'Error in sending OTP from backend.' });
    }
};

const sendOtp_f = async (req, res) => {
    const { phone } = req.body;

    // Validate phone input
    if (!phone) {
        return res.status(400).json({ msg: 'Phone number is required.' });
    }

    // Validate phone number format
    if (!isPhoneValid(phone)) {
        return res.status(400).json({ msg: 'Invalid phone number format.' });
    }

    try {
        // Check if the phone number is already registered
        const existingUser = await User.findOne({ phone });
        

        // Generate OTP and set expiration time (5 minutes from now)
        const otp = generateOtp();
        const expireAt = Date.now() + 5 * 60 * 1000;

        console.log('Sending OTP to phone:', phone, otp);

        // Send OTP via Infobip API (WhatsApp message template)
        const options = {
            method: 'POST',
            hostname: 'mm55k6.api.infobip.com',
            path: '/whatsapp/1/message/template',
            headers: {
                Authorization: 'App 314cf76906e6e8c0b058df3319ca0943-66cd03b4-5ccf-44b1-9562-0649a4d5ff43',
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            maxRedirects: 20
        };

        const postData = JSON.stringify({
            messages: [
                {
                    from: '447860099299',
                    to: `91${phone}`,
                    messageId: 'fc83b2b3-1fe0-45e5-9608-6174db09578d',
                    content: {
                        templateName: 'test_whatsapp_template_en',
                        templateData: {
                            body: {
                                placeholders: [`${otp} is your OTP for Meal delight` ]
                            }
                        },
                        language: 'en'
                    }
                }
            ]
        });

        const apiRequest = https.request(options, (apiResponse) => {
            let chunks = [];

            apiResponse.on('data', (chunk) => {
                chunks.push(chunk);
            });

            apiResponse.on('end', () => {
                const body = Buffer.concat(chunks);
                console.log('Infobip response:', body.toString());
            });

            apiResponse.on('error', (error) => {
                console.error('Error from Infobip:', error);
            });
        });

        apiRequest.write(postData);
        apiRequest.end();

        // Store OTP and expiration in the database
        const otpData = new Otp({
            phone,
            otp,
            expireAt
        });

        const savedOtp = await otpData.save();

        // Respond with success message (do not send OTP in production response)
        res.status(200).json({ msg: 'OTP sent successfully', otpId: savedOtp._id });
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

module.exports = {sendOtp,verifyOtp,sendOtp_f}