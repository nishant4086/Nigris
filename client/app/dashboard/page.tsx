"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { api } from "@/lib/api";

type Summary = {
  totalUsage: number;
  totalLimit: number;
  remaining: number;
  nextResetAt?: string | null;
};

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary>({
    totalUsage: 0,
    totalLimit: 0,
    remaining: 0,
    nextResetAt: null,
  });
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    const load = async () => {
      try {
        const [usageRes, meRes] = await Promise.all([
          api.get("/keys/summary"),
          api.get("/users/me"),
        ]);
        setSummary(usageRes.data);
        setPlan(meRes.data?.plan || "free");
      } catch {
        setSummary({ totalUsage: 0, totalLimit: 0, remaining: 0, nextResetAt: null });
      }
    };

    load();
  }, []);

  const resetLabel = summary.nextResetAt
    ? new Date(summary.nextResetAt).toLocaleDateString()
    : "-";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Usage" value={summary.totalUsage} />
        <Card title="Remaining" value={summary.remaining} />
        <Card title="Plan" value={plan} />
      </div>

      <div className="mt-6 bg-white rounded-xl shadow p-4">
        <p className="text-sm text-gray-500">Next reset</p>
        <p className="text-lg font-semibold">{resetLabel}</p>
      </div>
    </div>
  );
}