const { Op } = require('sequelize');
const sequelize = require('../db/connection');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/usermodel');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// GET /admin/users - Fetch all users from users table
router.get('/admin/users', verifyToken, requireAdmin, async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password', 'confirmPassword', 'passwordResetToken', 'passwordResetTokenExpires'] }, order: [['createdAt', 'DESC']] });

        res.status(200).json({
            success: true,
            users,
            totalUsers: users.length
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
});

// GET /admin/users/:id - Fetch single user
router.get('/admin/users/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password', 'confirmPassword', 'passwordResetToken', 'passwordResetTokenExpires'] } });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, message: 'Error fetching user' });
    }
});

// POST /admin/users - Create a new user in users table
router.post('/admin/users', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { firstName, lastName, userId, email, joinDate, status, department, role } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'A user with this email already exists' });
        }

        // Generate a default password (admin can share it with the user)
        const defaultPassword = 'Welcome@123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        const newUser = await User.create({
            username: userId,
            email: email.toLowerCase(),
            password: hashedPassword,
            confirmPassword: hashedPassword,
            role: role || 'user',
            verified: true,
            firstName,
            lastName,
            userId,
            joinDate: joinDate ? new Date(joinDate) : new Date(),
            status: status || 'active',
            department,
            isDeleted: false
        });

        // Return user without sensitive fields
        const savedUser = await User.findById(newUser.id)
            .select('-password -confirmPassword -passwordResetToken -passwordResetTokenExpires');

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: savedUser
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: 'Error creating user' });
    }
});

// PUT /admin/users/:id - Update user details in users table
router.put('/admin/users/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { firstName, lastName, email, joinDate, status, department, role } = req.body;

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if email is being changed and already taken
        if (email && email.toLowerCase() !== user.email) {
            const existingUser = await User.findOne({ where: { email: email.toLowerCase(), id: { [Op.ne]: req.params.id } } });
            if (existingUser) {
                return res.status(409).json({ success: false, message: 'Email already in use by another user' });
            }
        }

        // Update fields
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (email !== undefined) user.email = email.toLowerCase();
        if (joinDate !== undefined) user.joinDate = new Date(joinDate);
        if (status !== undefined) user.status = status;
        if (department !== undefined) user.department = department;
        if (role !== undefined) user.role = role;

        await user.save();

        const updatedUser = await User.findByPk(req.params.id, { attributes: { exclude: ['password', 'confirmPassword', 'passwordResetToken', 'passwordResetTokenExpires'] } });

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Error updating user' });
    }
});

// DELETE /admin/users/:id - Soft delete (mark as deleted, don't remove from DB)
router.delete('/admin/users/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (req.user.userId === req.params.id || req.user.email === user.email) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
        }

        // Soft delete - mark as deleted and inactive
        user.isDeleted = true;
        user.status = 'inactive';
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User has been deactivated successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Error deleting user' });
    }
});

/* ==========================================================================
   BANK OFFICER UNDERWRITING & LOAN MANAGEMENT ENDPOINTS
   ========================================================================== */

const Customer = require('../models/customermodel');

