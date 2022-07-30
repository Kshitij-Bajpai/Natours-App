const JWT = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

const Mail = require('../utils/emailFeature');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsyncWrapper');
const CustomError = require('../error/customError');

const getToken = (encryptData) =>
  JWT.sign(encryptData, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

const sendTokenResponse = (user, statusCode, res, message) => {
  const encryptData = { id: user._id, email: user.email };
  const token = getToken(encryptData);

  const cookieOptions = {
    expiresIn: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('token', token, cookieOptions);

  user.password = undefined;
  user.active = undefined;

  res.status(statusCode).json({
    status: 'Success',
    token,
    message,
    data: user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, role, photo, password, passwordConfirm, passwordChangedAt } = req.body;

  //extract data that is needed
  const userData = {};
  if (name) userData.name = name;
  if (email) userData.email = email;
  if (role) userData.role = role;
  if (photo) userData.photo = photo;
  if (password) userData.password = password;
  if (passwordConfirm) userData.passwordConfirm = passwordConfirm;
  if (passwordChangedAt) userData.passwordChangedAt = passwordChangedAt;

  const newUser = await User.create(userData);

  sendTokenResponse(newUser, 201, res, '');
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new CustomError('Please provide email and password', 400));

  //findOne returns a document while find returns a cursor
  const user = await User.findOne({ email }).select('+password');

  if (!user) return next(new CustomError('Incorrect Email', 404));
  if (!(await user.comparePassword(password, user.password)))
    return next(new CustomError('Incorrect Password', 400));

  sendTokenResponse(user, 200, res, 'Login succefully');
});

exports.protectUser = catchAsync(async (req, res, next) => {
  let token;
  //exist or not
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    return next(new CustomError('You are not authorized', 401));
  }

  //verify
  const { id, iat } = await promisify(JWT.verify)(token, process.env.JWT_SECRET);

  // this cannot be used everywhere because many requests have no body
  // if (email !== req.body.email)
  //   return next(new CustomError('Token mismatch❗Token does not belong to these Credentials', 401));

  const user = await User.findById(id);
  if (!user) return next(new CustomError('User does not exist for this Token❕', 401));

  //time at which token is generated
  if (user.isPasswordModified(iat)) {
    return next(
      new CustomError('Password was changed soon❗Please login again with correct password', 401)
    );
  }

  req.user = user;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (roles.includes(req.user.role)) return next();
    return next(new CustomError('You are not authorized to perform this action', 401));
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //if the user exist
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new CustomError(`No user found with:${email}`, 404));

  //generate a token
  const token = user.forgotPassTokenGenerator();
  await user.save({ validateBeforeSave: false });

  const message = `This is password reset request, requested by ${email} . To reset your password click :\n
                  ${req.protocol}://${req.hostname}:${req.socket.localPort}/api/v1/users/resetPassword/${token} 
                  \n This is valid for only 10 minutes`;
  //send mail with token for reset
  try {
    await Mail({
      to: email,
      subject: 'Password Reset(Valid for only 10 min)',
      message,
    });

    res.status(200).json({
      status: 'Success',
      message: 'Mail sent Successfully',
    });
  } catch (err) {
    user.passwordToken = undefined;
    user.passwordTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new CustomError('Some Error occurred while sending Mail❗Try again after some time', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //Get token
  let { token } = req.params;
  const { password, passwordConfirm } = req.body;
  // if (token.size !== 32) return next(new CustomError('Incorrect Token', 400));

  //create similar to present in database
  token = crypto.createHash('sha256').update(token).digest('hex');

  //get user from token and check expiry date
  const user = await User.findOne({
    passwordToken: token,
    passwordTokenExpiry: { $gt: Date.now() },
  });

  if (!user) return next(new CustomError('Token Expired or Invalid token', 404));

  //update user info
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordToken = undefined;
  user.passwordTokenExpiry = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successfully');
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //get credentials
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  const { _id: id } = req.user;

  const user = await User.findById(id).select('+password');
  //verify credentials

  if (!(await user.comparePassword(currentPassword, user.password))) {
    return next(new CustomError('Invalid current password', 401));
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();
  //update password

  sendTokenResponse(user, 200, res, 'Password Updated Successfully');
  //return
});
