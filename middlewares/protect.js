const Review = require("../models/reviewModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

/**
 * Middleware function to check if the user is authenticated
 * @description - Only login user can access tour routes
 */
exports.protectRoute = catchAsync(async (req, res, next) => {
  // 1) Getting token, and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Please login to get access!', 401));
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user associated with this token no longer exists.', 401)
    );
  }

  /**
   * 4) Check if user changed password after the token was issued
   * "changedPasswordAfter" is document instance methods from "userModel.js" which returns boolean
   */
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

/**
 * middleware to check if the person person that want to edit a comment is the same as the one who created it
 * @description - only the user refrenced with the comment can edit it
 */
exports.protectComent = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
  if (review.user.id !== req.user.id) {
    return next(new AppError("you can't edit a comment you did not create", 401))
  }
  next();
});
