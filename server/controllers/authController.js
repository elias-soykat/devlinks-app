const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../model/userModel');
const sendEmail = require('./../utils/email');
const config = require('../config');
const { createSendToken } = require('../utils/appToken');

exports.signup = catchAsync(async (req, res, next) => {
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return next(
      new AppError('User already exists with this email address.', 400)
    );
  }

  const newUser = new User({
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const verificationToken = newUser.createEmailVerificationToken();
  await newUser.save();

  const verificationLink = `${config.FRONTEND_LIVE_URL}/verify-email?token=${verificationToken}`;
  const emailOptions = {
    email: req.body.email,
    subject: 'Welcome to DevLinks! Confirm Your Email Address',
    message: `
      <div style="background-color: #fafafa; padding: 20px; border-radius: 10px;">
        <h1 style="color: #633cff; margin-bottom: 20px;">Welcome aboard!</h1>
        <p style="color: #737373; margin-bottom: 15px;">Greetings from DevLinks! We're thrilled to have you join our community.</p>
        <p style="color: #737373; margin-bottom: 15px;">To complete your registration and unlock all the amazing features, please click the button below to verify your email address:</p>
        <p style="text-align: center; margin-bottom: 20px;"><a href="${verificationLink}" style="background-color: #633cff; color: #fafafa; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Verify Email Address</a></p>
        <p style="color: #737373; margin-bottom: 15px;">Alternatively, you can copy and paste the following link into your browser:</p>
        <p style="color: #737373; margin-bottom: 15px;"><em>${verificationLink}</em></p>
        <p style="color: #737373; font-weight: bold;">If you didn't sign up for DevLinks, no worries! Simply ignore this email.</p>
      </div>
    `,
  };

  await sendEmail(emailOptions);
  res.status(201).json({
    status: 'success',
    message: 'Verification email sent. Please verify your email address.',
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.query;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
  });

  if (!user) {
    return next(new AppError('Invalid or expired verification token.', 400));
  }

  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully.',
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password, user.password))) {
    return next(new AppError('Invalid email or password.', 401));
  }

  if (!user.isVerified) {
    return next(
      new AppError(
        'Your email is not verified. Please verify your email address.',
        401
      )
    );
  }

  req.user = user;
  createSendToken(user, 200, res);
});

exports.protected = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || token.length < 20) {
    return next(new AppError('Invalid token provided', 401));
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, config.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  req.user = currentUser;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError("We can't find a user with that email address.", 404)
    );
  }

  const resetPasswordToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordLink = `${config.FRONTEND_LIVE_URL}/reset-password?token=${resetPasswordToken}`;
  const emailOptions = {
    email: req.body.email,
    subject: 'DevLinks - Reset Password (Expires in 10 Minutes)',
    message: `
    <div style="background-color: #fafafa; padding: 20px; border-radius: 10px;">
    <h1 style="color: #633cff; margin-bottom: 20px;">Hello there!</h1>
    <p style="color: #737373; margin-bottom: 15px;">You are receiving this email because you (or someone else) has requested to reset the password for your account.</p>
    <p style="color: #737373; margin-bottom: 15px;">To proceed with the password reset process, please click on the button below:</p>
    <p style="text-align: center; margin-bottom: 20px;">
      <a href="${resetPasswordLink}" style="background-color: #633cff; color: #fafafa; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Reset Password</a>
    </p>
    <p style="color: #737373; margin-bottom: 15px;">Alternatively, you can copy and paste the following link into your browser:</p>
    <p style="color: #737373; margin-bottom: 15px;"><em>${resetPasswordLink}</em></p>
    <p style="color: #737373; margin-bottom: 15px;">If you did not initiate this request, please disregard this email. Your account's password will remain unchanged.</p>
    <p style="color: #737373; margin-bottom: 15px;">Please note that this link expires in 10 minutes for security purposes.</p>
  </div>
    `,
  };

  try {
    await sendEmail(emailOptions);
    res.status(200).json({
      status: 'success',
      message: 'Password reset email sent. Please check your email.',
    });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the password reset email. Please try again later.',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.query.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError('Password reset token is invalid or has expired.', 400)
    );
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res) => {
  req.user = null;
  res.clearCookie('jwt');
  res
    .status(200)
    .json({ status: 'success', message: 'Successfully logged out.' });
});
