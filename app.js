//Core Modules
const express = require('express');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require('morgan');
const hpp = require('hpp');

//Files Require
const CustomError = require('./error/customError');
const errorHandler = require('./error/errorHandler');
const tourRouter = require('./routes/toursRoutes');
const userRouter = require('./routes/usersRoutes');
const reviewRouter = require('./routes/reviewRoutes');

//Express App
const app = express();

//MiddleWare
app.use(helmet());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' })); //amout of data to be parsed

app.use(mongoSanitize());

app.use(xss());

app.use(express.static(`${__dirname}/public`));

app.use(
  '/api',
  rateLimiter({
    max: 50,
    windowMs: 60 * 60 * 1000,
    message: 'To many requests ❗Please try after an hour',
  })
);

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//Routes
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'This is running',
    app: 'Plan Ahead App',
    author: 'Kshitij Bajpai',
  });
});
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/review', reviewRouter);

app.all('*', (req, res, next) => {
  next(new CustomError('Error in new Path', 400));
});

app.use(errorHandler);

module.exports = app;
