import { Server } from "socket.io";

let io;

// Initialize Socket.IO
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
    
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });
  });

  return io;
};

// Get the io instance anywhere in the project
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized!");
  }

  return io;
};