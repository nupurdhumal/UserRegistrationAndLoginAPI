const jwt = require('jsonwebtoken');
const User = require('../models/User');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_for_development_32chars_min_enterprise_auth_2026', {
    expiresIn: '7d'
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long'
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: user.toJSON()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

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

    const token = generateToken(user._id);

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    };

    res.cookie('token', token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
};

const logout = async (req, res) => {
  res.clearCookie('token');
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
