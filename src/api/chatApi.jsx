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

export const uploadAttachment=async(files) => {
    const res=await jwtAxios.post(`${host}/upload/attachment`, {
        params: files ? {files} : {}
    });
    return res.data;
}

export const sendMessage=async(param)=>{
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

export const getStaffListForInvite=async (roomId) => {
    const res=await jwtAxios.get(`${host}/room/${roomId}/invite/staff`);
    return res.data;
}

export const inviteStaff=async (roomId, staffIds) => {
    const res=await jwtAxios.post(`${host}/room/${roomId}/invite`, staffIds);
    return res.data;
}

export const leaveChatRoom=async (roomId) => {
    const res=await jwtAxios.delete(`${host}/room/${roomId}/leave`);
    return res.data;
}

export const deleteMessage=async(messageId) => {
    const res=await jwtAxios.delete(`${host}/delete/message/${messageId}`);
    return res.data;
}

export const editMessage=async(messageId, content) => {
    const res=await jwtAxios.put(`${host}/edit/message/${messageId}`, {
        content:content
    });
    return res.data;
}