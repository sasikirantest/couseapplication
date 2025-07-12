import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAccess?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireAccess = false 
}: ProtectedRouteProps) {
  const { currentUser, userRole, hasAccess } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  if (requireAccess && !hasAccess && userRole !== 'admin') {
    return <Navigate to="/payment" />;
  }

  return <>{children}</>;
}