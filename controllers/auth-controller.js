const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const User = require('../models/user-model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'succes',
    token: token,
    data: newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1. Check if email and password exists
  if (!email || !password)
    return next(new AppError('Please provide a email and password', 400));
  // 2. CHeck if user and password are correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPasswords(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));
  // 3. If ok.. send a token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'succes',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1 -> Get token and check if its there
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token)
    return next(new AppError('You are not logged in. Please log in to get access', 401));

  // 2 => Token verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3 -> Check if user still exists ( user deleted, but token avaliable)
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(
      new AppError('The user belong to this token does not longer exists'),
      401
    );

  // 4 -> Check if user changed password (but token remains the old one)

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password. Please login again!', 401));
  }
  req.user = freshUser;
  // Grant access to protected routes
  next();
});
