import http from "http";
import app from "./app";
import { initializeSocket } from "./app/socket/socket.server";


const PORT = process.env.PORT || 5000;

/*
 * Create HTTP server
 */
const httpServer = http.createServer(app);

/*
 * Initialize Socket.IO
 */
const io = initializeSocket(httpServer);

/*
 * Start server
 */
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
