const userModel = require('../models/usermodel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const requestIp = require('request-ip');
const userLogModel = require('../models/userLogModel');
const LogoutLog = require('../models/LogoutLog');
const MicrosoftUserData = require('../models/microsoftUserData');
const Session = require('../models/sessionModel');
const { parseUserAgent } = require('../routes/sessionRoute');
const os = require('os');

// Helper functions for IP handling
const getLocalIPv4 = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (!iface.internal && iface.family === 'IPv4') {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
};

const getIPv4 = (ip) => {
  if (!ip) return ip;
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  if (ip === '::1' || ip === '127.0.0.1') {
    return getLocalIPv4();
  }
  return ip;
};

// Mail Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'nmitsolutions1@gmail.com',
    pass: process.env.EMAIL_PASS || 'qved iuiw ddfe ukng'
  }
});

exports.register = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  const ipAddress = getIPv4(requestIp.getClientIp(req));

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Password and confirmPassword don't match" });
    }

    const existingUser = await userModel.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'This user already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await userModel.create({
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      passwordExpiration: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)) // 90 days default
    });

    await userLogModel.create({ email, ipAddress, status: 'User Registered Successfully' });
    res.json({ status: "SUCCESS", data: newUser });
  } catch (error) {
    await userLogModel.create({ email, ipAddress, status: 'Register Failed: Internal Server Error' });
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = getIPv4(requestIp.getClientIp(req));

    const user = await userModel.findOne({ where: { email } });
    if (!user) {
      await userLogModel.create({ email, ipAddress, status: 'Login Failed: No record found' });
      return res.status(404).json({ success: false, message: 'No record found' });
    }

    // Block inactive or soft-deleted users from logging in
    if (user.isDeleted) {
      await userLogModel.create({ email, ipAddress, status: 'Login Failed: Account has been deactivated' });
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact the administrator.' });
    }

    if (user.status === 'inactive') {
      await userLogModel.create({ email, ipAddress, status: 'Login Failed: Account is inactive' });
      return res.status(403).json({ success: false, message: 'Your account is currently inactive. Please contact the administrator.' });
    }

    let isPasswordValid = await bcrypt.compare(password, user.password);
    
    // Fallback for manually inserted plain-text passwords (e.g. from MongoDB Compass)
    if (!isPasswordValid && password === user.password) {
      isPasswordValid = true;
      // Auto-hash and fix the record for future logins
      const newHash = await bcrypt.hash(password, 12);
      user.password = newHash;
      user.confirmPassword = newHash;
      await user.save();
    }

    if (!isPasswordValid) {
      await userLogModel.create({ email, ipAddress, status: 'Login Failed: Incorrect password' });
      return res.status(401).json({ success: false, message: 'The password is incorrect' });
    }

    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'jwt_secret_key',
      { expiresIn: '1d' }
    );

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const deviceDetails = parseUserAgent(userAgent);

    const sessionRecord = await Session.create({
      userId: user.id,
      email: user.email,
      role: user.role,
      token: jwtToken,
      ipAddress: ipAddress,
      userAgent: userAgent,
      deviceInfo: deviceDetails.device,
      browser: deviceDetails.browser,
      os: deviceDetails.os,
      isActive: true,
      loginAt: new Date(),
      lastActivityAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    let remainingDays = null;
    if (user.passwordExpiration) {
      const daysUntilExpiration = Math.ceil((user.passwordExpiration - Date.now()) / (1000 * 60 * 60 * 24));
      remainingDays = daysUntilExpiration > 0 ? daysUntilExpiration : 0;
    }

    await userLogModel.create({ email, ipAddress, status: 'User Login Successfully' });

    const { password: pass, confirmPassword, ...myuser } = user.toJSON();

    return res.status(200).json({
      success: true,
      jwtToken,
      sessionId: sessionRecord.id,
      user: myuser,
      expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      remainingDays,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.twoFactorSetup = (req, res) => {
  const secret = speakeasy.generateSecret({ name: "KCC App" });
  qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
    if (err) {
      return res.status(500).send("Error generating QR code");
    }
    res.status(200).json({
      qrCode: data_url.replace(/^data:image\/png;base64,/, ''),
      secretBase32: secret.base32
    });
  });
};

exports.verifyOTP = (req, res) => {
  const { userToken, secretBase32 } = req.body;
  const verified = speakeasy.totp.verify({
    secret: secretBase32,
    encoding: 'base32',
    token: userToken,
    window: 1 // Allow for 30 seconds time drift
  });
  res.json({ success: verified });
};

exports.logout = async (req, res) => {
  try {
    const ipAddress = getIPv4(requestIp.getClientIp(req));
    const email = req.user?.email || 'unknown';

    await LogoutLog.create({ email, ipAddress, status: 'Logged Out' });

    if (req.token) {
        await Session.update({ isActive: false }, { where: { token: req.token } });
    }

    res.clearCookie('token').json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "jwt_secret_key", { expiresIn: "1h" });
    
    const mailOptions = {
      from: 'nmitsolutions1@gmail.com',
      to: email,
      subject: 'Reset your Password',
      text: `Click the following link to reset your password: http://localhost:3000/resetpassword/${user.id}/${token}. This link is valid for 1 hour.`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Password reset email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.resetPassword = (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  jwt.verify(token, process.env.JWT_SECRET || "jwt_secret_key", async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    try {
      const hash = await bcrypt.hash(password, 10);
      await userModel.update({ password: hash }, { where: { id } });
      res.status(200).json({ message: "Password Updated Successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating password" });
    }
  });
};

exports.authMicrosoft = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    const axios = require('axios');
    const jwt = require('jsonwebtoken');

    // Fetch Microsoft's public keys
    const { data: keysData } = await axios.get('https://login.microsoftonline.com/common/discovery/v2.0/keys');
    const keys = keysData.keys;

    // Decode the token to get the key ID (kid)
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid) {
      return res.status(400).json({ success: false, message: 'Invalid token header' });
    }

    const kid = decodedHeader.header.kid;
    const key = keys.find(k => k.kid === kid);

    if (!key) {
      return res.status(400).json({ success: false, message: 'Matching key not found' });
    }

    // Convert JWK to PEM format (simplest way is to use the x5c field if available)
    const cert = `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`;

    // Verify the ID Token
    const decodedToken = jwt.verify(token, cert, {
      audience: process.env.MS_CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
      issuer: `https://login.microsoftonline.com/${process.env.MS_TENANT_ID || 'YOUR_TENANT_ID_HERE'}/v2.0`,
      algorithms: ['RS256']
    });

    const { sub: microsoftId, name: displayName } = decodedToken;
    const email = decodedToken.email || decodedToken.preferred_username || decodedToken.upn || decodedToken.unique_name;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email not found in Microsoft token' });
    }

    // Check if user exists in the main user table
    let user = await userModel.findOne({ where: { email } });

    const ipAddress = getIPv4(requestIp.getClientIp(req));

    // Block inactive or soft-deleted users
    if (user && user.isDeleted) {
      await userLogModel.create({ email, ipAddress, status: 'Microsoft Login Failed: Account has been deactivated' });
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact the administrator.' });
    }

    if (user && user.status === 'inactive') {
      await userLogModel.create({ email, ipAddress, status: 'Microsoft Login Failed: Account is inactive' });
      return res.status(403).json({ success: false, message: 'Your account is currently inactive. Please contact the administrator.' });
    }

    if (!user) {
      // Create a new user account if it doesn't exist
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 12);
      
      user = await userModel.create({
        email,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        role: 'user',
        passwordExpiration: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000))
      });
      
      await userLogModel.create({ email, ipAddress, status: 'Microsoft User Registered Successfully' });
    }

    // Save/Update Microsoft user data
    await MicrosoftUserData.upsert({ microsoftId, displayName, email });

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'jwt_secret_key',
      { expiresIn: '1d' }
    );

    // Create a Session
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const deviceDetails = parseUserAgent(userAgent);

    const sessionRecord = await Session.create({
      userId: user.id,
      email: user.email,
      role: user.role,
      token: jwtToken,
      ipAddress: ipAddress,
      userAgent: userAgent,
      deviceInfo: deviceDetails.device,
      browser: deviceDetails.browser,
      os: deviceDetails.os,
      isActive: true,
      loginAt: new Date(),
      lastActivityAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    let remainingDays = null;
    if (user.passwordExpiration) {
      const daysUntilExpiration = Math.ceil((user.passwordExpiration - Date.now()) / (1000 * 60 * 60 * 24));
      remainingDays = daysUntilExpiration > 0 ? daysUntilExpiration : 0;
    }

    await userLogModel.create({ email, ipAddress, status: 'Microsoft User Logged In Successfully' });

    const { password: pass, confirmPassword, ...myuser } = user.toJSON();

    return res.status(200).json({
      success: true,
      jwtToken,
      sessionId: sessionRecord.id,
      user: myuser,
      expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      remainingDays,
    });

  } catch (error) {
    console.error("Microsoft Auth Error:", error);
    res.status(500).json({ success: false, message: 'Internal server error during Microsoft Authentication' });
  }
};


