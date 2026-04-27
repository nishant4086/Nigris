const errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: message,
    status,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

export default errorMiddleware;
