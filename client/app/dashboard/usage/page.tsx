"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Card from "@/components/ui/Card";

type UsageItem = {
  id: string;
  name?: string;
  project?: string;
  usage: number;
  limit: number;
  remaining: number;
  resetAt?: string | null;
  isActive: boolean;
};

type UsageSummary = {
  totalUsage: number;
  totalLimit: number;
  remaining: number;
  nextResetAt?: string | null;
};

export default function UsagePage() {
  const [usage, setUsage] = useState<UsageItem[]>([]);
  const [summary, setSummary] = useState<UsageSummary>({
    totalUsage: 0,
    totalLimit: 0,
    remaining: 0,
    nextResetAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchUsage = async () => {
      setLoading(true);
      setError("");
      try {
        const [usageRes, summaryRes] = await Promise.all([
          api.get("/keys/usage"),
          api.get("/keys/summary"),
        ]);

        if (active) {
          setUsage(Array.isArray(usageRes.data) ? usageRes.data : []);
          setSummary({
            totalUsage: summaryRes.data?.totalUsage || 0,
            totalLimit: summaryRes.data?.totalLimit || 0,
            remaining: summaryRes.data?.remaining || 0,
            nextResetAt: summaryRes.data?.nextResetAt || null,
          });
        }
      } catch {
        if (active) {
          setUsage([]);
          setSummary({ totalUsage: 0, totalLimit: 0, remaining: 0, nextResetAt: null });
          setError("Failed to load usage data");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchUsage();

    return () => {
      active = false;
    };
  }, []);

  const refreshUsage = async () => {
    setLoading(true);
    setError("");
    try {
      const [usageRes, summaryRes] = await Promise.all([
        api.get("/keys/usage"),
        api.get("/keys/summary"),
      ]);
      setUsage(Array.isArray(usageRes.data) ? usageRes.data : []);
      setSummary({
        totalUsage: summaryRes.data?.totalUsage || 0,
        totalLimit: summaryRes.data?.totalLimit || 0,
        remaining: summaryRes.data?.remaining || 0,
        nextResetAt: summaryRes.data?.nextResetAt || null,
      });
    } catch {
      setUsage([]);
      setError("Failed to load usage data");
    } finally {
      setLoading(false);
    }
  };

  const resetLabel = summary.nextResetAt
    ? new Date(summary.nextResetAt).toLocaleDateString()
    : "-";

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usage Dashboard</h1>
          <p className="text-sm text-slate-500">
            Track request usage, limits, remaining quota, and reset dates.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshUsage}
          disabled={loading}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card title="Total usage" value={summary.totalUsage} />
        <Card title="Total limit" value={summary.totalLimit} />
        <Card title="Remaining" value={summary.remaining} />
        <Card title="Next reset" value={resetLabel} />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading usage...</p>
      ) : usage.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No usage yet. Create an API key and call a collection endpoint to start tracking requests.
        </div>
      ) : (
        <div className="space-y-4">
          {usage.map((item) => {
            const percent = item.limit
              ? Math.min((item.usage / item.limit) * 100, 100)
              : 0;

            return (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl shadow"
              >
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="font-semibold">{item.name || "Untitled key"}</p>
                    <p className="text-sm text-gray-500">
                      Project: {item.project || "Unknown project"}
                    </p>
                  </div>

                  <p className="text-sm">
                    {item.usage} / {item.limit}
                  </p>
                </div>

                <div className="w-full bg-gray-200 h-2 rounded">
                  <div
                    className="bg-black h-2 rounded"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>Remaining: {item.remaining}</span>
                  <span>
                    Reset: {item.resetAt ? new Date(item.resetAt).toLocaleDateString() : "-"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
