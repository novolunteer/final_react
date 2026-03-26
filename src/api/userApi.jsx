import axios from "axios";
import jwtAxios from "./jwtAxios";

export const host='http://localhost:8080';
export const loginPost=async(param)=>{
    const params=new URLSearchParams();
    params.append("email",param.email);
    params.append("password",param.password);
    const res=await axios.post(`${host}/login`,params);
    console.log("res", res);
    return res.data;
}

