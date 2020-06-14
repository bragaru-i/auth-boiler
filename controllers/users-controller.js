const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/user-model');

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: 'success',
    data: newUser,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    results: users.length,
    status: 'success',
    data: users,
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const userId = req.params.uid;
  const user = await User.findById(userId);
  if (!user) return next(new AppError('No user found with requested ID', 404));
  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const userId = req.params.uid;
  const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) return next(new AppError('No user found with requested ID', 404));

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

exports.deleteUserById = catchAsync(async (req, res, next) => {
  const userId = req.params.uid;

  const user = await User.findByIdAndDelete(userId);
  if (!user) return next(new AppError('No user found with requested ID', 404));

  res.status(204).json({
    status: 'succes',
    message: 'User deleted',
  });
});
