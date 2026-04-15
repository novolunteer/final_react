import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { updateAccessToken } from "../../store/authSlice";
import jwtAxios from "../../api/jwtAxios";
import { EventSourcePolyfill } from "event-source-polyfill";

const SseProvider = ({ userId, onMessage }) => {
  const dispatch = useDispatch();
  const eventSourceRef = useRef(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (!userId) return;

    const connect = () => {
      const accessToken = sessionStorage.getItem("accessToken");

      console.log("🔥 SSE 연결", userId);

      const es = new EventSourcePolyfill(
        `http://localhost:8080/api/sse/subscribe/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      eventSourceRef.current = es;

      // ✅ 정상 데이터
      es.addEventListener("newReservation", (event) => {
        const data = JSON.parse(event.data);
        console.log("🔥 새 예약:", data);
        onMessage?.(data);
      });

      // ✅ 서버에서 토큰 갱신 보내줄 때
      es.addEventListener("TOKEN_REFRESH", (event) => {
        const data = JSON.parse(event.data);

        sessionStorage.setItem("accessToken", data.accessToken);
        sessionStorage.setItem("refreshToken", data.refreshToken);

        dispatch(updateAccessToken(data.accessToken));

        es.close();
        connect();
      });

      // ✅ 에러 처리
      es.onerror = async () => {
        console.log("❌ SSE 에러 발생");

        if (isRefreshingRef.current) return;
        isRefreshingRef.current = true;

        try {
          const accessToken = sessionStorage.getItem("accessToken");
          const refreshToken = sessionStorage.getItem("refreshToken");

          const res = await jwtAxios.get(
            `/jwt/token/refresh?refreshToken=${refreshToken}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          sessionStorage.setItem("accessToken", res.data.accessToken);
          sessionStorage.setItem("refreshToken", res.data.refreshToken);

          console.log("✅ 토큰 재발급 성공");

          es.close();
          connect();
        } catch (e) {
          console.log("❌ 재발급 실패 → 로그인 필요");
          es.close();
        } finally {
          isRefreshingRef.current = false;
        }
      };
    };

    connect();

    return () => {
      eventSourceRef.current?.close();
    };
  }, [userId]);

  return null;
};

export default SseProvider;