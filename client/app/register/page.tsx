"use client";

import { Suspense } from "react";
import { AuthForm } from "../login/page";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    }>
      <AuthForm defaultMode="signup" />
    </Suspense>
  );
}
