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

// // Register
// router.post('/register', async (req, res) => {
//     const { email, password, confirmPassword } = req.body;

//     try {
//         logger.info(`Request received for /register`);

//         // Create a new user body object with password expiration
//         const userBody = {
//             email,
//             password,
//             confirmPassword,
//             passwordExpiration: new Date(Date.now() + (1 * 60 * 1000))
//         };

//         // Check if user already exists
//         const existingUser = await userModel.findOne({ email });
//         if (existingUser) {
//             return res.status(409).json({ success: false, message: 'This user already exists' });
//         }

//         // Check if password and confirmPassword match
//         if (password !== confirmPassword) {
//             logger.warn(`Password and confirmPassword don't match`);
//             return res.status(400).json({ success: false, message: "Password and confirmPassword don't match" });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         // Create the new user with hashed password and password expiration
//         const newUser = await userModel.create({
//             email: userBody.email,
//             password: hashedPassword,
//             confirmPassword: hashedPassword,
//             passwordExpiration: userBody.passwordExpiration
//         });

//         logger.info(`User registered successfully`);

//        res.json({
//         Status:"Success",
//         data:newUser
//        })

//     } catch (error) {
//         logger.error(`Error during registration:`, error);
//         return res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// });


// const secret = speakeasy.generateSecret();
// console.log(secret);

// router.get('/qrcode', (req, res) => {
//     qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
//         res.send(
//             `<h1>setup authenticator</h1>
//         <h3>use the qr code to your authenticator</h3>
//         <img src=${data_url} > <br>
//         or add manually: ${secret.base32}`
//         );
//     })
// })

// router.post('/verify', (req, res) => {
//     const token = req.body.userToken;
//     console.log(token);
//     const verfied = speakeasy.totp.verify({ secret: secret.base32, encoding: 'base32', token: token });
//     res.json({ success: verfied });
// })

// module.exports=router;