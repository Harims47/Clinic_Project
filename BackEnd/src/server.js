import app from './app.js';
import sequelize from './config/database.js';
import logger from './config/logger.js';
import seedDatabase from './config/seed.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Load .env parameters from parent root

const PORT = process.env.PORT || 5000;

// Test database connection and boot up server listener
const startServer = async () => {
  try {
    logger.info('Authenticating database connection...');
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Sync database models structure to match schema tables
    // In production, migrations should manage database changes
    if (process.env.NODE_ENV === 'development') {
      logger.info('Syncing database models schema...');
      // Note: alter: true is buggy on MSSQL when applying UNIQUE constraints, so we use standard sync.
      await sequelize.sync();
      logger.info('Database tables synchronized.');
      
      // Seed default user details if database is empty
      await seedDatabase();
    }

    app.listen(PORT, () => {
      logger.info(`Clinic ERP Backend running in [${process.env.NODE_ENV}] mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to initialize database connection. Exiting process...', error);
    process.exit(1);
  }
};

startServer();
