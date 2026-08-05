import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center bg-slate-50"
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f9ff' }}
      >
        <div className="flex flex-col items-center space-y-4 text-pharmacy-600">
          <div className="w-12 h-12 border-4 border-pharmacy-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-lg text-slate-700" style={{ fontFamily: 'sans-serif' }}>Loading PharmaCare...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallbackPath = user.role === 'Customer' ? '/store' : '/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
