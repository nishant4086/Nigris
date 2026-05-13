"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Calendar } from "lucide-react";

import SummaryCards from "@/components/usage/SummaryCards";
import UsageAreaChart from "@/components/usage/UsageAreaChart";
import RequestDistribution from "@/components/usage/RequestDistribution";
import ApiKeyBreakdown from "@/components/usage/ApiKeyBreakdown";
import ActivityTable from "@/components/usage/ActivityTable";
import ExportButton from "@/components/usage/ExportButton";
import LiveIndicator from "@/components/usage/LiveIndicator";
import AlertBanner, { AlertType } from "@/components/usage/AlertBanner";

interface SummaryData {
  totalUsage: number;
  totalLimit: number;
  remaining: number;
  activeKeys: number;
  dailyAvg: number;
  nextResetAt: string;
}

interface DistributionData {
  statusData: Record<string, unknown>[];
  endpointsData: Record<string, unknown>[];
}

export default function UsageDashboard() {
  const [timeRange, setTimeRange] = useState("30"); // 7, 30, 90 days
  
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<Record<string, unknown>[]>([]);
  const [distributionData, setDistributionData] = useState<DistributionData | null>(null);
  const [logsData, setLogsData] = useState<Record<string, unknown>[]>([]);
  
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  const loadAlerts = useCallback(async () => {
    try {
      const res = await api.get("/keys/alerts");
      const unread = (res.data || []).filter((a: AlertType) => !a.isRead);
      setAlerts(unread);
    } catch (err) {
      console.error("Failed to load alerts", err);
    }
  }, []);

  // Fetch top summary numbers
  const fetchSummary = useCallback(async () => {
    try {
      const [summaryRes, keysRes] = await Promise.all([
        api.get("/keys/summary"),
        api.get("/keys")
      ]);
      const keys = Array.isArray(keysRes.data) ? keysRes.data : [];
      const activeKeys = keys.filter(k => k.isActive).length;
      setSummaryData({
        ...summaryRes.data,
        totalRequests: summaryRes.data.totalUsage || 0,
        totalLimit: summaryRes.data.totalLimit || 0,
        remaining: summaryRes.data.remaining || 0,
        activeKeys,
        dailyAvg: summaryRes.data.totalUsage > 0 ? Math.round(summaryRes.data.totalUsage / parseInt(timeRange)) : 0
      });
    } catch (err) {
      console.error("Failed to load summary", err);
    } finally {
      setLoadingSummary(false);
    }
  }, [timeRange]);

  // Initial Fetch Effect
  useEffect(() => {
    Promise.resolve().then(() => {
      setLoadingSummary(true);
      setLoadingCharts(true);
      setLoadingLogs(true);
      
      fetchSummary();
      loadAlerts();

      Promise.all([
        api.get(`/keys/analytics/time-series?days=${timeRange}`),
        api.get(`/keys/analytics/distribution?days=${timeRange}`),
        api.get("/keys/analytics/logs?limit=50")
      ])
      .then(([timeRes, distRes, logsRes]) => {
        setTimeSeriesData(timeRes.data || []);
        setDistributionData(distRes.data || { statusData: [], endpointsData: [] });
        setLogsData(logsRes.data || []);
      })
      .catch(err => console.error("Failed to load charts", err))
      .finally(() => {
        setLoadingCharts(false);
        setLoadingLogs(false);
      });
    });
  }, [timeRange, fetchSummary, loadAlerts]);

  // Live SSE Connection
  useEffect(() => {
    const interval = setInterval(() => {
      api.get("/keys/analytics/logs?limit=50").then(res => {
        setLogsData(res.data || []);
        setConnected(true);
      }).catch(() => setConnected(false));
      fetchSummary();
      loadAlerts();
    }, 10000); // 10s poll

    Promise.resolve().then(() => {
      setConnected(true);
    });

    return () => clearInterval(interval);
  }, [fetchSummary, loadAlerts]);

  const topAlert = alerts.length > 0 ? alerts[0] : null;

  return (
    <div className="pb-24 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <AlertBanner 
        alert={topAlert} 
        onDismiss={() => setAlerts(prev => prev.filter(a => a._id !== topAlert?._id))} 
      />

      {/* Header Area */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Usage Analytics
            </h1>
            <LiveIndicator connected={connected} />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Monitor your API consumption, rate limits, and request distribution across all your connected projects in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent border-none py-1.5 pl-2 pr-6 text-sm font-medium focus:ring-0 outline-none text-slate-700 dark:text-slate-200"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          
          <ExportButton timeRange={timeRange} />
        </div>
      </div>

      {/* Row 1: Summary Cards */}
      <SummaryCards 
        data={summaryData || { totalRequests: 0, totalLimit: 0, remaining: 0, activeKeys: 0, dailyAvg: 0, nextResetAt: "" }} 
        loading={loadingSummary} 
      />

      {/* Row 2: Main Area Chart */}
      <UsageAreaChart data={timeSeriesData} loading={loadingCharts} />

      {/* Row 3: Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ApiKeyBreakdown data={distributionData?.endpointsData || []} loading={loadingCharts} />
        <RequestDistribution data={distributionData?.statusData || []} loading={loadingCharts} />
      </div>

      {/* Row 4: Recent Activity */}
      <ActivityTable logs={logsData} loading={loadingLogs} />
    </div>
  );
}