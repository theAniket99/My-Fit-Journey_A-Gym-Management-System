import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage/LandingPage';
import Login from './pages/Auth/Login';
import MemberDashboard from './pages/MemberDashboard/MemberDashboard';
import TrainerDashboard from './pages/TrainerDashboard/TrainerDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement/AdminUserManagement';
import AdminPlans from './pages/AdminPlans/AdminPlans';
import AdminTrainerManagement from './pages/AdminTrainerManagement/AdminTrainerManagement';
import AdminRevenue from './pages/AdminRevenue/AdminRevenue';

import { getUserRoleFromToken } from './services/authService';

const PrivateRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const role = getUserRoleFromToken();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => (
  <Router>
    <Routes>
      {/* Landing Page at root */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Member Routes */}
      <Route
        path="/member/*"
        element={
          <PrivateRoute allowedRoles={['MEMBER']}>
            <MemberDashboard />
          </PrivateRoute>
        }
      />

      {/* Trainer Routes */}
      <Route
        path="/trainer/*"
        element={
          <PrivateRoute allowedRoles={['TRAINER']}>
            <TrainerDashboard />
          </PrivateRoute>
        }
      />

      {/* Admin Routes with Nested Sub-Routes */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </PrivateRoute>
        }
      >
        {/* Default redirect for /admin */}
        <Route index element={<Navigate to="users" replace />} />

        <Route path="users" element={<AdminUserManagement />} />
        <Route path="plans" element={<AdminPlans />} />
        <Route path="trainers" element={<AdminTrainerManagement />} />
        <Route path="revenue" element={<AdminRevenue />} />

        {/* Add more admin routes as needed */}
      </Route>

      {/* Catch-all redirect unknown URLs to Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

export default App;
