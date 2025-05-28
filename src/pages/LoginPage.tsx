import React from "react";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();

  const handleLogin = async (credentials: {
    email: string;
    password: string;
  }) => {
    await login(credentials);
    console.log("login success");
    // Bisa tambah logic seperti redirect setelah login berhasil
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
}
