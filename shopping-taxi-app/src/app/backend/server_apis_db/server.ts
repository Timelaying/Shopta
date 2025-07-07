import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index"; // Adjust path if needed
import config from "./config/config";
import startServer from "./startServer";
import { initializeDatabase } from './db';
import { notFound, errorHandler } from "./middleware/errorHandlers"; // Optional

// imports fro routes 
import userRoutes from './routes/users.routes';
import storeRoutes from './routes/stores.routes';
import itemRoutes from './routes/items.routes';
import storeItemRoutes from './routes/storeItems.routes';
import tripRoutes from './routes/trips.routes';
import tripItemRoutes from './routes/tripItems.routes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Server is healthy!" });
});

// API Routes
app.use("/api", routes);

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
startServer(app, config.port);

// Initialize database connection
// This should be called before starting the server to ensure DB is ready
const boot = async () => {
  try {
    await initializeDatabase(); // 🔧 Important: Wait for DB setup before running server
    startServer(app, config.port);
  } catch (error) {
    console.error('❌ Failed to start server due to database error.', error);
    process.exit(1); // Exit with failure status
  }
};

boot();