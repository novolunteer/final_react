import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import MainLayout from "../layout/MainLayout";
import AdminPage from "../pages/admin/AdminPage";
import CommunicationPage from "../pages/communication/CommunicationPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import PatientPage from "../pages/patient/PatientPage";
import ReservationPage from "../pages/reservation/ReservationPage";
import ReceptionPage from "../pages/reception/ReceptionPage";
import MedicalRecordPage from "../pages/medical/MedicalRecordPage";
import StaffPage from "../pages/hr/staff/StaffPage";
import NotificationPage from "../pages/notification/NotificationPage";
import LoginPage from "../pages/login/LoginPage";
import ChatLayout from "../pages/chat/Layout/ChatLayout";
import ReservationConfirm from "../pages/reservation/ReservationConfirm";
import DepartmentPage from "../pages/hr/department/DepartmentPage";
import Schedule_policyPage from "../pages/operation/Schedule_PolicyPage";
import DepartmentSchedulePolicyPage from "../pages/operation/DepartmentSchedulePolicyPage";
import StaffSchedulePage from "../pages/hr/staff/StaffSchedulePage";
import MySchedulePage from "../pages/hr/staff/MySchedulePage";
import InquiryChatBotPage from "../pages/InquiryChatbot/InquiryChatBotPage";
import BillingLayout from "../pages/billing/BillingLayout";
import JoinPage from "../pages/join/JoinPage";
import NaverJoin from "../pages/login/social/NaverJoin";
import SurgerySchedulePage from "../pages/surgery/SurgerySchedulePage";
import KakaoJoin from "../pages/login/social/KakaoJoin";

const DOCTORS = ["INTERN", "RESIDENT", "FELLOW", "SPECIALIST", "PROFESSOR", "HEAD_DOCTOR"];
const NURSES = ["NURSE", "CHARGE_NURSE", "HEAD_NURSE", "DIRECTOR_NURSE"];
const ADMIN_STAFF = ["STAFF", "MANAGER", "ADMIN"];
const MEDICAL_ROLES = ["DOCTOR", "NURSE", ...DOCTORS, ...NURSES];

// 권한 설정
const routeRoles = {
  "/dashboard":     null,
  "/patient":       null,
  "/my-schedule":   [...MEDICAL_ROLES],
  "/reservation":   [...DOCTORS, "PATIENT", ...NURSES, ...ADMIN_STAFF],
  "/reservationconfirm": [...DOCTORS, ...NURSES, ...ADMIN_STAFF],
  "/reception":     [...DOCTORS, ...ADMIN_STAFF],
  "/medical":       [...DOCTORS],
  "/billing":       [...ADMIN_STAFF],
  "/staff":         [...ADMIN_STAFF],
  "/department":    [...ADMIN_STAFF],
  "/staff_schedule":["HEAD_NURSE", "PROFESSOR", "ADMIN", "MANAGER"],
  "/surgery":       ["HEAD_NURSE", "PROFESSOR"],
  "/operation/schedule_policy":      ["ADMIN"],
  "/operation/dept_schedule_policy": ["ADMIN"],
  "/admin":         ["ADMIN"],
  "/communication": null,
  "/notification":  null,
  "/chat":          ["ADMIN", "DOCTOR", "NURSE", "MANAGER", "STAFF"],
  "/inquiry/chatbot": null,
};

// ProtectedRoute
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = sessionStorage.getItem("accessToken");

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles) {
    try {
      const decoded = jwtDecode(token);
      const roles = decoded.roles || [];
      if (!allowedRoles.some(role => roles.includes(role))) {
        return <Navigate to="/" replace />;
      }
    } catch (e) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

const RoleBasedHome = () => {
  const token = sessionStorage.getItem("accessToken");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const roles = decoded.roles || [];
      if (roles.some((r) => MEDICAL_ROLES.includes(r))) {
        return <Navigate to="/my-schedule" replace />;
      }
    } catch (e) {}
  }
  return <Navigate to="/communication" replace />;
};

const pageComponents = {
  "/dashboard":     <DashboardPage />,
  "/patient":       <PatientPage />,
  "/my-schedule":   <MySchedulePage />,
  "/reservation":   <ReservationPage />,
  "/reservationconfirm": <ReservationConfirm />,
  "/reception":     <ReceptionPage />,
  "/medical":       <MedicalRecordPage />,
  "/billing":       <BillingLayout />,
  "/staff":         <StaffPage />,
  "/department":    <DepartmentPage />,
  "/staff_schedule": <StaffSchedulePage />,
  "/surgery":       <SurgerySchedulePage />,
  "/operation/schedule_policy":      <Schedule_policyPage />,
  "/operation/dept_schedule_policy": <DepartmentSchedulePolicyPage />,
  "/admin":         <AdminPage />,
  "/communication": <CommunicationPage />,
  "/notification":  <NotificationPage />,
  "/chat":          <ChatLayout />,
  "/inquiry/chatbot": <InquiryChatBotPage />,
};

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleBasedHome />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/social/login/naver" element={<NaverJoin />} />
        <Route path="/social/login/kakao" element={<KakaoJoin />} />

        <Route element={<MainLayout />}>
          {Object.entries(pageComponents).map(([path, element]) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute allowedRoles={routeRoles[path]}>
                  {element}
                </ProtectedRoute>
              }
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;