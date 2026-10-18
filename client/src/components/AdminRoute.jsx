import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard component for Admin Panel routes.
 * Prevents premature redirects while the session is hydrating / verifying with the backend.
 * Keeps user on the admin panel across refreshes and direct URL access if a valid session exists.
 */
const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  // 1. While initial authentication state is being verified and no cached user exists yet
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-[#12100E] flex flex-col items-center justify-center text-[#f5f5f4] p-4">
        <div className="relative mb-5">
          <div className="w-14 h-14 rounded-full border-2 border-[#C58B4B]/20 border-t-[#C58B4B] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C58B4B] animate-ping" />
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.25em] font-medium text-[#C58B4B] animate-pulse">
          Verifying Atelier Session...
        </p>
        <span className="text-[11px] text-stone-500 mt-2 font-mono">Canzir Enterprise Security</span>
      </div>
    );
  }

  // 2. If authentication verification completed and user is not logged in
  if (!loading && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If user is logged in but does not have administrator role
  if (!loading && user && !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. Authorized administrator access confirmed
  return children;
};

export default AdminRoute;
