// const nodemailer=require('nodemailer');
// const dotenv = require('dotenv');
// dotenv.config({path: './config.env'});
// // Set up Nodemailer transporter
// const sendEmail = async (option) =>{
//     //create a transporter
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port:process.env.EMAIL_PORT,
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.PASSWORD
//         },
//       });
//  const emailOptions = {
//     from:'password Reset<resetpassword@password.com>',
//     to:option.email,
//     subject:option.subject,
//     text:option.message
//  }
//  await transporter.sendMail(emailOptions); 
// }


//   module.exports = sendEmail;