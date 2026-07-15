import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

export function setupSocket(io) {
  io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const user = jwt.verify(token, JWT_SECRET);
        socket.user = user;
        socket.join(`role:${user.role}`);
        socket.join(`user:${user.id}`);
      } catch {}
    }

    socket.on("disconnect", () => {});
  });
}
