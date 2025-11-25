require('dotenv')
	.config('../../.env');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const nodemailer = require('nodemailer');

// Create an SES client instance
const sesClient = new SESClient({
  region: process.env.AWS_REGION, // Make sure to set your AWS region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Create a Nodemailer transport using SES
const transporter = nodemailer.createTransport({
  SES: { ses: sesClient, aws: require('@aws-sdk/client-ses') },
});

// Send an email using the transporter
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // Your verified SES email address
      to,
      subject,
      html,
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
