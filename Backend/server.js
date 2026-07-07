import dotenv from "dotenv";
dotenv.config();

import http from "http";

import app from "./src/app.js";
import connectToDB from "./src/config/database.js";
import { initSocket } from "./src/sockets/server.socket.js";
import { testAI } from "./src/services/Ai.service.js";

const DEFAULT_PORT = Number(process.env.PORT) || 8000;

// Connect Database
connectToDB();

// Test AI (Optional)
testAI();

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);
console.log("✅ Socket.IO Initialized");

const startServer = (port, attempts = 0) => {
  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && attempts < 5) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy. Trying ${nextPort}...`);
      startServer(nextPort, attempts + 1);
      return;
    }

    console.error(error);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`Server running on port ${server.address().port}`);
  });
};

startServer(DEFAULT_PORT);