const express = require('express');
const router = express.Router();
const Session = require('../models/sessionModel');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Helper to parse user agent string into readable info
const parseUserAgent = (userAgent) => {
    if (!userAgent) return { browser: 'Unknown', os: 'Unknown', device: 'Unknown Device' };

    let browser = 'Unknown Browser';
    let os = 'Unknown OS';
    let device = 'Desktop';

    // Detect browser
    if (userAgent.includes('Edg/') || userAgent.includes('Edge/')) {
        browser = 'Microsoft Edge';
    } else if (userAgent.includes('OPR/') || userAgent.includes('Opera/')) {
        browser = 'Opera';
    } else if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) {
        browser = 'Google Chrome';
    } else if (userAgent.includes('Firefox/')) {
        browser = 'Mozilla Firefox';
    } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
        browser = 'Safari';
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
        browser = 'Internet Explorer';
    }

    // Detect OS
    if (userAgent.includes('Windows NT 10.0')) {
        os = 'Windows 10/11';
    } else if (userAgent.includes('Windows NT 6.3')) {
        os = 'Windows 8.1';
    } else if (userAgent.includes('Windows NT 6.1')) {
        os = 'Windows 7';
    } else if (userAgent.includes('Windows')) {
        os = 'Windows';
    } else if (userAgent.includes('Mac OS X')) {
        os = 'macOS';
    } else if (userAgent.includes('Android')) {
        os = 'Android';
        device = 'Mobile';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        os = 'iOS';
        device = userAgent.includes('iPad') ? 'Tablet' : 'Mobile';
    } else if (userAgent.includes('Linux')) {
        os = 'Linux';
    }

    // Check for mobile
    if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
        device = 'Mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
        device = 'Tablet';
    }

    return {
        browser,
        os,
        device: `${device} - ${os}`
    };
};

// GET /sessions - Admin only: Get all active sessions
router.get('/sessions', verifyToken, requireAdmin, async (req, res) => {
    try {
        const sessions = await Session.findAll({ where: { isActive: true }, order: [['loginAt', 'DESC']], attributes: { exclude: ['token'] } }); // Don't expose tokens

        res.status(200).json({
            success: true,
            sessions,
            totalSessions: sessions.length
        });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ success: false, message: 'Error fetching sessions' });
    }
});

// GET /sessions/all - Admin only: Get all sessions (active + inactive)
router.get('/sessions/all', verifyToken, requireAdmin, async (req, res) => {
    try {
        const sessions = await Session.findAll({ order: [['loginAt', 'DESC']], attributes: { exclude: ['token'] } });

        res.status(200).json({
            success: true,
            sessions,
            totalSessions: sessions.length
        });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ success: false, message: 'Error fetching sessions' });
    }
});

// GET /sessions/user/:userId - Admin only: Get sessions for a specific user
router.get('/sessions/user/:userId', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const sessions = await Session.findAll({ where: { userId, isActive: true }, order: [['loginAt', 'DESC']], attributes: { exclude: ['token'] } });

        res.status(200).json({
            success: true,
            sessions,
            totalSessions: sessions.length
        });
    } catch (error) {
        console.error('Error fetching user sessions:', error);
        res.status(500).json({ success: false, message: 'Error fetching user sessions' });
    }
});

// DELETE /sessions/:sessionId - Admin: Revoke a specific session
router.delete('/sessions/:sessionId', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findByPk(sessionId);
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // Don't allow revoking own current session through this endpoint
        if (req.sessionDoc && req.sessionDoc.id.toString() === sessionId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot revoke your own current session. Use logout instead.' 
            });
        }

        session.isActive = false;
        await session.save();

        res.status(200).json({
            success: true,
            message: `Session for ${session.email} has been revoked`,
            revokedSession: {
                email: session.email,
                deviceInfo: session.deviceInfo,
                ipAddress: session.ipAddress
            }
        });
    } catch (error) {
        console.error('Error revoking session:', error);
        res.status(500).json({ success: false, message: 'Error revoking session' });
    }
});

// DELETE /sessions/user/:userId/all - Admin: Revoke all sessions for a user
router.delete('/sessions/user/:userId/all', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await Session.update({ isActive: false }, { where: { userId, isActive: true } });

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} session(s) revoked`,
            revokedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error revoking sessions:', error);
        res.status(500).json({ success: false, message: 'Error revoking sessions' });
    }
});

// POST /sessions/logout - Logout current session
router.post('/sessions/logout', verifyToken, async (req, res) => {
    try {
        if (req.sessionDoc) {
            req.sessionDoc.isActive = false;
            await req.sessionDoc.save();
        }

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ success: false, message: 'Error during logout' });
    }
});

// GET /sessions/validate - Check if current session is still valid
// This is a lightweight endpoint called by frontend heartbeat polling
// If session was revoked, verifyToken middleware will return 401 with sessionRevoked: true
router.get('/sessions/validate', verifyToken, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            valid: true,
            sessionId: req.sessionDoc?._id
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error validating session' });
    }
});

// Export the parseUserAgent helper for use in login route
module.exports = router;
module.exports.parseUserAgent = parseUserAgent;
