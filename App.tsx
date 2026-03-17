import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/context';
import { ProtectedRoute } from './src/components/ProtectedRoute';
import Login from './views/Login';
import Register from './views/Register';
import MainLayout from './layouts/MainLayout';

import AdminDashboard from './views/admin/Dashboard';
import OwnerDashboard from './views/owner/Dashboard';
import TeamServices from './views/owner/TeamServices';
import StaffDashboard from './views/staff/Dashboard';
import ClientDashboard from './views/client/Dashboard';

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes with layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    {/* Admin routes */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Owner routes */}
                    <Route
                      path="/owner"
                      element={
                        <ProtectedRoute allowedRoles={['shop_owner']}>
                          <OwnerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/owner/equipe"
                      element={
                        <ProtectedRoute allowedRoles={['shop_owner']}>
                          <TeamServices />
                        </ProtectedRoute>
                      }
                    />

                    {/* Staff routes */}
                    <Route
                      path="/staff"
                      element={
                        <ProtectedRoute allowedRoles={['staff']}>
                          <StaffDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Client routes */}
                    <Route
                      path="/client"
                      element={
                        <ProtectedRoute allowedRoles={['client']}>
                          <ClientDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