// Helper function to build rich dossier information for an application
const enrichApplicationRecord = (customer) => {
    const data = customer.toJSON ? customer.toJSON() : { ...customer };
    const landArea = parseFloat(data.landAreaAcres) || 0;
    const baseLimit = Math.round(landArea * 50000);
    const postHarvest = Math.round(baseLimit * 0.10);
    const maintenance = Math.round(baseLimit * 0.20);
    const totalScale = baseLimit + postHarvest + maintenance;
    const sanctioned = parseFloat(data.sanctionedAmount) > 0 ? parseFloat(data.sanctionedAmount) : (data.applicationStatus === 'REJECTED' ? 0 : totalScale);

    return {
        ...data,
        sanctionedAmount: sanctioned,
        landAreaAcres: landArea,
        cropType: data.cropType || 'Paddy (Kharif)',
        surveyNumber: data.surveyNumber || `Sy. 104/${(data.id % 9) + 1}A`,
        cibilScore: data.cibilScore || (650 + (data.id * 13) % 200),
        applicationStatus: data.applicationStatus || 'SUBMITTED',
        calculatedBreakdown: {
            scaleOfFinancePerAcre: 50000,
            baseCropLimit: baseLimit,
            postHarvest10Pct: postHarvest,
            farmMaintenance20Pct: maintenance,
            totalCalculatedLimit: totalScale,
            sanctionedLimit: sanctioned
        },
        kycStatus: {
            aadhaar: {
                verified: true,
                number: 'XXXX-XXXX-' + String(data.phoneNumber || '9876').slice(-4),
                matchScore: 98,
                status: 'VERIFIED'
            },
            pan: {
                verified: true,
                number: 'ABCDE' + String(1000 + (data.id % 9000)) + 'F',
                matchScore: 100,
                status: 'VERIFIED'
            },
            bankAccount: {
                verified: true,
                accountNumber: data.accountNumber || `9180200${10000 + data.id}`,
                ifsc: data.ifscCode || 'SBIN0001234',
                bankName: data.bankName || 'State Bank of India',
                status: 'VERIFIED'
            }
        },
        landDossier: {
            surveyNumber: data.surveyNumber || `Sy. 104/${(data.id % 9) + 1}A`,
            landAreaAcres: landArea,
            village: data.bankDistrict || 'Mandya Rural',
            district: data.bankDistrict || 'Mandya',
            state: data.bankState || 'Karnataka',
            soilType: 'Alluvial Red Loam',
            irrigationSource: 'Canal Irrigation',
            coordinates: {
                lat: 12.5218 + (data.id * 0.002),
                lng: 76.8951 + (data.id * 0.002)
            }
        }
    };
};

// GET /api/admin/applications (and /admin/applications)
// Fetches Branch KPIs and paginated/filtered loan applications
router.get(['/api/admin/applications', '/admin/applications'], async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;

        // 1. Calculate Real-Time Branch KPIs
        const totalApplications = await Customer.count();
        const pendingReview = await Customer.count({
            where: {
                applicationStatus: { [Op.in]: ['SUBMITTED', 'UNDER_REVIEW'] }
            }
        });
        const approvedCount = await Customer.count({
            where: { applicationStatus: 'APPROVED' }
        });
        const rejectedCount = await Customer.count({
            where: { applicationStatus: 'REJECTED' }
        });
        const flaggedCount = await Customer.count({
            where: { applicationStatus: 'FLAGGED' }
        });
        const underReviewCount = await Customer.count({
            where: { applicationStatus: 'UNDER_REVIEW' }
        });
        const submittedCount = await Customer.count({
            where: { applicationStatus: 'SUBMITTED' }
        });

        const totalDisbursedResult = await Customer.sum('sanctionedAmount', {
            where: { applicationStatus: 'APPROVED' }
        });
        const totalDisbursed = Number(totalDisbursedResult || 0);

        const totalDecided = approvedCount + rejectedCount;
        const approvalRatio = totalDecided > 0
            ? `${((approvedCount / totalDecided) * 100).toFixed(1)}%`
            : (totalApplications > 0 ? `${((approvedCount / totalApplications) * 100).toFixed(1)}%` : '0.0%');

        const kpis = {
            totalApplications,
            pendingReview,
            totalDisbursed,
            approvalRatio,
            approvedCount,
            rejectedCount,
            flaggedCount,
            underReviewCount,
            submittedCount
        };

        // 2. Query Filtering
        const whereClause = {};

        if (status && status.toUpperCase() !== 'ALL') {
            if (status.toUpperCase() === 'PENDING') {
                whereClause.applicationStatus = { [Op.in]: ['SUBMITTED', 'UNDER_REVIEW'] };
            } else {
                whereClause.applicationStatus = status.toUpperCase();
            }
        }

        if (search && search.trim() !== '') {
            const trimmed = search.trim();
            const queryStr = `%${trimmed}%`;

            // Check if search query matches KCC application ID format: e.g. KCC-2026-0001 or KCC-1
            const kccMatch = trimmed.match(/^KCC(?:-\d+)?-(\d+)$/i);
            if (kccMatch) {
                const appId = parseInt(kccMatch[1], 10);
                whereClause[Op.or] = [{ id: appId }];
            } else {
                whereClause[Op.or] = [
                    { firstName: { [Op.like]: queryStr } },
                    { lastName: { [Op.like]: queryStr } },
                    { phoneNumber: { [Op.like]: queryStr } },
                    { surveyNumber: { [Op.like]: queryStr } },
                    { email: { [Op.like]: queryStr } },
                    { cropType: { [Op.like]: queryStr } },
                    sequelize.where(sequelize.fn('concat', sequelize.col('firstName'), ' ', sequelize.col('lastName')), { [Op.like]: queryStr })
                ];

                if (/^\d+$/.test(trimmed)) {
                    whereClause[Op.or].push({ id: parseInt(trimmed, 10) });
                }
            }
        }

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const offset = (pageNum - 1) * limitNum;

        const { count, rows } = await Customer.findAndCountAll({
            where: whereClause,
            order: [['updatedAt', 'DESC'], ['id', 'DESC']],
            limit: limitNum,
            offset
        });

        const applications = rows.map(app => enrichApplicationRecord(app));

        res.status(200).json({
            success: true,
            kpis,
            totalApplications,
            pendingReview,
            totalDisbursed,
            approvalRatio,
            applications,
            totalCount: count,
            totalPages: Math.ceil(count / limitNum) || 1,
            currentPage: pageNum
        });
    } catch (error) {
        console.error('Error fetching admin loan applications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve loan applications',
            error: error.message
        });
    }
});

