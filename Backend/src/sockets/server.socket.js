import { Server } from "socket.io";
import { isAllowedOrigin } from "../config/cors.js";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    },
  });
  console.log("Socket is Running");

  io.on("connection", (socket) => {
    console.log("User Connected", socket.id);
  });
}
