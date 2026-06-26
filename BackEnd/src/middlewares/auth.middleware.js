import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Access Denied: No Token Provided'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'super-secret-clinic-key-2026';
    const decoded = jwt.verify(token, secret);
    
    // Inject user details into requests context
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Invalid or Expired Token'
    });
  }
};

export default authMiddleware;
export { authMiddleware };
