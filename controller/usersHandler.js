const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsyncWrapper');
const CustomError = require('../error/customError');

exports.updateUserByUser = catchAsync(async (req, res, next) => {
  //fields that cannot be updated by user
  const { name, email, photo } = req.body;
  const { id } = req.user;

  const toUpdate = {};

  if (name) toUpdate.name = name;
  if (email) toUpdate.email = email;
  if (photo) toUpdate.photo = photo;

  if (Object.keys(toUpdate).length === 0)
    return next(new CustomError('No valid fields to update', 400));

  const user = await User.findByIdAndUpdate(id, toUpdate, { new: true, runValidators: true });

  res.status(200).json({
    status: 'Success',
    message: 'User updated SuccessFully',
    data: user,
  });
});

exports.deleteUserByUser = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  await User.findByIdAndUpdate(id, { active: false });

  res.status(204).json({
    status: 'Success',
    message: 'User deleted',
  });
});

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'Failure',
    data: 'Path not configured',
  });
};

exports.patchUser = (req, res) => {
  res.status(500).json({
    status: 'Failure',
    data: 'Path not configured',
  });
};
exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return next(new CustomError(`No user found with id ${id}`, 404));
  res.status(200).json({
    status: 'Success',
    data: user,
  });
});
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'Success',
    data: users,
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({ ...req.body });

  res.status(200).json({
    status: 'Success',
    data: newUser,
  });
});
