
<<<<<<< HEAD
const host="/api/schedule_type";
=======
import jwtAxios, { API_BASE_URL } from "../jwtAxios";

const host=`${API_BASE_URL}/schedule_type`;
>>>>>>> 9a1f610be75b450ca0528488807f139d64137260

export const getSchedulePolicyList=async()=>{
    const res=await jwtAxios.get(`${host}/list`);
    return res.data;
};

export const getSchedulePolicy = async(scheduleTypeId)=>{
    const res=await jwtAxios.get(`${host}/${scheduleTypeId}`);
    return res.data;
};

export const registerSchedulePolicy = async(schedulePolicyData)=>{
    const res = await jwtAxios.post(`${host}/register`, schedulePolicyData);
    return res.data;
};

export const updateSchedulePolicy = async(scheduleTypeId, schedulePolicyData)=>{
    const res = await jwtAxios.put(`${host}/${scheduleTypeId}`, schedulePolicyData);
    return res.data;
};
