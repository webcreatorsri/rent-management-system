import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import TestFirebase from './pages/TestFirebase';
// Theme
import theme from './styles/theme';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import Apartments from './pages/Apartments';
import Rent from './pages/Rent';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

// App Component
function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />

        <Route path="users" element={
          <ProtectedRoute requireAdmin>
            <UserManagement />
            </ProtectedRoute>
          } />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="apartments" element={<Apartments />} />
          <Route path="rent" element={<Rent />} />
          <Route path="reports" element={<Reports />} />
          <Route path="test-firebase" element={<TestFirebase />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

// Main App Component
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;