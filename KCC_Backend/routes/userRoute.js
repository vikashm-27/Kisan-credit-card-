// const express = require('express');
// const router = express();
// const User=require('../models/User');



// // Route handler to handle Google login
// router.post('/login/google', async (req, res) => {
//     const { access_token } = req.body;
  
//     try {
//       // Fetch user data from Google using the access token
//       const googleResponse = await axios.get('http://localhost:4005/login/google', {
//         headers: {
//           Authorization: `Bearer ${access_token}`
//         }
//       });
  
//       // Extract email from the Google response
//       const { email } = googleResponse.data;
  
//       // Save user data to the database
//       const user = new User({
//         email,
//         token: access_token
//       });
//       await user.save();
  
//       // Respond with success
//       res.json({ success: true });
//     } catch (error) {
//       console.error("Error logging in with Google:", error);
//       // Respond with error
//       res.status(500).json({ success: false, error: "An error occurred while logging in with Google" });
//     }
//   });