import express, { Request, Response } from "express";
import http from 'http';
import { Server as IOServer } from 'socket.io';
import cors from "cors";
import morgan from "morgan";
import cookieParser from 'cookie-parser';
import routes from "./routes/index";
import config from "./config/config";
import { initializeDatabase } from './db';
import { notFound, errorHandler } from "./middleware/errorHandlers";
import authRoutes from './routes/auth.routes';
import { jwtMiddleware } from './middleware/jwtMiddleware';
import userRoutes from './routes/users.routes';
import storeRoutes from './routes/stores.routes';
import itemRoutes from './routes/items.routes';
import storeItemRoutes from './routes/storeItems.routes';
import tripRoutes from './routes/trips.routes';
import tripItemRoutes from './routes/tripItems.routes';

// If using Socket.IO types, ensure you have installed @types/socket.io
// npm install socket.io @types/socket.io

const app = express();
const httpServer = http.createServer(app);

// Ensure config.frontendUrl exists in your config file
const frontendUrl = config.frontendUrl || 'http://localhost:3000';

const io = new IOServer(httpServer, {
  cors: { origin: frontendUrl, credentials: true }
});

// Attach io to app for controllers
app.set('io', io);

// Middleware
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Socket.IO events
import { Socket } from 'socket.io';

io.on('connection', (socket: Socket) => {
  console.log('Client connected:', socket.id);
  // Join trip room
  socket.on('joinTrip', (tripId: string) => {
    socket.join(`trip_${tripId}`);
  });
  socket.on('sendLocation', ({ tripId, lat, lng }: { tripId: string, lat: number, lng: number }) => {
    io.to(`trip_${tripId}`).emit('locationUpdate', { tripId, lat, lng });
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const boot = async () => {
  try {
    await initializeDatabase();
    httpServer.listen(config.port, () => console.log(`Listening on ${config.port}`));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};
boot();