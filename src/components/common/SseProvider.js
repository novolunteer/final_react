import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { updateToken } from "../../store/authSlice";
import jwtAxios from "../../api/jwtAxios";
import { EventSourcePolyfill } from "event-source-polyfill";
import axios from "axios";

const SseProvider = ({ userId, onMessage }) => {
  const dispatch = useDispatch();
  const eventSourceRef = useRef(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (!userId) return;

    const connect = () => {
      const accessToken = sessionStorage.getItem("accessToken");
      console.log("accessToken in sseProvaider",accessToken)

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
        
        console.log("accessToken in TOKEN_REFRESH",data.accessToken)
        console.log("refreshToken in TOKEN_REFRESH",data.refreshToken)

        dispatch(updateToken({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken
        }));

        es.close();
        connect();
      });

      // ✅ 에러 처리
es.onerror = () => {
    console.log("❌ SSE 에러 발생 - 재연결");
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    es.close();
    setTimeout(() => {
        isRefreshingRef.current = false;
        const token = sessionStorage.getItem("accessToken");
        if (token) {
            connect();
        } else {
            // 토큰 없으면 잠깐 더 기다렸다가 재시도
            setTimeout(() => {
                const retryToken = sessionStorage.getItem("accessToken");
                if (retryToken) connect();
            }, 2000);
        }
    }, 1000);
};
      // es.onerror = async () => {
      //   console.log("❌ SSE 에러 발생 - 재연결");

      //   if (isRefreshingRef.current) return;
      //   isRefreshingRef.current = true;

      //   try {
      //     // const accessToken = sessionStorage.getItem("accessToken");
      //     // const refreshToken = sessionStorage.getItem("refreshToken");
      //     // console.log("onerror 진입 시 토큰 ===>", accessToken, refreshToken);

      //     // const res = await axios.get(
      //     //   `http://localhost:8080/jwt/token/refresh?refreshToken=${refreshToken}`,
      //     //   {
      //     //     headers: {
      //     //       Authorization: `Bearer ${accessToken}`,
      //     //     },
      //     //   }
      //     // );

      //     // console.log("res in onerror",res)

      //     // sessionStorage.setItem("accessToken", res.data.dataaccessToken);
      //     // sessionStorage.setItem("refreshToken", res.data.refreshToken);

      //     // console.log("accessToken in onerror",res.data.accessToken)
      //     // console.log("refreshToken in onerror",res.data.refreshToken)

      //     // if(res.data.accessToken!==null && res.data.refreshToken!==null){
      //     //   console.log("✅ 토큰 재발급 성공");
      //     // }
        

      //     es.close();
      //     connect();
      //   // } catch (e) {
      //   //   console.log("SseProvider error==>",e)
      //   //   console.log("❌ 재발급 실패 → 로그인 필요");
      //   //   es.close();
      //   } finally {
      //     isRefreshingRef.current = false;
      //   }
      // };
    };

    connect();

    return () => {
      eventSourceRef.current?.close();
    };
  }, [userId]);

  return null;
};

export default SseProvider;