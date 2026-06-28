import dotenv from "dotenv";
dotenv.config();

import http from "http";

import app from "./src/app.js";
import connectToDB from "./src/config/database.js";
import { initSocket } from "./src/sockets/server.socket.js";
import { testAI } from "./src/services/Ai.service.js";

const PORT = process.env.PORT || 3000;

// Connect Database
connectToDB();

// Test AI (Optional)
testAI();

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);
console.log("✅ Socket.IO Initialized");

// Start Server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});