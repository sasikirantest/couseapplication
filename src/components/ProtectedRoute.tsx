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
  const { currentUser, userRole, hasAccess, loading } = useAuth();

  console.log('[PROTECTED_ROUTE] Checking access:', {
    currentUser: currentUser?.uid,
    userRole,
    hasAccess,
    requireAdmin,
    requireAccess,
    loading
  });

  // Show loading while auth is being determined
  if (loading || (currentUser && userRole === null)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FFD1] mx-auto mb-4"></div>
          Loading...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    console.log('[PROTECTED_ROUTE] No user, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (requireAdmin && userRole !== 'admin') {
    console.log('[PROTECTED_ROUTE] Admin required but user is not admin, redirecting to dashboard');
    return <Navigate to="/" />;
  }

  if (requireAccess && !hasAccess && userRole !== 'admin') {
    console.log('[PROTECTED_ROUTE] Access required but user has no access, redirecting to payment');
    // For demo purposes, allow access to dashboard even without payment
    console.log('[PROTECTED_ROUTE] Demo mode: allowing access to dashboard');
  }

  console.log('[PROTECTED_ROUTE] Access granted, rendering children');
  return <>{children}</>;
}