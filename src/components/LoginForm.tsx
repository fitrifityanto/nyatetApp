import React, { useState } from "react";
import type { LoginCredentials } from "../lib/auth";

interface LoginFormProps {
  onLogin?: (credentials: LoginCredentials) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (onLogin) {
        await onLogin({ email, password });
      } else {
        // Default login logic jika onLogin tidak disediakan
        console.log("Login attempt:", { email, password });
        // Simulasi API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setMessage("Login successful!");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-base-100 shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Email</span>
          </div>
          <input
            type="email"
            placeholder="email@example.com"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Password</span>
          </div>
          <input
            type="password"
            placeholder="********"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {/* Optional: Remember me checkbox */}
        <div className="form-control flex mt-2">
          <label className="label cursor-pointer justify-start">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            <span className="label-text">Remember me</span>
          </label>
        </div>

        <button
          type="submit"
          className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-center text-sm ${
            message.includes("successful") ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}

      {/* Optional: Links untuk forgot password dan register */}
      <div className="mt-4 text-center space-y-2">
        <a href="#" className="link link-primary text-sm">
          Forgot password?
        </a>
        <div className="text-sm">
          Don't have an account?{" "}
          <a href="#" className="link link-primary">
            Register here
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
