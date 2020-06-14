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
  console.log(user);
  // 3. If ok.. send a token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'succes',
    token,
  });
});
