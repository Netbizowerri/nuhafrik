'use client';

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Higher-Order Component that blocks non-admin users from accessing protected routes.
 * Redirects to the home page if the user is not an admin.
 */
export const withAdminAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const AdminProtectedComponent: React.FC<P> = (props) => {
    const { isAdmin, loading, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && (!user || !isAdmin)) {
        console.warn('Unauthorized access attempt to admin route.');
        navigate('/');
      }
    }, [isAdmin, loading, user, navigate]);

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
