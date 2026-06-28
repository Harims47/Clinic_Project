import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import logger from './logger.js';

export const seedDatabase = async () => {
  try {
    const count = await User.count();
    const salt = await bcrypt.genSalt(10);

    if (count === 0) {
      logger.info('No users found in database. Seeding default administrative profile...');
      const passwordHash = await bcrypt.hash('admin123', salt);

      await User.create({
        username: 'admin',
        passwordHash: passwordHash,
        role: 'ADMIN',
        isActive: true
      });

      logger.info('Default user profile seeded: username "admin", password "admin123"');
    }

    // Seed doctors if none exist
    const doctorCount = await User.count({ where: { role: 'DOCTOR' } });
    if (doctorCount === 0) {
      logger.info('No doctors found in database. Seeding default doctor profiles...');
      const docPasswordHash = await bcrypt.hash('doctor123', salt);

      await User.create({
        username: 'sharma',
        passwordHash: docPasswordHash,
        role: 'DOCTOR',
        isActive: true
      });

      await User.create({
        username: 'verma',
        passwordHash: docPasswordHash,
        role: 'DOCTOR',
        isActive: true
      });

      logger.info('Default doctors seeded: "sharma" and "verma", password "doctor123"');
    }
  } catch (error) {
    logger.error('Failed to seed database with profiles.', error);
  }
};

export default seedDatabase;
