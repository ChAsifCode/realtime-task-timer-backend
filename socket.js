import { Server } from "socket.io";
import ENV from "./src/config/keys.js";
import { verifyToken } from "./src/utils/jwtHelper.js"; // ensure this exists; see note below
import print from "./src/utils/print.js";

const taskRoom = (taskId) => `task:${taskId}`;
const userRoom = (userId) => `user:${userId}`;

let ioRef = null;

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: (ENV.CORS_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean) || "*",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const raw = socket.handshake.auth?.token || socket.handshake.headers?.authorization || "";
      const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;
      if (!token) return next(new Error("No token"));
      const payload = verifyToken(token); // must return { userId, ... }
      socket.data.user = { userId: payload.userId };
      next();
    } catch (e) {
      next(new Error("Auth failed"));
    }
  });

  io.on("connection", (socket) => {
    const { userId } = socket.data.user || {};
    socket.join(userRoom(userId));
    socket.emit("connected", { userId });

    socket.on("task:join", ({ taskId }) => socket.join(taskRoom(taskId)));
    socket.on("task:leave", ({ taskId }) => socket.leave(taskRoom(taskId)));
    // timer:start / timer:stop events are handled in timer controller via REST;
    // if you want socket-driven starts/stops, we can add them later.
  });

  ioRef = io;
  print("info", "✅ Socket.IO initialized");
  return io;
};

export const getIO = () => ioRef;
export const rooms = { taskRoom, userRoom };
