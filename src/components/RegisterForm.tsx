import { useState } from "react";

import type { RegisterCredentials } from "@/lib/auth";

interface RegisterFormProps {
  onRegister: (credentials: RegisterCredentials) => Promise<void>;
}

export default function RegisterForm({ onRegister }: RegisterFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await onRegister({ email, password, fullName });
      console.log("registration successful");
      setMessage("Registration successful. Check your email for confirmation.");
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Registration failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-base-100 shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form
        role="form"
        onSubmit={(e) => void handleRegister(e)}
        className="space-y-4"
      >
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Full Name</span>
          </div>
          <input
            type="text"
            placeholder="Nama lengkap"
            className="input input-bordered w-full"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
            }}
            required
          />
        </label>

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

        <button
          type="submit"
          className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Register"}
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
    </div>
  );
}
