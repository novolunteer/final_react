import { createSlice } from "@reduxjs/toolkit";

const initialState={
    userId:sessionStorage.getItem("userId") ? Number(sessionStorage.getItem("userId")) : null,
    email:sessionStorage.getItem("email") ? sessionStorage.getItem("email") : null,
    accessToken:sessionStorage.getItem("accessToken") ? sessionStorage.getItem("accessToken") : null,
    refreshToken:sessionStorage.getItem("refreshToken") ? sessionStorage.getItem("refreshToken") : null,
    roles: sessionStorage.getItem("roles") ? JSON.parse(sessionStorage.getItem("roles")) : [],
    status:sessionStorage.getItem("status") ? sessionStorage.getItem("status") : null,
    departmentId:sessionStorage.getItem("departmentId") ? Number(sessionStorage.getItem("departmentId")) : null
};

const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        loginSuccess:(state, action)=>{
            const { userId, email, accessToken, refreshToken, roles, status, departmentId }=action.payload;

            state.userId=userId;
            state.email=email;
            state.accessToken=accessToken;
            state.refreshToken=refreshToken;
            state.roles=roles;
            state.status=status;
            state.departmentId=departmentId ? departmentId : null;

            sessionStorage.setItem("userId", String(userId));
            sessionStorage.setItem("email", email);
            sessionStorage.setItem("accessToken", accessToken);
            sessionStorage.setItem("refreshToken", refreshToken);
            sessionStorage.setItem("roles", JSON.stringify(roles));
            sessionStorage.setItem("status", status);
            sessionStorage.setItem("departmentId", departmentId != null ? String(departmentId) : null);
        },
        updateAccessToken: (state, action) => {
            state.accessToken = action.payload;
            sessionStorage.setItem("accessToken", action.payload);
        },
        logout:(state)=>{
            state.userId=null;
            state.email=null;
            state.accessToken=null;
            state.refreshToken=null;
            state.roles=[];
            state.status=null;
            state.departmentId=null;

            sessionStorage.removeItem("userId");
            sessionStorage.removeItem("email");
            sessionStorage.removeItem("accessToken");
            sessionStorage.removeItem("refreshToken");
            sessionStorage.removeItem("roles");
            sessionStorage.removeItem("status");
            sessionStorage.removeItem("departmentId");
        }
    }
});
export const {loginSuccess, logout, updateAccessToken}=authSlice.actions;
export default authSlice.reducer;