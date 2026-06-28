import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRoutes } from './routes/auth.routes.js';
import { patientRoutes } from './routes/patient.routes.js';
import { productRoutes } from './routes/product.routes.js';
import { queueTokenRoutes } from './routes/queueToken.routes.js';
import salesInvoiceRoutes from './routes/salesInvoice.routes.js';
import { supplierRoutes } from './routes/supplier.routes.js';
import { purchaseRoutes } from './routes/purchase.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Apply security headers
app.use(helmet());

// Enable CORS requests mapping
app.use(cors({
  origin: '*', // Adjust for stricter bounds in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static upload files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply basic rate limiter constraints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api', limiter);

// Express payload parses
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tokens', queueTokenRoutes);
app.use('/api/invoices', salesInvoiceRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase', purchaseRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Global error middleware interception
app.use(errorHandler);

export default app;
export { app };
