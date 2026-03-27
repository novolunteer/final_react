// src/layout/Sidebar.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";

const Sidebar = () => {
  // 나중에 role 값에 따라 메뉴 다르게 보이게 하면 됨
  const menuItems = [
    { path: "/", label: "대시보드" },
    { path: "/patient", label: "환자 관리" },
    { path: "/reservation", label: "예약 / 접수" },
    { path: "/medical", label: "진료 관리" },
    { path: "/emergency", label:"응급실"},
    { path: "/admission", label:"입원관리"},
    { path: "/ward", label:"병동관리"},
    { path: "/billing", label: "수납 / 보험" },
    { path: "/staff", label: "직원 관리" },
    { path: "/admin", label: "관리자" },
    { path: "/statistics", label:"통계"},
    { path: "/communication", label:"커뮤니케이션"},
    { path: "/notification", label:"알림"},
    { path: "/login", label: "로그인" },
    { path: "/chat", label: "채팅" }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">메뉴</div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;