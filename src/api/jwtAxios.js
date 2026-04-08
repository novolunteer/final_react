import axios from "axios";
export const API_BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

const jwtAxios=axios.create();

const beforeRequest=(config)=>{
    const accessToken=sessionStorage.getItem("accessToken");
    if(!accessToken){ //로그인 안 했을 때
        return Promise.reject({ //에러 정보를 갖는 response 객체
            response:{
                data:{
                    error:'REQUIRED_LOGIN'
                }
            }
        })
    } 

    config.headers.Authorization=`Bearer ${accessToken}`;

    //리턴된 config에 설정된 값들이 request 객체에 사용됨
    return config;
}

const refreshJWT=async(accessToken, refreshToken)=>{
    const header={headers:{"Authorization":`Bearer ${accessToken}`}};
    const res=await axios.get(`${API_BASE_URL}/jwt/token/refresh?refreshToken=${refreshToken}`,
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

const responseFail=async(error)=>{
    const errorRes=error.response;

    if(errorRes && errorRes.status === 401){
        const data=errorRes.data;

        if(data && data.error === "ERROR_ACCESS_TOKEN"){ //토큰이 유효하지 않을 때
            //리프레쉬 토큰 보내서 새로운 액세스 토큰 얻기
            let accessToken=sessionStorage.getItem("accessToken");
            let refreshToken=sessionStorage.getItem("refreshToken");
            const result=await refreshJWT(accessToken, refreshToken);
            accessToken=result.accessToken;
            refreshToken=result.refreshToken;

            //변경된 정보 세션 스토리지에 다시 저장
            sessionStorage.setItem("accessToken",accessToken);
            sessionStorage.setItem("refreshToken",refreshToken);

            //원래 요청했던 url 정보 얻어오기(토큰 새로 받아왔으니까 다시 요청하려고)
            const originalRequest=error.config;
            originalRequest.headers.Authorization=`Bearer ${accessToken}`;

            //재요청
            return await jwtAxios(originalRequest);
        }
    }

    return Promise.reject(error);
}

//서버에 요청하기 전에 beforeReq 함수가 호출되고
// 요청이 실패하면 requestFail 함수가 호출된다
jwtAxios.interceptors.request.use(beforeRequest,requestFail);

//서버에서 온 데이터를 응답하기 전에 beforeRes 함수가 호출되고
// 응답이 실패하면 responseFail 함수가 호출된다
jwtAxios.interceptors.response.use(beforeResponse,responseFail);

export default jwtAxios;