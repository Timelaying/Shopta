// startServer.ts
import { Application } from "express";

/**
 * Starts the Express app on the specified port.
 *
 * @param app - The Express application.
 * @param port - Port number.
 * @param callback - Optional callback after server starts.
 */
function startServer(app: Application, port: number, callback?: () => void) {
  try {
    const server = app.listen(port, () => {
      console.log(`🚀 Server is running at http://localhost:${port}`);
      if (callback) callback();
    });

    // Optional: Handle graceful shutdown
    /*
    process.on("SIGINT", () => {
      console.log("\n🛑 Gracefully shutting down...");
      server.close(() => {
        console.log("✅ Server closed.");
        process.exit(0);
      });
    });
    */

    server.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${port} is already in use. Please choose a different port.`);
      } else {
        console.error("❌ Server failed to start:", error);
      }
      process.exit(1);
    });

    return server;
  } catch (error) {
    console.error("❌ Unexpected error while starting server:", error);
    process.exit(1);
  }
}

export default startServer;
