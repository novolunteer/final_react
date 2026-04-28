import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

import StaffLayout from "../layout/StaffLayout";
import PatientLayout from "../layout/PatientLayout";

import LoginPage from "../pages/login/LoginPage";
import JoinPage from "../pages/join/JoinPage";
import NaverJoin from "../pages/login/social/NaverJoin";
import KakaoJoin from "../pages/login/social/KakaoJoin";

import PatientHomePage from "../pages/patient/PatientHomePage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import CommunicationPage from "../pages/communication/CommunicationPage";
import ReservationPage from "../pages/reservation/ReservationPage";
import ReservationConfirm from "../pages/reservation/ReservationConfirm";
import InquiryChatBotPage from "../pages/InquiryChatbot/InquiryChatBotPage";
import MedicalRecordPage from "../pages/medical/MedicalRecordPage";
import ReceptionPage from "../pages/reception/ReceptionPage";
import PatientPage from "../pages/patient/PatientPage";
import SurgerySchedulePage from "../pages/surgery/SurgerySchedulePage";
import BillingLayout from "../pages/billing/BillingLayout";
import StaffPage from "../pages/hr/staff/StaffPage";
import DepartmentPage from "../pages/hr/department/DepartmentPage";
import StaffSchedulePage from "../pages/hr/staff/StaffSchedulePage";
import MySchedulePage from "../pages/hr/staff/MySchedulePage";
import Schedule_policyPage from "../pages/operation/Schedule_PolicyPage";
import DepartmentSchedulePolicyPage from "../pages/operation/DepartmentSchedulePolicyPage";
import AdminPage from "../pages/admin/AdminPage";
import NotificationPage from "../pages/notification/NotificationPage";
import ChatLayout from "../pages/chat/Layout/ChatLayout";


const RoleBasedHome = () => {
  const token = sessionStorage.getItem("accessToken");
  if (token) {
    try {
      const { roles = [] } = jwtDecode(token);
      if (roles.includes("ADMIN")) return <Navigate to="/communication" replace />;
      if (roles.length > 0 && !roles.every((r) => r === "PATIENT")) return <Navigate to="/my-schedule" replace />;
    } catch {}
  }
  // 비로그인 or 환자 → 홈(3카드) 페이지 그대로 표시
  return <PatientHomePage />;
};

// Picks the right layout based on role
const LayoutWrapper = () => {
  const { roles } = useSelector((s) => s.auth);
  const token = sessionStorage.getItem("accessToken");

  const isStaff =
    token &&
    Array.isArray(roles) &&
    roles.some((r) => r !== "PATIENT");

  return isStaff ? <StaffLayout /> : <PatientLayout />;
};

const Router = () => (
  <BrowserRouter>
    <Routes>
      {/* No-layout pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/social/login/naver" element={<NaverJoin />} />
      <Route path="/social/login/kakao" element={<KakaoJoin />} />

      {/* Role-based layout wraps everything else */}
      <Route element={<LayoutWrapper />}>
        <Route path="/" element={<RoleBasedHome />} />

        {/* Shared */}
        <Route path="/communication"   element={<CommunicationPage />} />
        <Route path="/reservation"     element={<ReservationPage />} />
        <Route path="/reservationconfirm" element={<ReservationConfirm />} />
        <Route path="/inquiry/chatbot" element={<InquiryChatBotPage />} />
        <Route path="/notification"    element={<NotificationPage />} />

        {/* Staff / Medical */}
        <Route path="/dashboard"   element={<DashboardPage />} />
        <Route path="/my-schedule" element={<MySchedulePage />} />
        <Route path="/medical"     element={<MedicalRecordPage />} />
        <Route path="/reception"   element={<ReceptionPage />} />
        <Route path="/patient"     element={<PatientPage />} />
        <Route path="/surgery"     element={<SurgerySchedulePage />} />
        <Route path="/billing"     element={<BillingLayout />} />
        <Route path="/chat"        element={<ChatLayout />} />

        {/* HR */}
        <Route path="/staff"          element={<StaffPage />} />
        <Route path="/department"     element={<DepartmentPage />} />
        <Route path="/staff_schedule" element={<StaffSchedulePage />} />

        {/* Operations */}
        <Route path="/operation/schedule_policy"      element={<Schedule_policyPage />} />
        <Route path="/operation/dept_schedule_policy" element={<DepartmentSchedulePolicyPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default Router;
