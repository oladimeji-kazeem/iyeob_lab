import { app } from "./app.js";
import { config } from "./config/index.js";

const server = app.listen(config.port, () => {
  console.log(`[server] Backend listening on port ${config.port} (${config.nodeEnv})`);
});

const gracefulShutdown = () => {
  console.log("[server] Gracefully shutting down...");
  server.close(() => {
    console.log("[server] Closed remaining connections.");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
