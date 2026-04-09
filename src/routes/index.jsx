import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import AdminPage from "../pages/admin/AdminPage";
import CommunicationPage from "../pages/communication/CommunicationPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import PatientPage from "../pages/patient/PatientPage";
import ReservationPage from "../pages/reservation/ReservationPage";
import ReceptionPage from "../pages/reception/ReceptionPage";
import MedicalRecordPage from "../pages/medical/MedicalRecordPage";
import StaffPage from "../pages/hr/staff/StaffPage";
import StatisticsPage from "../pages/statistics/StatisticsPage";
import NotificationPage from "../pages/notification/NotificationPage";
import LoginPage from "../pages/login/LoginPage";
import ChatLayout from "../pages/chat/Layout/ChatLayout";
import ReservationConfirm from "../pages/reservation/ReservationConfirm";
import DepartmentPage from "../pages/hr/department/DepartmentPage";
import Schedule_policyPage from "../pages/operation/Schedule_PolicyPage";
import StaffSchedulePage from "../pages/hr/staff/StaffSchedulePage";
import InquiryChatBotPage from "../pages/InquiryChatbot/InquiryChatBotPage";
import BillingLayout from "../pages/billing/BillingLayout";
import JoinPage from "../pages/join/JoinPage";


const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/patient" element={<PatientPage />} />
          <Route path="/reservation" element={<ReservationPage />} />
          <Route path="/reservationconfirm" element={<ReservationConfirm />} />
          <Route path="/reception" element={<ReceptionPage />} />
          <Route path="/medical" element={<MedicalRecordPage />} />
          <Route path="/billing" element={<BillingLayout/>} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/department" element={<DepartmentPage/>}/>
          <Route path="/operation/schedule_policy" element={<Schedule_policyPage/>}/>
          <Route path="/staff_schedule" element={<StaffSchedulePage/>}/>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/communication" element={<CommunicationPage />} />
          <Route path="/notification" element={<NotificationPage />} />
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/chat" element={<ChatLayout/>}/>
          <Route path="/inquiry/chatbot" element={<InquiryChatBotPage/>}/>
          <Route path="/join" element={<JoinPage/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default Router;