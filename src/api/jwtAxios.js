import axios from "axios";
import store from "../store/store"
import { updateToken } from "../store/authSlice";

export const API_BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

const jwtAxios=axios.create({
    baseURL: API_BASE_URL,
});

const beforeRequest=(config)=>{
    const accessToken=sessionStorage.getItem("accessToken");
    console.log("beforeRequest===>", accessToken)
    if(!accessToken){ //로그인 안 했을 때
        return Promise.reject({ //에러 정보를 갖는 response 객체
            response:{
              status:401,
                data:{
                    error:'REQUIRED_LOGIN'
                }
            }
        })
    } 
    config.headers = config.headers ?? {};
    config.headers.Authorization=`Bearer ${accessToken}`;

    //리턴된 config에 설정된 값들이 request 객체에 사용됨
    return config;
}

const refreshJWT=async(accessToken, refreshToken)=>{
    console.log("jwtAxios accessToken=========>", accessToken)
    console.log("jwtAxios refreshToken=========>", refreshToken)

    const header={headers:{"Authorization":`Bearer ${accessToken}`}};
    const res=await axios.get(`http://localhost:8080/jwt/token/refresh?refreshToken=${refreshToken}`,
        header
    );
    console.log("refresh => ", res)
    return res.data;
}

const beforeResponse=async(res)=>{
    return res;
}

const requestFail=(error)=>{
    return Promise.reject(error);
}

// const responseFail=async(error)=>{
//     const errorRes=error.response;
//      console.log("responseFail 진입 ===>", errorRes?.status, errorRes?.data);

//     if(errorRes && errorRes.status === 401){
//         const data=errorRes.data;
//         console.log("401 data ===>", data); 

//         if(data && data.error === "ERROR_ACCESS_TOKEN"){ //토큰이 유효하지 않을 때
//             //리프레쉬 토큰 보내서 새로운 액세스 토큰 얻기
//             let accessToken=sessionStorage.getItem("accessToken");
//             let refreshToken=sessionStorage.getItem("refreshToken");

//             console.log("jwtAxios before refresh===>",accessToken,refreshToken);

//             const result=await refreshJWT(accessToken, refreshToken);
//             console.log("refresh result ===>", result); 
//             accessToken=result.accessToken;
//             refreshToken=result.refreshToken;

//             console.log("jwtAxios after refresh===>",accessToken,refreshToken);
//             //변경된 정보 세션 스토리지에 다시 저장
//             sessionStorage.setItem("accessToken",accessToken);
//             sessionStorage.setItem("refreshToken",refreshToken);
//             store.dispatch(updateToken({accessToken, refreshToken}));

//             //원래 요청했던 url 정보 얻어오기(토큰 새로 받아왔으니까 다시 요청하려고)
//             const originalRequest=error.config;
//             originalRequest.headers.Authorization=`Bearer ${accessToken}`;

//             //재요청
//             return await jwtAxios(originalRequest);
//         }
//     }

//     return Promise.reject(error);
// }
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (accessToken) => {
    refreshSubscribers.forEach(cb => cb(accessToken));
    refreshSubscribers = [];
};

const responseFail = async (error) => {
    const errorRes = error.response;
    console.log("responseFail 진입 ===>", errorRes?.status, errorRes?.data);

    if (errorRes && errorRes.status === 401) {
        const data = errorRes.data;
        console.log("401 data ===>", data);

        if (data && data.error === "ERROR_ACCESS_TOKEN") {
            if (isRefreshing) {
                return new Promise(resolve => {
                    refreshSubscribers.push(accessToken => {
                        error.config.headers.Authorization = `Bearer ${accessToken}`;
                        resolve(jwtAxios(error.config));
                    });
                });
            }

            isRefreshing = true;

            try {
                let accessToken = sessionStorage.getItem("accessToken");
                let refreshToken = sessionStorage.getItem("refreshToken");

                console.log("jwtAxios before refresh===>", accessToken, refreshToken);

                const result = await refreshJWT(accessToken, refreshToken);
                console.log("refresh result ===>", result);
                accessToken = result.accessToken;
                refreshToken = result.refreshToken;

                console.log("jwtAxios after refresh===>", accessToken, refreshToken);

                sessionStorage.setItem("accessToken", accessToken);
                sessionStorage.setItem("refreshToken", refreshToken);
                store.dispatch(updateToken({ accessToken, refreshToken }));

                onRefreshed(accessToken);

                const originalRequest = error.config;
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return jwtAxios(originalRequest);
            } finally {
                isRefreshing = false;
            }
        }
    }

    return Promise.reject(error);
};

//서버에 요청하기 전에 beforeReq 함수가 호출되고
// 요청이 실패하면 requestFail 함수가 호출된다
jwtAxios.interceptors.request.use(beforeRequest,requestFail);

//서버에서 온 데이터를 응답하기 전에 beforeRes 함수가 호출되고
// 응답이 실패하면 responseFail 함수가 호출된다
jwtAxios.interceptors.response.use(beforeResponse,responseFail);

export default jwtAxios;