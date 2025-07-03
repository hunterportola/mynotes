// src/components/ProtectedRoute.tsx
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  if (!token) {
    // If no token exists, redirect the user to the sign-in page
    return <Navigate to="/signin" replace />;
  }

  // If a token exists, render the child component (the protected page)
  return children;
}