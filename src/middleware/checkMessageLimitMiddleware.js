require('dotenv')
	.config('../../.env');
const User = require('../models/User');

const MESSAGE_LIMIT = process.env.MESSAGE_LIMIT; // Set your daily limit here

const checkMessageLimit = async (req, res, next) => {
	try {
		const userId = req.session.user.id;
		const user = await User.findById(userId);
		
		if (!user) {
			return res.status(404)
			          .json({message: 'User not found'});
		}
		
		const today = new Date();
		const lastMessageDate = user.lastMessageDate ? new Date(user.lastMessageDate) : null;
		
		// Reset count if it's a new day
		if (!lastMessageDate || lastMessageDate.toDateString() !== today.toDateString()) {
			user.dailyMessageCount = 0;
			user.lastMessageDate = today;
			await user.save();
		}
		
		// Check if user has reached the limit
		if (user.dailyMessageCount >= MESSAGE_LIMIT) {
			return res.status(403)
			          .json({message: 'Daily message limit reached'});
		}
		
		next();
	} catch (error) {
		console.log(error);
		res.status(500)
		   .json({message: 'Server error'});
	}
};

module.exports = checkMessageLimit;
