import { createSlice } from "@reduxjs/toolkit";

const initialState={
    userId:sessionStorage.getItem("userId") ? Number(sessionStorage.getItem("userId")) : null,
    email:sessionStorage.getItem("email") ? sessionStorage.getItem("email") : null,
    accessToken:sessionStorage.getItem("accessToken") ? sessionStorage.getItem("accessToken") : null,
    refreshToken:sessionStorage.getItem("refreshToken") ? sessionStorage.getItem("refreshToken") : null,
    roles: sessionStorage.getItem("roles") ? JSON.parse(sessionStorage.getItem("roles")) : [],
    status:sessionStorage.getItem("status") ? sessionStorage.getItem("status") : null
};

const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        loginSuccess:(state, action)=>{
            const { userId, email, accessToken, refreshToken, roles, status }=action.payload;

            state.userId=userId;
            state.email=email;
            state.accessToken=accessToken;
            state.refreshToken=refreshToken;
            state.roles=roles;
            state.status=status;

            sessionStorage.setItem("userId", String(userId));
            sessionStorage.setItem("email", email);
            sessionStorage.setItem("accessToken", accessToken);
            sessionStorage.setItem("refreshToken", refreshToken);
            sessionStorage.setItem("roles", JSON.stringify(roles));
            sessionStorage.setItem("status", status);
        },
        logout:(state)=>{
            state.userId=null;
            state.email=null;
            state.accessToken=null;
            state.refreshToken=null;
            state.roles=[];
            state.status=null;

            sessionStorage.removeItem("userId");
            sessionStorage.removeItem("email");
            sessionStorage.removeItem("accessToken");
            sessionStorage.removeItem("refreshToken");
            sessionStorage.removeItem("roles");
            sessionStorage.removeItem("status");
        }
    }
});
export const {loginSuccess, logout}=authSlice.actions;
export default authSlice.reducer;