import { Server } from "socket.io";
import { registerSocketHandlers } from "./socket.handlers";
import { socketAuth } from "./socket.auth";

export const initializeSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket:any) => {
    console.log(`Socket connected: ${socket.data.userId}`);

    registerSocketHandlers(io, socket);

    socket.on("disconnect", (reason:any) => {
      console.log(`Socket disconnected: ${socket.data.userId}`, reason);
    });
  });

  return io;
};
