import axios from "axios";

const host="http://localhost:8080/api/department";

export const getDepartmentList= async()=>{
    const res=await axios.get(`${host}/list`);
    return res.data;
};

export const getDepartmentOne = async(departmentId)=>{
    const res=await axios.get(`${host}/${departmentId}`);
    return res.data;
};

export const registerDepartment = async(dapartmentData)=>{
    const res = await axios.post(`${host}/register`, dapartmentData);
    return res.data;
};

export const updateDepartment = async(departmentData)=>{
    const res = await axios.put(`${host}/${departmentData.departmentId}`, departmentData);
    return res.data;
};

export const deleteDepartment = async(departmentId)=>{
    const res = await axios.delete(`${host}/${departmentId}`);
    return res.data;
}