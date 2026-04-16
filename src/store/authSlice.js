import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userId: sessionStorage.getItem("userId")
    ? Number(sessionStorage.getItem("userId"))
    : null,
  email: sessionStorage.getItem("email")
    ? sessionStorage.getItem("email")
    : null,
  accessToken: sessionStorage.getItem("accessToken")
    ? sessionStorage.getItem("accessToken")
    : null,
  roles: sessionStorage.getItem("roles")
    ? JSON.parse(sessionStorage.getItem("roles"))
    : [],
  status: sessionStorage.getItem("status")
    ? sessionStorage.getItem("status")
    : null,
  departmentId: sessionStorage.getItem("departmentId")
    ? Number(sessionStorage.getItem("departmentId"))
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { userId, email, accessToken, roles, status, departmentId } =
        action.payload;

      state.userId = userId;
      state.email = email;
      state.accessToken = accessToken;
      state.roles = roles;
      state.status = status;
      state.departmentId = departmentId != null ? departmentId : null;

      sessionStorage.setItem("userId", String(userId));
      sessionStorage.setItem("email", email);
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("roles", JSON.stringify(roles));
      sessionStorage.setItem("status", status);

      if (departmentId != null) {
        sessionStorage.setItem("departmentId", String(departmentId));
      } else {
        sessionStorage.removeItem("departmentId");
      }
    },

    updateToken: (state, action) => {
      const { accessToken } = action.payload;

      state.accessToken = accessToken;
      sessionStorage.setItem("accessToken", accessToken);
    },

    logout: (state) => {
      state.userId = null;
      state.email = null;
      state.accessToken = null;
      state.roles = [];
      state.status = null;
      state.departmentId = null;

      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("roles");
      sessionStorage.removeItem("status");
      sessionStorage.removeItem("departmentId");
    },
  },
});

export const { loginSuccess, logout, updateToken } = authSlice.actions;
export default authSlice.reducer;