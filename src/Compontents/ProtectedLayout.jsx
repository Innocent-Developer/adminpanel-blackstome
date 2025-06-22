// src/Compontents/ProtectedLayout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import { Navigate } from "react-router-dom";

const ProtectedLayout = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex bg-[#121212] min-h-screen text-white">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 overflow-auto">{children}</div>
    </div>
  );
};

export default ProtectedLayout;
