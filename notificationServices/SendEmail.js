const nodemailer = require('nodemailer');

const sendEmail = async (receiverEmail, subject, text, html,senderemail,senderKey) => {
  console.log('inside send email', receiverEmail);

  try {
    // Create a transporter object
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // use SSL
      auth: {
        user: senderemail,
        pass: senderKey,
      },
    });

    // Configure the mail options object
    const mailOptions = {
      from: process.env.EMAIL,
      to: receiverEmail,
      subject: subject,
      text: text,
      html: html,
    };

    // Convert the callback-based sendMail function to a Promise-based one
    const info = await transporter.sendMail(mailOptions);
    console.log('email sent success:', info.response);
    return true;
  } catch (error) {
    console.log('error in sending email:', error);
    return false;
  }
};

module.exports = sendEmail;