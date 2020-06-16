const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/user-model');
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((item) => {
    if (allowedFields.includes(item)) {
      newObj[item] = obj[item];
    }
  });
  return newObj;
};

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

exports.updateMe = catchAsync(async (req, res, next) => {
  //  This is not a auth route , so password it's forbidden here
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for passwords . Use route updateMe for password',
        400
      )
    );

  // filtering req.body - restrictions on what can user update
  const filterBody = filterObj(req.body, 'name', 'email');

  //  update user doc !!!
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'succes',
    data: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'succes',
    data: null,
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
