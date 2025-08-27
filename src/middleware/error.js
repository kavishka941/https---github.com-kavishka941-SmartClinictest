export const notFound = (req, res, next) => {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};


export const errorHandler = (err, req, res, next) => {
const status = err.status || 500;
res.status(status).json({ message: err.message || 'Server error' });
};