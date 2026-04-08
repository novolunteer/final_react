import jwtAxios from "./jwtAxios";
export const API_BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

export const getBillingList=async(page, sort, keyword)=>{
    const res=await jwtAxios.get(`${API_BASE_URL}/billing`, {
        params: {
            page,
            size: 10,
            sort,
            ...(keyword && {keyword})
        }
    });

    return res.data;
}