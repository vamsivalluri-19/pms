import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout layouts
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

// Public pages
import Home from '../pages/Home.jsx';
import Login from '../pages/Auth/Login.jsx';
import Register from '../pages/Auth/Register.jsx';
import ForgotPassword from '../pages/Auth/ForgotPassword.jsx';
import ResetPassword from '../pages/Auth/ResetPassword.jsx';
import InterviewRoom from '../pages/Auth/InterviewRoom.jsx';
import VerifyEmail from '../pages/Auth/VerifyEmail.jsx';

// Student pages
import StudentDashboard from '../pages/Student/Dashboard.jsx';
import StudentProfile from '../pages/Student/Profile.jsx';
import StudentDrives from '../pages/Student/Drives.jsx';
import StudentApplications from '../pages/Student/Applications.jsx';

// Company pages
import CompanyDashboard from '../pages/Company/Dashboard.jsx';
import CompanyProfile from '../pages/Company/Profile.jsx';
import CompanyJobsDrives from '../pages/Company/JobsDrives.jsx';
import CompanyApplicants from '../pages/Company/Applicants.jsx';

// Manager pages
import ManagerDashboard from '../pages/Manager/Dashboard.jsx';
import ManagerStudents from '../pages/Manager/Students.jsx';
import ManagerReports from '../pages/Manager/Reports.jsx';

// Admin pages
import AdminDashboard from '../pages/Admin/Dashboard.jsx';

// Error pages
import { NotFound, Unauthorized } from '../pages/Errors/ErrorPages.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      {/* Student Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/resume" element={<StudentProfile />} />
          <Route path="/student/documents" element={<StudentProfile />} />
          <Route path="/student/drives" element={<StudentDrives />} />
          <Route path="/student/applications" element={<StudentApplications />} />
          <Route path="/student/interviews" element={<StudentApplications />} />
          <Route path="/student/results" element={<StudentApplications />} />
          <Route path="/student/placements" element={<StudentApplications />} />
          <Route path="/student/settings" element={<StudentProfile />} />
        </Route>
      </Route>

      {/* Recruiter / Company Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['COMPANY']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/profile" element={<CompanyProfile />} />
          <Route path="/company/jobs" element={<CompanyJobsDrives />} />
          <Route path="/company/drives" element={<CompanyJobsDrives />} />
          <Route path="/company/applications" element={<CompanyApplicants />} />
          <Route path="/company/interviews" element={<CompanyApplicants />} />
          <Route path="/company/results" element={<CompanyApplicants />} />
          <Route path="/company/settings" element={<CompanyProfile />} />
        </Route>
      </Route>

      {/* Placement Manager Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['PLACEMENT_MANAGER']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/students" element={<ManagerStudents />} />
          <Route path="/manager/companies" element={<ManagerDashboard />} />
          <Route path="/manager/jobs" element={<ManagerDashboard />} />
          <Route path="/manager/drives" element={<ManagerDashboard />} />
          <Route path="/manager/applications" element={<ManagerStudents />} />
          <Route path="/manager/interviews" element={<ManagerDashboard />} />
          <Route path="/manager/placements" element={<ManagerReports />} />
          <Route path="/manager/reports" element={<ManagerReports />} />
          <Route path="/manager/settings" element={<ManagerDashboard />} />
        </Route>
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminDashboard />} />
          <Route path="/admin/companies" element={<AdminDashboard />} />
          <Route path="/admin/managers" element={<AdminDashboard />} />
          <Route path="/admin/departments" element={<AdminDashboard />} />
          <Route path="/admin/jobs" element={<AdminDashboard />} />
          <Route path="/admin/drives" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<AdminDashboard />} />
          <Route path="/admin/audit-logs" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminDashboard />} />
        </Route>
      </Route>
      {/* Interview Video Call Full-screen Route */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'COMPANY', 'PLACEMENT_MANAGER', 'ADMIN']} />}>
        <Route path="/interview/:roomId" element={<InterviewRoom />} />
      </Route>
      {/* Access Denied & Not Found */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
