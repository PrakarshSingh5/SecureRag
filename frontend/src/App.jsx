import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';

import AdminLayout from './layouts/AdminLayout';
import AdminDocumentsPage from './pages/AdminDocumentsPage';

// ✅ ProtectedRoute must be rendered INSIDE AuthProvider to use useAuth()
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#94a3b8' }}>
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/chat" replace />;

  return children;
};

// Inner component that is a child of AuthProvider
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminPage />} />
          <Route path="documents" element={<AdminDocumentsPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
