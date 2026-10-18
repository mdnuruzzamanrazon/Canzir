import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard component for authenticated customer routes (e.g. /account).
 * Avoids premature redirects on refresh while session verification is in progress.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-sand-100 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-full border-2 border-bamboo/20 border-t-bamboo animate-spin mb-3" />
        <p className="text-xs font-serif text-walnut uppercase tracking-widest animate-pulse">
          Loading Your Account...
        </p>
      </div>
    );
  }

  if (!loading && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
