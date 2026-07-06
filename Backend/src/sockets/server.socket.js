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

    socket.emit("connected", {
      socketId: socket.id,
      message: "Socket.IO connected successfully",
    });

    socket.on("join_room", (roomId) => {
      if (!roomId) return;

      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
      socket.emit("joined_room", { roomId });
    });

    socket.on("leave_room", (roomId) => {
      if (!roomId) return;

      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room: ${roomId}`);
      socket.emit("left_room", { roomId });
    });

    socket.on("send_message", ({ roomId, message, senderId, senderName }) => {
      if (!roomId || !message) return;

      const payload = {
        roomId,
        message,
        senderId: senderId || socket.id,
        senderName: senderName || "Unknown",
        createdAt: new Date().toISOString(),
      };

      io.to(roomId).emit("receive_message", payload);
    });

    socket.on("typing", ({ roomId, isTyping, senderName }) => {
      if (!roomId) return;

      socket.to(roomId).emit("typing_status", {
        roomId,
        senderName: senderName || "Unknown",
        isTyping,
      });
    });

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