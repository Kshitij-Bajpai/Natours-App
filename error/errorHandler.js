const CustomError = require('./customError');

const handleCastError = (err) => new CustomError(`${err.value} is not a valid ${err.kind}`, 400);

const handleValidationError = (err) => {
  const message = Object.values(err.errors)
    .map(
      (error) =>
        `${error.name} : ${error.stringValue} is not a valid ${error.path} value.${error.kind} required. `
    )
    .join(' ');
  return new CustomError(message, 400);
};

const handleDuplicationError = (err) => {
  const message = `Duplication Key Error: ${Object.values(err.keyValue).join(
    ' '
  )} - Duplicate values found`;
  return new CustomError(message, 400);
};

const handleJWTError = () => new CustomError('Invalid Token❗Please login again to validate.', 401);

const handleJWTExpireError = () =>
  new CustomError('Token Expired❗❗Please login again to validate', 401);

module.exports = (err, req, res, next) => {
  // console.log(err);
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Something went wrong!! Please try again after some time';

  if (process.env.NODE_ENV.startsWith('production')) {
    // if (process.env.NODE_ENV.startsWith('development')) {
    if (err.code === 11000) err = handleDuplicationError(err);
    if (err.name.startsWith('CastError')) err = handleCastError(err);
    if (err.name.startsWith('ValidationError')) err = handleValidationError(err);
    if (err.name.startsWith('JsonWebTokenError')) err = handleJWTError();
    if (err.name.startsWith('TokenExpiredError')) err = handleJWTExpireError();

    if (!err.isOperational) {
      //Programming Error
      console.log(err);
      err.statusCode = 500;
      err.message = 'Something went wrong!! Please try again after some time';
    }
    res.status(err.statusCode).json({
      status: 'Failure',
      message: err.message,
    });
  } else {
    //other than production environment
    res.status(err.statusCode).json({
      status: 'Failure',
      message: err.message,
      error: err,
    });
  }
};
