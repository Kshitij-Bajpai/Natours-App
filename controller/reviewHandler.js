const Review = require('../model/reviewModel');
const catchAsync = require('../utils/catchAsyncWrapper');
const CustomError = require('../error/customError');

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;

  const review = await Review.create({ ...req.body });

  res.status(200).json({
    status: 'Success',
    data: review,
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (!review) next(new CustomError(`No Review found with:${id}`, 404));

  res.status(200).json({
    status: 'Success',
    data: review,
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const review = await Review.find();

  res.status(200).json({
    status: 'Success',
    size: review.length,
    data: review,
  });
});
