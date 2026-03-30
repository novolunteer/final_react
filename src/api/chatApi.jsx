import jwtAxios from "./jwtAxios";

export const host='http://localhost:8080/chat';
export const chatRoomList=async()=>{
    const res=await jwtAxios.get(`${host}/room/list`);
    return res.data;
}

export const chatRoomDetail=async({roomId, cursor})=>{
    const res=await jwtAxios.get(`${host}/room/${roomId}`, {
        params: cursor ? {cursor} : {}
    });
    return res.data;
}

export const sendUserMessage=async(param)=>{
    const res=await jwtAxios.post(`${host}/send/user`,{
        roomId:param.roomId,
        content:param.content
    });

    return res.data;
}

export const markAsRead=async(roomId)=>{
    const res=await jwtAxios.post(`${host}/read/${roomId}`);
    return res.data;
}

export const createChatRoom=async (param) =>{
    const res=await jwtAxios.post(`${host}/room`, param);
    return res.data;
}

export const getStaffList=async (keyword) => {
    const res=await jwtAxios.get(`${host}/staff/list`, {
        params: keyword ? { keyword } : {}
    });
    return res.data;
}