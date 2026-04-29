"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const [plan, setPlan] = useState("...");
  const [name, setName] = useState("");

  const planLabel = plan
    ? `${plan.charAt(0).toUpperCase()}${plan.slice(1)}`
    : "";

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/users/me");
        setPlan(res.data?.plan || "free");
        setName(res.data?.name || "");
      } catch {
        setPlan("free");
      }
    };

    loadProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex justify-between items-center bg-white/90 backdrop-blur px-6 py-4 border-b shadow-sm">
      <div>
        <h2 className="font-semibold text-lg">Dashboard</h2>
        {name && <p className="text-xs text-gray-500">Welcome, {name}</p>}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Plan: {planLabel}</span>

        <button
          onClick={logout}
          className="bg-black text-white px-4 py-1 rounded-lg text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}