import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isDemoMode, loading, session } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-screen">Loading CareerOS...</div>;
  }

  if (!isDemoMode && !session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
