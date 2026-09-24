// const express = require('express');
// const router = express.Router();



// // Logout 
// router.post('/logout', async (req, res) => {
//     try {
//         // Clear the token cookie by setting it to an empty value and expiring it immediately
//         res.clearCookie('token').send('Logged out successfully');
//     } catch (error) {
//         return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// });

// module.exports=router;