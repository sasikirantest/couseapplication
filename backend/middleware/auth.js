// Middleware for authentication (if needed for protected routes)
const authenticateUser = (req, res, next) => {
  // For now, we'll skip authentication since Firebase handles it on frontend
  // In production, you might want to verify Firebase tokens here
  next();
};

module.exports = { authenticateUser };