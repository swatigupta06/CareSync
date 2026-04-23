import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import PatientOverview from './dashboards/PatientOverview';
import DoctorOverview from './dashboards/DoctorOverview';
import ReceptionistOverview from './dashboards/ReceptionistOverview';
import AdminOverview from './dashboards/AdminOverview';
import DoctorsList from './dashboards/DoctorsList';
import MyAppointments from './dashboards/MyAppointments';
import BedManagement from './dashboards/BedManagement';
import EmergencySOS from './dashboards/EmergencySOS';
import LabReports from './dashboards/LabReports';
import LabServices from './dashboards/LabServices';
import MedicalRecords from './dashboards/MedicalRecords';
import UserDirectory from './dashboards/UserDirectory';
import Profile from './dashboards/Profile';
import { useApp } from '../AppContext';

export default function Dashboard() {
  const { user } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="flex bg-slate-50 min-h-screen relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-6 md:p-10 lg:p-16 overflow-y-auto custom-scrollbar">
          <Routes>
            <Route index element={
              user?.role === 'Patient' ? <PatientOverview /> :
              user?.role === 'Doctor' ? <DoctorOverview /> :
              user?.role === 'Receptionist' ? <ReceptionistOverview /> :
              <AdminOverview />
            } />
            
            {/* Common but role-protected routes */}
            <Route path="profile" element={<Profile />} />
            <Route path="doctors" element={<DoctorsList />} />
            <Route path="appointments" element={<MyAppointments />} />
            <Route path="beds" element={<BedManagement />} />
            <Route path="sos" element={<EmergencySOS />} />
            <Route path="reports" element={<LabReports />} />
            <Route path="labs" element={<LabServices />} />
            <Route path="records" element={<MedicalRecords />} />
            <Route path="users" element={<UserDirectory />} />
            
            {/* Role specific views can also be aliases or unique */}
            <Route path="schedule" element={<DoctorOverview />} />
            <Route path="patients" element={<DoctorOverview />} />
            <Route path="manage-appointments" element={<ReceptionistOverview />} />
            <Route path="registration" element={<ReceptionistOverview />} />
            <Route path="analytics" element={<AdminOverview />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
