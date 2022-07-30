const mongoose = require('mongoose');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour name must be provided'],
      unique: true,
      trim: true,
      validate: {
        validator: function (val) {
          return true;
        },
        message: 'custom validator',
      },
    },
    duration: {
      type: Number,
      default: 4,
      min: [1, 'Must be above 1'],
    },
    ratingsAverage: {
      type: Number,
      default: 3.0,
      min: [1, 'Must be above or equal to 1'],
      max: [5, 'Must be below or equal to 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A Tour price must be provided'],
    },
    rating: {
      type: Number,
      default: 2.5,
      min: [1, 'Must be above or equal to 1'],
      max: [5, 'Must be below or equal to 5'],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour description is required'],
      minLength: [10, 'Should be more descriptive'],
    },
    description: {
      type: String,
      trim: true,
      minLength: [30, 'Should be more descriptive'],
    },
    imageCover: {
      type: String,
      trim: true,
    },
    images: [String],
    startDates: [Date],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    // testing: String,
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      description: String,
      coordinates: [Number],
      address: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//data will not be saved in database just received with each document
tourSchema.virtual('secret').get(function () {
  return this.summary.length;
});

//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review', //Model name
  foreignField: 'tour', //name of the field to be matched from second table
  localField: '_id', // name of the field to be matched in this table
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// tourSchema.pre('save', async function (next) {
//   //way of embedding documents
//   const guidesArray = this.guides.map(
//     async (element) => await User.findById(element).select('-__v -passwordChangedAt')
//   );

//   this.guides = await Promise.all(guidesArray);
//   next();
// });

// //data will not be received from query to be set in tbe middle
// tourSchema.virtual('letter').set(function (value) {
//   this.testing = value;
// });

// let startDate;

// tourSchema.pre('save', function (next) {
//   startDate = new Date().getTime();
//   next();
// });

// tourSchema.post('save', function () {
//   console.log(`Save query took ${new Date().getTime() - startDate} ms`);
// });

const Tour = mongoose.model('Tours', tourSchema);

module.exports = Tour;
