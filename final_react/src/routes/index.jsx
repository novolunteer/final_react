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
  if (!token) return <Navigate to="/login" replace />;
  try {
    const decoded = jwtDecode(token);
    const roles = decoded.roles || [];
    if (roles.some((r) => MEDICAL_ROLES.includes(r))) {
      return <Navigate to="/my-schedule" replace />;
    }
  } catch (e) {}
  return <Navigate to="/communication" replace />;
};

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleBasedHome />} />
        {/* 인증 불필요 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/social/login/naver" element={<NaverJoin />} />
        <Route path="/social/login/kakao" element={<KakaoJoin />} />

        {/* 인증 필요 */}
        <Route element={
          <ProtectedRoute allowedRoles={null}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={routeRoles["/dashboard"]}><DashboardPage /></ProtectedRoute>} />
          <Route path="/patient" element={<ProtectedRoute allowedRoles={routeRoles["/patient"]}><PatientPage /></ProtectedRoute>} />
          <Route path="/my-schedule" element={<ProtectedRoute allowedRoles={routeRoles["/my-schedule"]}><MySchedulePage /></ProtectedRoute>} />
          <Route path="/reservation" element={<ProtectedRoute allowedRoles={routeRoles["/reservation"]}><ReservationPage /></ProtectedRoute>} />
          <Route path="/reservationconfirm" element={<ProtectedRoute allowedRoles={routeRoles["/reservationconfirm"]}><ReservationConfirm /></ProtectedRoute>} />
          <Route path="/reception" element={<ProtectedRoute allowedRoles={routeRoles["/reception"]}><ReceptionPage /></ProtectedRoute>} />
          <Route path="/medical" element={<ProtectedRoute allowedRoles={routeRoles["/medical"]}><MedicalRecordPage /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute allowedRoles={routeRoles["/billing"]}><BillingLayout /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute allowedRoles={routeRoles["/staff"]}><StaffPage /></ProtectedRoute>} />
          <Route path="/department" element={<ProtectedRoute allowedRoles={routeRoles["/department"]}><DepartmentPage /></ProtectedRoute>} />
          <Route path="/staff_schedule" element={<ProtectedRoute allowedRoles={routeRoles["/staff_schedule"]}><StaffSchedulePage /></ProtectedRoute>} />
          <Route path="/surgery" element={<ProtectedRoute allowedRoles={routeRoles["/surgery"]}><SurgerySchedulePage /></ProtectedRoute>} />
          <Route path="/operation/schedule_policy" element={<ProtectedRoute allowedRoles={routeRoles["/operation/schedule_policy"]}><Schedule_policyPage /></ProtectedRoute>} />
          <Route path="/operation/dept_schedule_policy" element={<ProtectedRoute allowedRoles={routeRoles["/operation/dept_schedule_policy"]}><DepartmentSchedulePolicyPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={routeRoles["/admin"]}><AdminPage /></ProtectedRoute>} />
          <Route path="/communication" element={<ProtectedRoute allowedRoles={routeRoles["/communication"]}><CommunicationPage /></ProtectedRoute>} />
          <Route path="/notification" element={<ProtectedRoute allowedRoles={routeRoles["/notification"]}><NotificationPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute allowedRoles={routeRoles["/chat"]}><ChatLayout /></ProtectedRoute>} />
          <Route path="/inquiry/chatbot" element={<ProtectedRoute allowedRoles={routeRoles["/inquiry/chatbot"]}><InquiryChatBotPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;