import React from "react";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../hooks/useAuth";
import { useLocation, useNavigate } from "react-router";

export default function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      await login(credentials);
      navigate(from, { replace: true });
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
}
