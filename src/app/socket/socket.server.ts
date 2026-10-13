import { Server } from "socket.io";
import { registerSocketHandlers } from "./socket.handlers";
import { socketAuth } from "./socket.auth";

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

export const initializeSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"],
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
