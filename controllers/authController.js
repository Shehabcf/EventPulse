const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError('An account with this email already exists', 400));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'attendee', // always attendee on self-registration, never trust a role from the body
  });

  res.status(201).json({
    status: 'success',
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    },
  });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password', 401));
  }

  const token = signToken(user);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    },
  });
});
