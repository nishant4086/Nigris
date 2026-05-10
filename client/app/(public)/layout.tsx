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
    const timer = setTimeout(() => setLoading(false), 2200);
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
        <div className="flex flex-col items-center gap-8">
          {/* SVG "Nigris" text stroke animation */}
          <svg
            viewBox="0 0 280 60"
            className="w-[240px] sm:w-[280px] h-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="50%"
              y="50%"
              dominantBaseline="central"
              textAnchor="middle"
              className="nigris-text"
              style={{
                fontSize: "48px",
                fontWeight: 700,
                fontFamily: "system-ui, -apple-system, sans-serif",
                letterSpacing: "-0.03em",
              }}
            >
              Nigris
            </text>
          </svg>

          {/* Loading bar */}
          <div className="w-24 h-[2px] bg-[#1c1c1f] rounded-full overflow-hidden">
            <div className="h-full bg-[#3b82f6] rounded-full animate-[loadBar_1.8s_ease-in-out_forwards]" />
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
        .nigris-text {
          stroke: #ffffff;
          stroke-width: 1;
          fill: transparent;
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation:
            drawStroke 1.2s ease-in-out forwards,
            fillText 0.6s 1.2s ease-out forwards;
        }

        @keyframes drawStroke {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes fillText {
          to {
            fill: #ffffff;
            stroke-width: 0;
          }
        }

        @keyframes loadBar {
          0% { width: 0%; }
          50% { width: 65%; }
          100% { width: 100%; }
        }
      `}</style>
    </>
  );
}
