import jwtAxios from "./jwtAxios";
export const API_BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

export const getMyReservations=async(page, sort, status) => {
    const res=await jwtAxios.get(`${API_BASE_URL}/api/patient/reservation`, {
        params: {
            page,
            sort,
            size: 10,
            ...(status && {status})
        }
    });

    return res.data;
}

export const getMyReceptions=async(page, sort) => {
    const res=await jwtAxios.get(`${API_BASE_URL}/api/patient/reception`, {
        params: {
            page,
            sort,
            size: 10
        }
    });

    return res.data;
}

export const getMyPaymentList=async(page, sort, receptionId) => {
    const res=await jwtAxios.get(`${API_BASE_URL}/api/patient/payment`, {
        params: {
            page,
            sort,
            size: 3,
            receptionId
        }
    });

    return res.data;
}

export const getMyInformation=async() => {
    const res=await jwtAxios.get(`${API_BASE_URL}/api/patient/information`);
    return res.data;
}