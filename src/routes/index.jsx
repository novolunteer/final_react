import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import AdminPage from "../pages/admin/AdminPage";
import AdmissionPage from "../pages/admission/AdmissionPage";
import CommunicationPage from "../pages/communication/CommunicationPage";
import BillingPage from "../pages/billing/BillingPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import PatientPage from "../pages/patient/PatientPage";
import ReservationPage from "../pages/reservation/ReservationPage";
import ReceptionPage from "../pages/reception/ReceptionPage";
import EmergencyPage from "../pages/emergency/EmergencyPage";
import MedicalRecordPage from "../pages/medical/MedicalRecordPage";
import WardPage from "../pages/ward/WardPage";
import StaffPage from "../pages/staff/StaffPage";
import StatisticsPage from "../pages/statistics/StatisticsPage";
import NotificationPage from "../pages/notification/NotificationPage";
import LoginPage from "../pages/login/LoginPage";
<<<<<<< HEAD
import ChatRoomList from "../pages/chat/component/ChatRoomList";
import ChatLayout from "../pages/chat/Layout/ChatLayout";
=======
import ReservationConfirm from "../pages/reservation/ReservationConfirm";
>>>>>>> d577177436668ad510825a9d8264119c56448dc4


const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/patient" element={<PatientPage />} />
          <Route path="/reservation" element={<ReservationPage />} />
          <Route path="/reservationconfrim" element={<ReservationConfirm />} />
          <Route path="/reception" element={<ReceptionPage />} />
          <Route path="/medical" element={<MedicalRecordPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/admission" element={<AdmissionPage />} />
          <Route path="/ward" element={<WardPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/communication" element={<CommunicationPage />} />
          <Route path="/notification" element={<NotificationPage />} />
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/chat" element={<ChatLayout/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default Router;