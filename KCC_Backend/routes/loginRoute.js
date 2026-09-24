// const express = require('express');
// const router = express.Router();
// const userModel = require('../models/usermodel');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// const winston = require('winston');
// const generatePassword = require('generate-password');
// const cron = require('node-cron');
// const qrcode = require('qrcode');
// const speakeasy = require('speakeasy');
// const UserVerification = require("./../models/UserOTPVerification");
// const crypto = require('crypto');
// const UserOTPVerification = require('./../models/UserOTPVerification');
// const User = require('../models/usermodel');
// const verifyToken = require('./authMiddileware');


// // Configure the Winston logger
// const logger = winston.createLogger({
//     transports: [
//         new winston.transports.Console({
//             format: winston.format.combine(
//                 winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//                 winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
//             ),
//         }),
//     ],
// });



// // Function to send password reset email
// const sendPasswordResetEmail = async (email, userId, token) => {
//     try {
//         var transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: 'nmitsolutions1@gmail.com',
//                 pass: 'qved iuiw ddfe ukng'
//             }
//         });

//         var mailOptions = {
//             from: 'nmitsolutions1@gmail.com',
//             to: email,
//             subject: 'Reset your Password',
//             text: `Click the following link to reset your password: http://localhost:4005/resetpassword/${userId}/${token} This reset password link is valid for 1 day.`
//         };

//         await transporter.sendMail(mailOptions);
//         logger.info(`Password reset email sent to ${email}`);
//     } catch (error) {
//         logger.error(`Error sending password reset email to ${email}: ${error.message}`);
//         throw error; // Re-throw the error to handle it outside this function
//     }
// };

// // Schedule the reminder emails to be sent every day at midnight
// cron.schedule('0 0 * * *', () => {
//     sendReminderEmails();
// });

// const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//         user: 'nmitsolutions1@gmail.com',
//         pass: 'qved iuiw ddfe ukng' 
//     }
// });

// // Function to send OTP verification email
// const sendOTPVerificationEmail = async ({ _id, email }, res) => {
//     try {
//         // Generate OTP
//         const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
//         // Hash the OTP
//         const hashedOTP = await bcrypt.hash(otp, 10);
//         // Create OTP record
//         const newOTPVerification = await UserOTPVerification({
//             userId: _id,
//             otp: hashedOTP,
//             createdAt: Date.now(),
//             expiresAt: Date.now() + 3600000, // OTP expires in 1 hour
//         });
//         // Save OTP record
//         await newOTPVerification.save();
//         // Send OTP email
//         const mailOtpOptions = {
//             from: "nmitsolutions1@gmail.com",
//             to: email,
//             subject: "Verify Your Email",
//             html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the Signup process</p>
//                    <p>This code <b>expires in 1 hour</b>.</p>`
//         };
//         await transporter.sendMail(mailOtpOptions);
//         res.json({
//             status: "PENDING",
//             message: "Verification OTP email sent",
//             data: {
//                 userId: _id,
//                 email,
//             },
//         });
//     } catch (error) {
//         res.json({
//             status: "FAILED",
//             message: error.message,
//         });
//     }
// };

// // Login
// router.post('/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         logger.info(`Request received for /login`);

   
//         // Find the user in the database
//         const user = await userModel.findOne({ email });

//         if (!user) {
//             logger.warn(`No record found for email: ${email}`);
//             return res.status(404).json({ success: false, message: 'No record found' });
//         }

//         // Compare the provided password with the hashed password stored in the database using bcrypt.compare
//         const isPasswordValid = await bcrypt.compare(password, user.password);

//         if (!isPasswordValid) {
//             logger.warn(`The password is incorrect`);
//             return res.status(401).json({ success: false, message: 'The password is incorrect' });
//         }

//                  // Send OTP verification email
//     // sendOTPVerificationEmail(user, res);
//         // Generate JWT token for authentication
//         const jwtToken = jwt.sign({ email: user.email }, 'jwt_secret_key', { expiresIn: '1d' });

//         // Calculate remaining days before password expiration
//         let remainingDays = null;
//         if (user.passwordExpiration) {
//             const daysUntilExpiration = Math.ceil((user.passwordExpiration - Date.now()) / (1000 * 60 * 60 * 24));
//             remainingDays = daysUntilExpiration > 0 ? daysUntilExpiration : 0;
//         }

//         // Send success response with token, user data, expiration time, and remaining days before password expiration
//         return res.status(200).json({
//             success: true,
//             jwtToken,
//             user,
//             expirationTime: new Date() + (1 * 60 * 1000),
//             remainingDays,
            
//         });
//     } catch (error) {
//         logger.error(`Error during login: ${error.message}`);
//         return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// });

