// src/layout/Header.jsx
import React from "react";

const Header = () => {
  const userName = "관리자"; // 나중에 로그인 정보로 교체

  const handleLogout = () => {
    // 나중에 토큰 삭제 + 로그인 페이지 이동으로 바꾸면 됨
    alert("로그아웃");
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