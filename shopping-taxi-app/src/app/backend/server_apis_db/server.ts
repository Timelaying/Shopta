import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes'; // Import your modular routes
import { notFound, errorHandler } from './middleware/errorHandlers'; // Optional custom error handlers

// Load environment variables
import config from './config';

const app: Application = express();
const PORT = config.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check route
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is healthy!' });
});

// API Routes
app.use('/api', routes);

// 404 and Error Handlers (Optional)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
