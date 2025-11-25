const express = require('express');
const {
	updateUserDetails, updatePassword, adminResetUserPassword, deleteAccount, getAllUsers, forgetPassword,
	adminDeleteAccount, inviteFriend
} = require(
	'../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnlyMiddleware');

const router = express.Router();

router.get('/', authMiddleware, adminOnly, getAllUsers);
router.put('/update', authMiddleware, updateUserDetails); // Update firstName & lastName
router.put('/password', authMiddleware, updatePassword); // Update password
router.put('/reset-password/:userId', authMiddleware, adminOnly, adminResetUserPassword); // Admin resets user password
router.put('/forget-password', forgetPassword); // Admin resets user password
router.delete('/delete', authMiddleware, deleteAccount); // Delete user account permanently
router.delete('/admin/delete/:userId', authMiddleware, adminOnly, adminDeleteAccount); // Delete user account// permanently
router.post('/invite-friend', authMiddleware, inviteFriend); // Invite a friend

module.exports = router;
