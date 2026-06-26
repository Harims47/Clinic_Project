import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export class AuthController {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          status: 'error',
          statusCode: 400,
          message: 'Username and password are required'
        });
      }

      // Fetch user profile from database
      const user = await User.findOne({ where: { username } });

      if (!user || !user.isActive) {
        return res.status(401).json({
          status: 'error',
          statusCode: 401,
          message: 'Invalid credentials or user account disabled'
        });
      }

      // Verify bcrypt hashes
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          status: 'error',
          statusCode: 401,
          message: 'Invalid credentials'
        });
      }

      // Sign JWT session token
      const tokenSecret = process.env.JWT_SECRET || 'super-secret-clinic-key-2026';
      const token = jwt.sign(
        { userId: user.userId, username: user.username, role: user.role },
        tokenSecret,
        { expiresIn: process.env.JWT_EXPIRY || '15m' }
      );

      return res.status(200).json({
        status: 'success',
        data: {
          token,
          user: {
            userId: user.userId,
            username: user.username,
            role: user.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
