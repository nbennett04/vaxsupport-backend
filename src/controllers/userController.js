require('dotenv')
	.config('../../.env');
const Report = require('../models/Report');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto');
const {resetPasswordEmailTemplate, inviteFriendEmailTemplate} = require('../utils/email-templates'); // For generating random passwords

// Generate a secure random password
const generateRandomPassword = (length = 12) => {
	return crypto.randomBytes(length)
	             .toString('hex')
	             .slice(0, length);
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find()
		                        .select('-password'); // Exclude passwords for security
		res.status(200)
		   .json(users);
	} catch (error) {
		res.status(500)
		   .json({message: 'Server error'});
	}
};

// Update user details (firstName and lastName only)
exports.updateUserDetails = async (req, res) => {
	try {
		const {firstName, lastName} = req.body;
		
		const user = await User.findById(req.session.user.id);
		if (!user) {
			return res.status(404)
			          .json({message: 'User not found'});
		}
		
		user.firstName = firstName || user.firstName;
		user.lastName = lastName || user.lastName;
		
		await user.save();
		res.status(200)
		   .json({message: 'User details updated successfully', user});
	} catch (error) {
		res.status(500)
		   .json({message: 'Server error'});
	}
};

// Update password
exports.updatePassword = async (req, res) => {
	try {
		const {oldPassword, newPassword} = req.body;
		
		const user = await User.findById(req.session.user.id);
		if (!user) {
			return res.status(404)
			          .json({message: 'User not found'});
		}
		
		const isMatch = await bcrypt.compare(oldPassword, user.password);
		if (!isMatch) {
			return res.status(400)
			          .json({message: 'Incorrect old password'});
		}
		
		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();
		
		res.status(200)
		   .json({message: 'Password updated successfully'});
	} catch (error) {
		res.status(500)
		   .json({message: 'Server error'});
	}
};

// Admin resets user password
exports.adminResetUserPassword = async (req, res) => {
	try {
		const {userId} = req.params;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404)
			          .json({message: 'User not found'});
		}
		
		// Generate a new password
		const newPassword = generateRandomPassword();
		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();
		
		const emailBody = resetPasswordEmailTemplate.replace('{{name}}', `${user?.firstName} ${user?.lastName}`)
		                                            .replace('{{newPassword}}', newPassword);
		
		// Send email notification
		await sendEmail(
			user.email,
			'Password reset successful',
			emailBody
		);
		
		res.status(200)
		   .json({message: 'User password reset successfully. An email has been sent to the user.'});
	} catch (error) {
		console.error('Error resetting user password:', error);
		res.status(500)
		   .json({message: 'Server error'});
	}
};

// Forget Password (User resets their own password)
exports.forgetPassword = async (req, res) => {
	try {
		const {email} = req.body;
		console.log(email);
		const user = await User.findOne({email});
		if (!user) {
			return res.status(404)
			          .json({message: 'User not found'});
		}
		
		// Generate a new password
		const newPassword = generateRandomPassword();
		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();
		
		const emailBody = resetPasswordEmailTemplate.replace('{{name}}', `${user?.firstName} ${user?.lastName}`)
		                                            .replace('{{newPassword}}', newPassword);
		
		// Send email notification
		await sendEmail(
			user.email,
			'Password reset successful',
			emailBody
		);
		
		res.status(200)
		   .json({message: 'Password reset successfully. An email has been sent to your registered email address.'});
	} catch (error) {
		console.error('Error in forget password:', error);
		res.status(500)
		   .json({message: 'Server error'});
	}
};


// Delete user account and related data
exports.deleteAccount = async (req, res) => {
	try {
		const userId = req.session.user.id;
		
		// Delete all reports submitted by the user
		await Report.deleteMany({user: userId});
		
		// Delete all conversations and messages associated with the user
		await Conversation.deleteMany({user: userId});
		await Message.deleteMany({user: userId});
		
		// Finally, delete the user
		await User.findByIdAndDelete(userId);
		
		res.status(200)
		   .json({message: 'User account and all associated data deleted permanently'});
	} catch (error) {
		res.status(500)
		   .json({message: 'Server error'});
	}
};

// Delete user account and related data
exports.adminDeleteAccount = async (req, res) => {
	try {
		const {userId} = req.params;
		
		// Delete all reports submitted by the user
		await Report.deleteMany({user: userId});
		
		// Delete all conversations and messages associated with the user
		await Conversation.deleteMany({user: userId});
		await Message.deleteMany({user: userId});
		
		// Finally, delete the user
		await User.findByIdAndDelete(userId);
		
		res.status(200)
		   .json({message: 'User account and all associated data deleted permanently'});
	} catch (error) {
		res.status(500)
		   .json({message: 'Server error'});
	}
};

// Admin resets user password
exports.inviteFriend = async (req, res) => {
	try {
		const userId = req.session.user.id;
		const {firstName, lastName, email} = req.body;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404)
			          .json({message: 'User not found'});
		}
		
		const emailBody = inviteFriendEmailTemplate.replace('{{name}}', `${firstName} ${lastName}`)
		                                           .replace('{{friendName}}', user?.firstName);
		
		
		// Send email notification
		await sendEmail(
			email,
			`Invitation from ${user?.firstName} to join VaxSupport.`,
			emailBody
		);
		
		res.status(200)
		   .json({message: 'User invite successfully. An email has been sent to the user.'});
	} catch (error) {
		console.error('Error resetting user password:', error);
		res.status(500)
		   .json({message: 'Server error'});
	}
};