// src/layout/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./layout.css";

const MainLayout = () => {
  return (
    <div className="layout-container">
      <Sidebar />

      <div className="layout-main">
        <Header />

        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;