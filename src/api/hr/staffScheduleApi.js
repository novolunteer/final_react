import axios from "axios";

const host="http://localhost:8080/api/staff_schedule";

export const getScheduleList=async()=>{
    const res=await axios.get(`${host}/list`);
    return res.data;
};

export const getSchedule = async(scheduleId)=>{
    const res=await axios.get(`${host}/${scheduleId}`);
    return res.data;
};

export const registerSchedule = async(scheduleData)=>{
    const res = await axios.post(`${host}/register`, scheduleData);
    return res.data;
};

export const updateSchedule = async(scheduleId, scheduleData)=>{
    const res = await axios.put(`${host}/${scheduleId}`, scheduleData);
    return res.data;
};

export const deleteSchedule = async(scheduleId)=>{
    const res = await axios.delete(`${host}/${scheduleId}`);
    return res.data;
}