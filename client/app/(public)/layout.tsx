"use client";

import React, { useState, useEffect } from "react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Loading screen */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#09090b] transition-all duration-700 ${
          loading ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Animated logo mark */}
          <div className="relative">
            <svg
              width="48" height="48" viewBox="0 0 48 48"
              className={`transition-all duration-700 ${loading ? "scale-100" : "scale-150 opacity-0"}`}
            >
              <rect x="6" y="6" width="36" height="36" rx="8" fill="none" stroke="#3b82f6" strokeWidth="2"
                strokeDasharray="144" strokeDashoffset="144"
                className="animate-[dash_1s_ease-in-out_forwards]"
              />
              <path d="M16 24h16M24 16v16" stroke="#fff" strokeWidth="2" strokeLinecap="round"
                opacity="0" className="animate-[fadeIn_0.4s_0.6s_ease-out_forwards]"
              />
            </svg>
          </div>
          {/* Loading bar */}
          <div className="w-32 h-[2px] bg-[#1c1c1f] rounded-full overflow-hidden">
            <div className="h-full bg-[#3b82f6] rounded-full animate-[loadBar_1.2s_ease-in-out_forwards]" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex min-h-screen flex-col transition-opacity duration-500 ${loading ? "opacity-0" : "opacity-100"}`}>
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </div>

      <style jsx global>{`
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        @keyframes loadBar {
          0% { width: 0%; }
          60% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </>
  );
}
