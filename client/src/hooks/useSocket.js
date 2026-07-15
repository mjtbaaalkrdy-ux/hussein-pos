import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useAuth from "../store/auth";

export default function useSocket(eventHandlers = {}) {
  const token = useAuth((s) => s.token);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    const socket = io({ auth: { token } });
    socketRef.current = socket;

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return socketRef;
}
