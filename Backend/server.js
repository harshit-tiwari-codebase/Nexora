import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { spawn } from "child_process";

import app from "./src/app.js";
import connectToDB from "./src/config/database.js";
import { initSocket } from "./src/sockets/server.socket.js";
import { testAI } from "./src/services/Ai.service.js";

const DEFAULT_PORT = Number(process.env.PORT) || 8000;

// Test AI (Optional, only when explicitly enabled)
if (process.env.RUN_AI_TEST === "true" || process.argv.includes("--test-ai")) {
  testAI().catch((error) => {
    console.error("Optional AI connectivity test failed:", error);
  });
}

const startServer = async () => {
  await connectToDB();

  const server = http.createServer(app);
  initSocket(server);
  console.log("✅ Socket.IO Initialized");

  const listen = (port, attempts = 0) => {
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE" && attempts < 5) {
        const nextPort = port + 1;
        console.warn(`Port ${port} is busy. Trying ${nextPort}...`);
        listen(nextPort, attempts + 1);
        return;
      }

      console.error("Failed to start HTTP server:", error);
      process.exit(1);
    });

    server.listen(port, () => {
      console.log(`Server running on port ${server.address().port}`);

      if (
        process.env.DISABLE_TERMINAL_TESTER !== "true" &&
        process.stdin.isTTY &&
        !process.argv.includes("--no-terminal")
      ) {
        const terminalTester = spawn(process.execPath, ["src/terminalTester.js"], {
          cwd: process.cwd(),
          stdio: "inherit",
          env: {
            ...process.env,
            RUNNING_UNDER_SERVER: "true",
          },
        });

        terminalTester.on("exit", (code) => {
          if (code !== 0) {
            console.log(`Terminal tester exited with code ${code}`);
          }
        });
      }
    });
  };

  listen(DEFAULT_PORT);
};

startServer().catch((error) => {
  console.error("Backend startup failed:", error.message);
  process.exit(1);
});