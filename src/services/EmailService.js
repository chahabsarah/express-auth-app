const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

/* ****************************creating SMTP Transporter start***************************** */
var smtpTransport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  transportMethod: "SMTP",
  port: 465,
//ensuring email security using TLS connexion
  secure: true,
//authentication details
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
 // useful when working with self-signed certificate
    rejectUnauthorized: false
  },
});
smtpTransport.verify((error) => {
  if (error) {
    console.error('SMTP Error:', error);
  } else {
    console.log('SMTP Server ready');
  }
});
/* ****************************creating SMTP Transporter end***************************** */

/* ****************************sending verification Email start*************************** */
async function sendVerificationCode(email, code) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    //recipient's email 
    to:email,
    subject: 'Email Verification',
    text: `Your verification code is: ${code}`,
  };
//sendMail is a method of  smtpTransport  object
  await smtpTransport.sendMail(mailOptions);
}
/* ****************************sending verification Email end*************************** */

/* *****************reset password email alert start**************************** */
async function updatePasswordAlert(email) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to:email,
    subject: 'Updated Password',
    text: `your password has been updated!`,
  };
//sendMail is a method of  smtpTransport  object
  await smtpTransport.sendMail(mailOptions);
}
/* *****************reset password email alert end**************************** */

/* **********************email to help reset password start******************* */
async function forgotPasswordReset(email,recoverPassword) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to:email,
    subject: 'New Password',
    text: `this is your new password: ${recoverPassword}`,
  };
//sendMail is a method of  smtpTransport  object
  await smtpTransport.sendMail(mailOptions);
}
/* **********************email to help reset password end******************* */



module.exports = { sendVerificationCode,updatePasswordAlert,forgotPasswordReset};
