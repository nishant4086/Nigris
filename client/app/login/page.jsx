"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignup) {
      await handleRegister();
      return;
    }

    await handleLogin();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });
      localStorage.setItem("token", res.data.token);
      router.replace("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.error || "Invalid credentials";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError("Name, email, and password are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", {
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      localStorage.setItem("token", res.data.token);
      router.replace("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">
          {isSignup ? "Create account" : "Login"}
        </h1>

        <div className="mb-4 grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1 text-sm">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`rounded-md px-3 py-2 ${
              !isSignup ? "bg-white font-semibold shadow-sm" : "text-slate-600"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`rounded-md px-3 py-2 ${
              isSignup ? "bg-white font-semibold shadow-sm" : "text-slate-600"
            }`}
          >
            Create
          </button>
        </div>

        {error && <p className="text-red-600 mb-3">{error}</p>}
        {isSignup && (
          <input
            className="w-full border rounded px-3 py-2 mb-3"
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          className="w-full border rounded px-3 py-2 mb-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2 mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {isSignup && (
          <input
            className="w-full border rounded px-3 py-2 mb-4"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        )}

        <button
          className="w-full bg-black text-white py-2 rounded"
          type="submit"
          disabled={loading}
        >
          {loading
            ? isSignup
              ? "Creating account..."
              : "Signing in..."
            : isSignup
            ? "Create account"
            : "Sign in"}
        </button>

        <button
          className="w-full mt-3 border py-2 rounded"
          type="button"
          onClick={() => switchMode(isSignup ? "login" : "signup")}
          disabled={loading}
        >
          {isSignup ? "Back to sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
