import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index"; // Adjust path if needed
import config from "./config";
import startServer from "./startServer";
import { notFound, errorHandler } from "./middleware/errorHandlers"; // Optional

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

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

// Start server using startServer utility
startServer(app, config.port);
