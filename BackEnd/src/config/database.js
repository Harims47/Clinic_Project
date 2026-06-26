import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config({ path: '../.env' }); // Load .env from root

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '1433', 10);
const dbUser = process.env.DB_USER || 'sa';
const dbPass = process.env.DB_PASS || '';
const dbName = process.env.DB_NAME || 'ClinicERP';

logger.info(`Initializing Sequelize mapping for SQL Server at ${dbHost}:${dbPort}`);

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: true // Crucial for local dev environments
    }
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: (msg) => logger.debug(`[Sequelize] ${msg}`)
});

export default sequelize;
export { sequelize };
