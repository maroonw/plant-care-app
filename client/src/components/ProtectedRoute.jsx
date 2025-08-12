import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute() {
  const { isAuthed } = useAuth();
  const location = useLocation();

  if (!isAuthed) {
    // send them to login, but keep where they were trying to go
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
