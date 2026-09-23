import { io } from "socket.io-client";

let socketInstance = null;

export const getSocket = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!socketInstance) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    socketInstance = io(socketUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("🔌 Connected to SkillLens Socket.IO Server:", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("⚠️ Socket connection error:", err.message);
    });
  } else if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
};
