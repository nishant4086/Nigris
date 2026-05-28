"use client";

import { Suspense } from "react";
import { AuthForm } from "../login/page";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#050510]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    }>
      <AuthForm defaultMode="signup" />
    </Suspense>
  );
}
