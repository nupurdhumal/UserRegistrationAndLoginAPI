const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper to sign JWT
const generateToken = (userId, userEmail, expiresIn = '1d') => {
  return jwt.sign(
    { id: userId, email: userEmail },
    process.env.JWT_SECRET || 'super_secret_jwt_key_for_development_32chars_min',
    { expiresIn }
  );
};

// Helper for cookie options
const getCookieOptions = (isLongLived = false) => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: (isLongLived ? 7 : 1) * 24 * 60 * 60 * 1000 // 7 days or 1 day
  };
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    // 0. Database connectivity verification
    if (mongoose.connection.readyState !== 1) {
      console.error(`[Auth Error - Registration]: MongoDB is not connected (readyState: ${mongoose.connection.readyState})`);
      return res.status(503).json({
        success: false,
        message: 'Database connection is not ready. Please verify MongoDB service is running.'
      });
    }

    // 1. Verify request body presence and type
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Expected JSON payload.'
      });
    }

    const { name, email, password } = req.body;

    // 2. Validate required field presence
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: full name, email, and password.'
      });
    }

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input types. Name, email, and password must be strings.'
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Validate name length
    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters long.'
      });
    }

    if (trimmedName.length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Full name cannot exceed 60 characters.'
      });
    }

    // 4. Validate email format
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid corporate email address.'
      });
    }

    // 5. Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    // 6. Proactively check if email is already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.warn(`[Registration Warning]: Rejected duplicate email registration: ${normalizedEmail}`);
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // 7. Persist user into MongoDB (bcrypt hashing handled safely by User model pre-save hook)
    try {
      await User.create({
        name: trimmedName,
        email: normalizedEmail,
        password
      });
    } catch (createError) {
      // Direct catch for concurrent duplicate key error (code 11000)
      if (createError.code === 11000 || createError.errorResponse?.code === 11000) {
        console.warn(`[Registration Warning]: Duplicate key intercepted during creation: ${normalizedEmail}`);
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }
      throw createError;
    }

    console.log(`[Registration Success]: User created successfully for email: ${normalizedEmail}`);

    // 8. Return safe success response (never expose passwords or hashes)
    return res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error(`[Auth Error - Registration]:`, error.message || error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors || {}).map(e => e.message).join(', ') || 'Validation error'
      });
    }
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is not ready. Please verify MongoDB service is running.'
      });
    }

    const { email, password, rememberMe } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.'
      });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input types.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const tokenDuration = rememberMe ? '7d' : '1d';
    const token = generateToken(user._id, user.email, tokenDuration);

    const cookieOptions = getCookieOptions(Boolean(rememberMe));
    res.cookie('token', token, cookieOptions);

    console.log(`[Auth Success - Login]: User authenticated: ${normalizedEmail}`);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(`[Auth Error - Login]:`, error.message || error);
    next(error);
  }
};

/**
 * @desc    Get currently logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private (Protected by JWT)
 */
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error(`[Auth Error - GetMe]:`, error.message || error);
    next(error);
  }
};

/**
 * @desc    Log out user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Public / Private
 */
const logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
