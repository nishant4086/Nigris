"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Save the token to localStorage for authenticated requests
      localStorage.setItem("token", token);
      
      // Redirect to the protected dashboard
      router.replace("/dashboard");
    } else {
      // If no token is found, redirect back to login
      router.replace("/login?error=auth_failed");
    }
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
      <div className="w-16 h-16 bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center shadow-xl mb-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <h2 className="text-xl font-black text-slate-900 dark:text-white">Authenticating...</h2>
      <p className="text-sm text-slate-500 mt-2">Please wait while we log you in securely.</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    }>
      <AuthCallbackHandler />
    </Suspense>
  );
}
