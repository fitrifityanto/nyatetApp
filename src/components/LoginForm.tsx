import React, { useState } from "react";
import type { LoginCredentials } from "@/lib/auth";

interface LoginFormProps {
  onLogin?: (credentials: LoginCredentials) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (onLogin) {
        await onLogin({ email, password });
      } else {
        throw new Error("no login handler proovided");
      }
    } catch (error) {
      setError(
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

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Email</span>
          </div>
          <input
            type="email"
            placeholder="email@example.com"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
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
            onChange={(e) => {
              setPassword(e.target.value);
            }}
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
          {loading ? "Loading in.." : "Login"}
        </button>
      </form>

      {error && (
        <div className="alert alert-error mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>{" "}
        </div>
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
