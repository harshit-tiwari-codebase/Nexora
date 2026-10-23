import { Server } from "socket.io";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
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
