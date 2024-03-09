const ErrorHandler = (error, req, res) => {
  let statusCode = error?.statusCode ?? 500;
  return res.status(statusCode).json({
    msg: error?.message,
    success: false,
  });
};

const ResHandler = (data, req, res) => {
  return res.status(200).json({
    success: true,
    ...data,
  });
};

module.exports = {
    ResHandler,
    ErrorHandler
};
