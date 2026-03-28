// src/layout/Header.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const user=useSelector(state => state.auth.user);
  const userName = "관리자"; // 나중에 로그인 정보로 교체

  const dispatch=useDispatch();
  const navigate=useNavigate();

  const handleLogInAndOut = () => {
    if(!user){
      navigate("/login", {replace:true})
    } else {
      try{
        dispatch(logout())
        alert("로그아웃 성공!");
        navigate("/", {replace:true});
      }catch(error){
        console.log(error);
        alert("로그아웃 실패!");
      }
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <h2 className="header-title">Hospital ERP</h2>
      </div>

      <div className="header-right">
        <span className="header-user">{userName}님</span>
        <button className="logout-btn" onClick={handleLogInAndOut}>
          {
            user ? '로그아웃' : '로그인'
          }
        </button>
      </div>
    </header>
  );
};

export default Header;