// //verifyOTP
// router.post('/verifyOTP', async (req, res) => {
//     try {
//         let { userId, otp } = req.body;
//         if (!userId || !otp) {
//             throw Error("Empty otp details are not allowed");
//         } else {
//             const UserOTPVerificationRecords = await UserOTPVerification.find({
//                 userId,
//             });
//             if (UserOTPVerificationRecords.length <= 0) {
//                 //no record found
//                 throw new Error(
//                     "Account record doesn't exist or has been verified already.Please sign up or log in"
//                 )
//             } else {
//                 //user otp record exists
//                 const { expiresAt } = UserOTPVerificationRecords[0];
//                 const hashedOTP = UserOTPVerificationRecords[0].otp;
//                 if (expiresAt < Date.now()) {
//                     //user otp record has expired
//                     await UserOTPVerification.deleteMany({ userId });
//                     throw new Error("Code has expired.Please request again");
//                 }
//                 else {
//                     const validOTP = await bcrypt.compare(otp, hashedOTP);
//                     if (!validOTP) {
//                         //supplied otp is wrong
//                         throw new Error("Invalid code Passed.check your inbox");
//                     } else {
//                         //Success
//                         User.updateOne({ _id: userId }, { verified: true });
//                         UserOTPVerification.deleteMany({ userId });
//                         res.json({
//                             status: "VERIFIED",
//                             message: `user email verified Successfully.`,
//                         })
//                     }
//                 }
//             }

//         }
//     } catch (error) {
//         res.json({
//             status: "FAILED",
//             message: error.message,
//         })
//     }
// });


// //resend verification
// router.post('/resendOTPVerification',async (req,res)=>{
//     try{
//         let { userId,email } = req.body;
//         if(!userId || !email){
//             throw Error("Empty user details are not allowed");
//         }else{
//             //delete existing records and resend
//             await UserOTPVerification.deleteMany({userId});
//             sendOTPVerificationEmail({_id:userId,email},res);
//         }
//     }catch(error){
//         res.json({
//             status:"FAILED",
//             message:error.message,
//         })
//     }
// });

// // Forgot password
// router.post("/forgotpassword", (req, res) => {
//     const { email } = req.body;
//     userModel.findOne({ email: email })
//         .then(user => {
//             if (!user) {
//                 return res.status(404).json({ success: false, message: 'User not found' });
//             }

//             const token = jwt.sign({ id: user._id }, "jwt_secret_key", { expiresIn: "120s" })
//             // Call the sendPasswordResetEmail function with user ID and token
//             sendPasswordResetEmail(user.email, user._id, token);

//             return res.status(200).json({ success: true, message: 'Password reset email sent successfully' });
//         })
//         .catch(error => {
//             logger.error('Error:', error);
//             return res.status(500).json({ success: false, message: 'Internal Server Error' });
//         });
// });

// // Reset password
// router.post('/resetpassword/:id/:token', async (req, res) => {
//     const { id, token } = req.params;
//     const { oldPassword, newPassword } = req.body;

//     try {
//         // Verify the JWT token
//         const decoded = jwt.verify(token, "jwt_secret_key");

//         // Check if the token is expired
//         if (decoded.exp < Date.now() / 1000) {
//             return res.status(401).json({ success: false, message: 'Password reset link has expired' });
//         }

//         // Find the user by ID
//         const user = await userModel.findById(id);

//         // Check if the user exists
//         if (!user) {
//             return res.status(404).json({ success: false, message: 'User not found' });
//         }

//         // Check if the provided old password matches the current password
//         const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
//         if (!isPasswordValid) {
//             return res.status(401).json({ success: false, message: 'Invalid old password' });
//         }

//         // Check if the old password is the same as the new password
//         const isNewPasswordSameAsOld = await bcrypt.compare(newPassword, user.password);
//         if (isNewPasswordSameAsOld) {
//             return res.status(400).json({ success: false, message: 'New password must be different from old password' });
//         }

//         // Hash the new password
//         const hashedPassword = await bcrypt.hash(newPassword, 12);

//         // Update the user's password in the database
//         user.password = hashedPassword;
//         await user.save();

//         return res.status(200).json({ success: true, message: 'Password updated successfully' });
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ success: false, message: 'JWT token expired' });
//     }
// });

// //Protected Route
// // router.get('/protectedRoute', verifyToken, (req, res) => {
// //     // The middleware verifyToken will validate the token before reaching this point
// //     res.json({ success: true, message: 'You have access to this protected route' });
// // });

// // Logout 
// router.post('/logout', async (req, res) => {
//     try {
//         // Clear the token cookie by setting it to an empty value and expiring it immediately
//         res.clearCookie('token').send('Logged out successfully');
//     } catch (error) {
//         return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// });

// module.exports = router;


