import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateAccessToken } from "../../store/authSlice";

const SseProvider = ({ userId, onMessage }) => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (!userId) return;
    console.log("🔥 SSE 시작", userId);

    const eventSource = new EventSource(
      `http://localhost:8080/api/sse/subscribe/${userId}`,
      { withCredentials: true });
      console.log("SSE 연결 시도", userId);

    eventSource.addEventListener("newReservation", (event) => {
      const data = JSON.parse(event.data);
      console.log("🔥 새 예약:", data);

      onMessage?.(data);
    });

     eventSource.addEventListener("TOKEN_REFRESH", (event) => {
      const data = JSON.parse(event.data);

      console.log("🔥 토큰 갱신 받음:", data);

      if (data.accessToken) {
        document.cookie = `accessToken=${data.accessToken}; path=/`;
        dispatch(updateAccessToken(data.accessToken));
      }
      if (data.refreshToken) {
        document.cookie = `refreshToken=${data.refreshToken}; path=/`;
      }
    });

    eventSource.onerror = async (err) => {
      console.log("SSE 에러", err);
    }

    return () => {
      eventSource.close();
    };
  }, [userId]);

  return null;
};

export default SseProvider;