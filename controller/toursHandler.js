const Tour = require('../model/toursModel');
const ApiFeature = require('../utils/apiFeature');
const catchAsync = require('../utils/catchAsyncWrapper');
const CustomError = require('../error/customError');

exports.deleteTour = catchAsync(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

exports.patchTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'Success',
    data: tour,
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // req.body.letter = 'hey this virtual set';
  const tour = await Tour.create(req.body);

  res.status(200).json({
    status: 'Success',
    message: tour,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');

  if (!tour) {
    return next(new CustomError(`No data found with id:${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'Success',
    data: tour,
  });
});

exports.getAllTours = catchAsync(async (req, res, next) => {
  const feature = new ApiFeature(Tour.find(), req.query).filter().sort().fields().paginate();

  const tours = await feature.query.populate('reviews');

  res.status(200).json({
    status: 'Success',
    size: tours.length,
    data: tours,
  });
});

exports.cheapTours = async (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-rating,price';
  req.query.fields = 'name,price,rating,duration,summary';
  next();
};

exports.monthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        $expr: { $eq: [year, { $year: '$startDates' }] },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        tours: { $push: '$name' },
        noOfTours: { $count: {} },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { noOfTours: -1 },
    },
  ]);

  res.status(200).json({
    status: 'Success',
    size: plan.length,
    data: plan,
  });
});
