import { useEffect, useRef, useState } from "react";

/**
 * WebSocket hook that:
 * - attaches ?token=<JWT> for auth
 * - exposes messages, sendMessage, setMessages
 */
export default function useWebSocket() {
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    const backend = import.meta.env.VITE_BACKEND_URL || "https://streamchat-backend-ow46.onrender.com";
    const token = localStorage.getItem("access") || "";
    const proto = backend.startsWith("https") ? "wss" : "ws";
    const host = new URL(backend).host;

    const url = `${proto}://${host}/ws/chat/?token=${encodeURIComponent(token)}`;
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => console.log("✅ WebSocket connected");
    wsRef.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setMessages((prev) => [...prev, data]);
      } catch (err) {
        console.error("Invalid WS payload:", e.data);
      }
    };
    wsRef.current.onclose = () => console.log("❌ WebSocket closed");

    return () => wsRef.current && wsRef.current.close();
  }, []);

  const sendMessage = (obj) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj));
    } else {
      console.warn("WebSocket not open; message not sent", obj);
    }
  };

  return { messages, sendMessage, setMessages };
}
