import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import logger from './logger.js';

export const seedDatabase = async () => {
  try {
    const count = await User.count();
    if (count === 0) {
      logger.info('No users found in database. Seeding default administrative profile...');
      
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);

      await User.create({
        username: 'admin',
        passwordHash: passwordHash,
        role: 'ADMIN',
        isActive: true
      });

      logger.info('Default user profile seeded: username "admin", password "admin123"');
    }
  } catch (error) {
    logger.error('Failed to seed database with default administrative profile.', error);
  }
};

export default seedDatabase;
