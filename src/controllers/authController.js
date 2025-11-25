const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const { welcomeEmailTemplate } = require('../utils/email-templates');

const isProd = process.env.NODE_ENV === 'production';
const SESSION_COOKIE_NAME = 'connect.sid';

// ---------- REGISTER ----------
exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      birthYear,
      country,
      state,
      privacyPolicyAcceptedAt,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      birthYear,
      country,
      state,
      privacyPolicyAcceptedAt,
    });
    await newUser.save();

    const emailBody = welcomeEmailTemplate.replace(
      '{{firstName}}',
      `${newUser?.firstName || ''}`
    );

    // fire-and-forget is okay, but await is fine too
    await sendEmail(newUser.email, 'Welcome!', emailBody);

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('register error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ---------- LOGIN ----------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔍 Login attempt for email:', email);
    console.log('🔍 Password length:', password?.length);

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ No user found with email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User found:', user.email);
    console.log('🔍 Stored password hash length:', user.password?.length);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔍 Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password does not match for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Prevent session fixation & ensure cookie is set/saved before responding
    req.session.regenerate((regenErr) => {
      if (regenErr) {
        console.error('session regenerate error:', regenErr);
        return res.status(500).json({ message: 'Session error' });
      }

      req.session.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      // reinforce cookie TTL per login (ms)
      req.session.cookie.maxAge = 60 * 60 * 1000;

      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('session save error:', saveErr);
          return res.status(500).json({ message: 'Session save error' });
        }
        return res.json({
          message: 'Logged in successfully',
          user: req.session.user,
        });
      });
    });
  } catch (error) {
    console.error('login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ---------- GET PROFILE ----------
exports.getProfile = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.session.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ---------- LOGOUT ----------
exports.logout = (req, res) => {
  try {
    // destroy server session
    req.session.destroy((err) => {
      if (err) {
        console.error('logout destroy error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }

      // Clear cookie with matching attributes
      res.clearCookie(SESSION_COOKIE_NAME, {
        path: '/',
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
        httpOnly: true,
      });

      return res.json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    console.error('logout error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ---------- CHECK SESSION ----------
exports.checkSession = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({ isAuthenticated: false });
    }

    // verify user still exists
    const user = await User.findById(req.session.user.id).select('_id');
    if (!user) {
      // user deleted -> destroy session & clear cookie
      return req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ message: 'Error logging out' });
        }
        res.clearCookie(SESSION_COOKIE_NAME, {
          path: '/',
          sameSite: isProd ? 'none' : 'lax',
          secure: isProd,
          httpOnly: true,
        });
        return res.json({
          isAuthenticated: false,
          message: 'Your account has been deleted.',
        });
      });
    }

    return res.json({
      isAuthenticated: true,
      user: req.session.user,
    });
  } catch (error) {
    console.error('checkSession error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ---------- DEBUG: CHECK USER EXISTS ----------
exports.debugCheckUser = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email parameter required' });
    }

    const user = await User.findOne({ email }).select('email firstName lastName createdAt');
    
    if (!user) {
      return res.json({ 
        exists: false, 
        message: `No user found with email: ${email}`,
        totalUsers: await User.countDocuments()
      });
    }

    return res.json({ 
      exists: true, 
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('debugCheckUser error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