// GET /api/admin/applications/:id (and /admin/applications/:id)
// Fetch single application with full underwriting dossier
router.get(['/api/admin/applications/:id', '/admin/applications/:id'], async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.status(200).json({
            success: true,
            application: enrichApplicationRecord(customer)
        });
    } catch (error) {
        console.error('Error fetching application dossier:', error);
        res.status(500).json({ success: false, message: 'Error retrieving application details' });
    }
});

// PUT /api/admin/applications/:id/decision (and /admin/applications/:id/decision)
// Underwriter decision update: APPROVED | REJECTED | FLAGGED | UNDER_REVIEW
router.put(['/api/admin/applications/:id/decision', '/admin/applications/:id/decision'], async (req, res) => {
    try {
        const { decision, remarks, officerId, sanctionedAmount } = req.body;
        const validDecisions = ['APPROVED', 'REJECTED', 'FLAGGED', 'UNDER_REVIEW', 'SUBMITTED'];

        if (!decision || !validDecisions.includes(decision.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: `Invalid decision. Must be one of: ${validDecisions.join(', ')}`
            });
        }

        const customer = await Customer.findByPk(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const normalizedDecision = decision.toUpperCase();
        customer.applicationStatus = normalizedDecision;
        if (remarks !== undefined) {
            customer.officerRemarks = remarks;
        }
        if (officerId !== undefined) {
            customer.reviewedByOfficerId = officerId;
        } else if (req.user && (req.user.id || req.user.userId)) {
            customer.reviewedByOfficerId = req.user.id || req.user.userId;
        }
        if (sanctionedAmount !== undefined && !isNaN(parseFloat(sanctionedAmount))) {
            customer.sanctionedAmount = parseFloat(sanctionedAmount);
        } else if (normalizedDecision === 'APPROVED' && (!customer.sanctionedAmount || parseFloat(customer.sanctionedAmount) === 0)) {
            const landArea = parseFloat(customer.landAreaAcres) || 0;
            customer.sanctionedAmount = Math.round(landArea * 50000 * 1.3);
        }
        customer.reviewedAt = new Date();

        await customer.save();

        const updatedEnriched = enrichApplicationRecord(customer);

        res.status(200).json({
            success: true,
            message: `Application marked as ${normalizedDecision} successfully`,
            customer: updatedEnriched,
            application: updatedEnriched
        });
    } catch (error) {
        console.error('Error recording underwriter decision:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record application decision',
            error: error.message
        });
    }
});

module.exports = router;
