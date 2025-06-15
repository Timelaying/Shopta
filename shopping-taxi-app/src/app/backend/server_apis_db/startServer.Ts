// startServer.ts
import http from "http";
import { Application } from "express";

/**
 * Starts the Express server.
 *
 * @param app - The Express app instance.
 * @param port - The port to listen on.
 * @param callback - Optional callback after server starts.
 * @returns The HTTP server instance.
 */
function startServer(app: Application, port: number, callback?: () => void): http.Server {
  const server = http.createServer(app);

  server.listen(port, () => {
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
