import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { user, isLoading, isInitialized } = useSelector(
    (state) => state.auth
  );

  // Wait until the initial auth check completes
  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090B] px-6">
        <div className="flex flex-col items-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-white" />
          </div>

          <h1 className="mt-8 text-3xl font-bold tracking-tight">
            Nexora
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Restoring your workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;