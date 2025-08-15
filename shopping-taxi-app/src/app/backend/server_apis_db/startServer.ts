// startServer.ts
import { Application } from "express";

let currentServer: ReturnType<Application["listen"]> | null = null;

/**
 * Starts the Express app on the specified port.
 *
 * @param app - The Express application.
 * @param port - Port number.
 * @param callback - Optional callback after server starts.
 */
function startServer(app: Application, port: number, callback?: () => void) {
  // Close existing server if running (for nodemon restarts)
  if (currentServer) {
    currentServer.close(() => {
      console.log(`🔁 Previous server on port ${port} closed.`);
    });
  }

  try {
    currentServer = app.listen(port, () => {
      console.log(`🚀 Server is running at http://localhost:${port}`);
      if (callback) callback();
    });

    currentServer.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${port} is already in use. Please choose a different port.`
        );
      } else {
        console.error("❌ Server failed to start:", error);
      }
      process.exit(1);
    });

    // Optional graceful shutdown on Ctrl+C
    process.on("SIGINT", () => {
      console.log("\n🛑 Gracefully shutting down...");
      currentServer?.close(() => {
        console.log("✅ Server closed.");
        process.exit(0);
      });
    });

    return currentServer;
  } catch (error) {
    console.error("❌ Unexpected error while starting server:", error);
    process.exit(1);
  }
}

export default startServer;
