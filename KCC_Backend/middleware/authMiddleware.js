const jwt = require('jsonwebtoken');
const Session = require('../models/sessionModel');

// Verify JWT token and check if session is active in DB
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        // Support both "Bearer <token>" and bare token formats
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

        // Verify JWT signature and expiry
        const decoded = jwt.verify(token, 'jwt_secret_key');

        // Check if session exists and is active in DB
        const session = await Session.findOne({ where: { token, isActive: true } });
        if (!session) {
            return res.status(401).json({ 
                success: false, 
                message: 'Session has been revoked or expired',
                sessionRevoked: true
            });
        }

        // Update last activity timestamp
        session.lastActivityAt = new Date();
        await session.save();

        // Attach decoded user info and session to request
        req.user = decoded;
        req.sessionDoc = session;
        req.token = token;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            // Mark session as inactive if token expired
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
            if (token) {
                await Session.update({ isActive: false }, { where: { token } });
            }
            return res.status(401).json({ success: false, message: 'Token has expired' });
        }
        return res.status(403).json({ success: false, message: 'Failed to authenticate token' });
    }
};

// Admin-only middleware - must be used after verifyToken
const requireAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
};

module.exports = { verifyToken, requireAdmin };
