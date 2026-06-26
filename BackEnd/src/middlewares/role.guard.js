const roleGuard = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Unauthorized: User session missing'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Forbidden: Insufficient privileges'
      });
    }

    next();
  };
};

export default roleGuard;
export { roleGuard };
