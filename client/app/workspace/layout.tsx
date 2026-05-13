"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    } else {
      Promise.resolve().then(() => {
        setIsAuthChecking(false);
      });
    }
  }, [router]);

  if (isAuthChecking) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading workspace...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-800">
      <WorkspaceSidebar />
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {children}
      </main>
    </div>
  );
}
