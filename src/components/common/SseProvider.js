import { useEffect } from "react";

const SseProvider = ({ userId, onMessage }) => {
  
  useEffect(() => {
    if (!userId) return;
    console.log("🔥 SSE 시작", userId);

    const token = document.cookie
            .split("; ")
            .find(row => row.startsWith("JWT="))
            ?.split("=")[1];
    console.log("🔥 token", token);

    const eventSource = new EventSource(
      `http://localhost:8080/api/sse/subscribe/${userId}?token=${encodeURIComponent(token)}`,
      { withCredentials: true });
      console.log("SSE 연결 시도", userId);
      
    eventSource.onerror = async (err) => {
      console.log("SSE 에러", err);
      if (isExpired(token)) {
        await refreshToken();
      }
    }

    eventSource.addEventListener("newReservation", (event) => {
      const data = JSON.parse(event.data);
      console.log("🔥 새 예약:", data);

      onMessage?.(data);
    });

    return () => {
      eventSource.close();
    };
  }, [userId]);

  return null;
};

export default SseProvider;