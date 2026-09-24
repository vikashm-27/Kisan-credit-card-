const { Op } = require('sequelize');
﻿const express = require('express');
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

module.exports = router;
