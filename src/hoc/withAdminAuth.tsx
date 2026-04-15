'use client';

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Higher-Order Component that blocks non-admin users from accessing protected routes.
 * Redirects unauthenticated users to login and signed-in non-admin users to account.
 */
export const withAdminAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const AdminProtectedComponent: React.FC<P> = (props) => {
    const { isAdmin, loading, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
      if (loading) {
        return;
      }

      if (!user) {
        navigate('/login', { replace: true, state: { from: location } });
        return;
      }

      if (!isAdmin) {
        console.warn('Unauthorized access attempt to admin route.');
        navigate('/account', { replace: true });
      }
    }, [isAdmin, loading, location, navigate, user]);

    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center bg-bg-light">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      );
    }

    if (!user || !isAdmin) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return AdminProtectedComponent;
};
