import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy loading pages for better performance (optional here due to size but good practice)
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import VAODashboard from './pages/VAODashboard';
import Profile from './pages/Profile';

const App = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Farmer Routes */}
            <Route 
              path="/farmer/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* VAO Routes */}
            <Route 
              path="/vao/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['vao']}>
                  <VAODashboard />
                </ProtectedRoute>
              } 
            />

            {/* Profile Route (Shared) */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />

            {/* Default Route: Redirect based on auth state (handled inside components or here) */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
