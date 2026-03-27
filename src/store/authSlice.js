import { createSlice } from "@reduxjs/toolkit";

const initialState={
    user:JSON.parse(sessionStorage.getItem("user"))
}

const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{
        loginSuccess:(state, action)=>{
            state.user=action.payload;
            sessionStorage.setItem("user",JSON.stringify(action.payload))
        },
        logout:(state)=>{
            state.user=null,
            sessionStorage.removeItem("user")
        }
    }
})
export const {loginSuccess, logout}=authSlice.actions;
export default authSlice.reducer;