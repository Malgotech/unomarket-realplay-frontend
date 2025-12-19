import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Check if user is logged in by looking for token and user data
  const isAuthenticated = () => {
    const token = localStorage.getItem("UnomarketToken");
    const userData = localStorage.getItem("user");
    return !!(token && userData);
  };

  if (!isAuthenticated()) {
    // Dispatch event to open login dialog instead of showing alert
    window.dispatchEvent(new Event("open-login-dialog"));
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
