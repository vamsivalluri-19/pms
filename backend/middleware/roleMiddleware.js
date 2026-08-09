export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role (${req.user ? req.user.role : 'Guest'}) is not authorized to access this resource.`
      });
    }
    next();
  };
};
