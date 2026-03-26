// src/layout/Header.jsx
import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

const Header = () => {
  const userName = "관리자"; // 나중에 로그인 정보로 교체

  const dispatch=useDispatch();

  const handleLogout = () => {
    try{
      dispatch(logout())
      alert("로그아웃 성공!")
    }catch(error){
      console.log(error);
      alert("로그아웃 실패!");
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <h2 className="header-title">Hospital ERP</h2>
      </div>

      <div className="header-right">
        <span className="header-user">{userName}님</span>
        <button className="logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
};

export default Header;