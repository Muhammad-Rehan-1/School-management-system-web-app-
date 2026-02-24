import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './store/useStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Staff from './pages/Staff';
import Finance from './pages/Finance';
import Settings from './pages/Settings';
import Login from './pages/Login';
import './App.css';

/**
 * ProtectedRoute component - Redirects to login if user is not authenticated
 */
function ProtectedRoute({ children }) {
  const { user } = useStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Main App component with routing
 */
function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="staff" element={<Staff />} />
            <Route path="finance" element={<Finance />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
