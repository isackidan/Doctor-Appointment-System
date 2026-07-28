const AppError = require('../utils/AppError');

const handlePrismaError = (err) => {
  if (err.code === 'P2002') {
    const message = `Duplicate field value: ${err.meta.target}. Please use another value!`;
    return new AppError(message, 400);
  }
  if (err.code === 'P2014' || err.code === 'P2015') {
    const message = `Invalid ID`;
    return new AppError(message, 400);
  }
  return new AppError('Database Error', 500);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = Object.assign(err);
    if (error.name === 'PrismaClientKnownRequestError') error = handlePrismaError(error);
    sendErrorProd(error, res);
  }
};
