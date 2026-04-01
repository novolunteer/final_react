import axios from "axios";

const host = "http://localhost:8080/api/staff";

export const getStaffList = async() => {
    const res = await axios.get(`${host}/list`);
    return res.data;
};

export const getStaffOne = async(staffId) => {
    const res = await axios.get(`${host}/${staffId}`);
    return res.data;
};

export const registerStaff = async(staffData) => {
    const res = await axios.post(`${host}/register`, staffData);
    return res.data;
};

export const updateStaff = async (staffData) =>{
    const res = await axios.put(`${host}/update`, staffData);
    return res.data;
};
export const deleteStaff = async(staffId) => {
    const res= await axios.delete(`${host}/${staffId}`);
    return res.data;
};