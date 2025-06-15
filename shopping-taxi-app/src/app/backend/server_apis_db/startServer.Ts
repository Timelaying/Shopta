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
  const server = app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
    if (callback) callback();
  });

  // Optional: Handle graceful shutdowns (use at server.ts or entry point as i add issues at point here)
  /*
  process.on("SIGINT", () => {
    console.log("\n🛑 Gracefully shutting down...");
    server.close(() => {
      console.log("✅ Server closed.");
      process.exit(0);
    });
  });

  */

  return server;
}

export default startServer;
