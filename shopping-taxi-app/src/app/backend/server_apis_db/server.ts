import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index"; // Adjust path if needed
import config from "./config/config";
import startServer from "./startServer";
import { initializeDatabase } from './db';
import { notFound, errorHandler } from "./middleware/errorHandlers"; // Optional
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import { jwtMiddleware } from './middleware/jwtMiddleware';

// imports for routes 
import userRoutes from './routes/users.routes';
import storeRoutes from './routes/stores.routes';
import itemRoutes from './routes/items.routes';
import storeItemRoutes from './routes/storeItems.routes';
import tripRoutes from './routes/trips.routes';
import tripItemRoutes from './routes/tripItems.routes';

const app: Application = express();

// Middleware
// server.ts — make sure this matches your actual frontend address:
app.use(cors({
  origin: 'http://localhost:3000',  // or https://app.your-domain.com
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // For parsing cookies

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Server is healthy!" });
});

// API Routes
app.use("/api", routes);


// Auth routes (unprotected)
app.use('/api/auth', authRoutes);

// Protect all other /api routes
app.use('/api', jwtMiddleware);

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/store-items', storeItemRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/trip-items', tripItemRoutes);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

// Start server using startServer utility
// 5. Only call startServer **once**, after DB init
const boot = async () => {
  try {
    await initializeDatabase(); // Initialize database connection
    startServer(app, config.port);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

boot();