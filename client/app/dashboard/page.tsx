"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import { useProjects } from "@/lib/hooks/useProjects";
import { useThemeMode } from "@/components/ThemeProvider";
import {
  Activity,
  Key,
  Database,
  Filter,
  Zap,
  Brain,
  Plus,
  Terminal,
  Compass,
  ArrowRight,
  Clock,
  LayoutDashboard,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar
} from "recharts";
import Link from "next/link";
import PendingInvites from "@/components/dashboard/PendingInvites";
import GlassCard from "@/components/ui/GlassCard";

type Summary = {
  totalUsage: number;
  totalLimit: number;
  remaining: number;
  nextResetAt?: string | null;
};

type ChartPoint = {
  name: string;
  date: string;
  requests: number;
};

type ApiKeyPreview = {
  _id: string;
  name?: string;
  maskedKey?: string;
};

type UsageLog = {
  _id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  projectId?: { _id: string; name: string };
  apiKeyId?: { _id: string; name: string; maskedKey: string; environment: string };
};

type DistributionData = {
  statusData: { name: string; value: number }[];
  endpointsData: { name: string; value: number }[];
};

type AlertItem = {
  _id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

// Colors for status donut chart
const STATUS_COLORS = [
  "#06B6D4", // Success (cyan)
  "#EF4444", // Error (red)
  "#818CF8", // Others (indigo)
  "#EC4899", // Extra (pink)
];

// Format count for display (e.g., 1400 -> "1.4K", 2100000 -> "2.1M")
function formatCount(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

// Format relative time (e.g., "Just now", "2m ago", "1h ago")
function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Format status code to readable string
function formatStatus(code: number): string {
  if (code >= 200 && code < 300) return `${code} OK`;
  if (code === 400) return "400 Bad Request";
  if (code === 401) return "401 Unauthorized";
  if (code === 403) return "403 Forbidden";
  if (code === 404) return "404 Not Found";
  if (code >= 500) return `${code} Server Error`;
  return `${code}`;
}

export default function Dashboard() {
  const { isDark } = useThemeMode();
  const [summary, setSummary] = useState<Summary>({
    totalUsage: 0,
    totalLimit: 0,
    remaining: 0,
    nextResetAt: null,
  });
  const [plan, setPlan] = useState("free");
  const [userName, setUserName] = useState("Developer");
  const { data: fetchedProjects } = useProjects();
  const projects = useMemo(() => fetchedProjects || [], [fetchedProjects]);
  const [apiKeys, setApiKeys] = useState<ApiKeyPreview[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7");
  const [projectFilter, setProjectFilter] = useState("all");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  // Real data states
  const [recentLogs, setRecentLogs] = useState<UsageLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [distribution, setDistribution] = useState<DistributionData>({ statusData: [], endpointsData: [] });
  const [distributionLoading, setDistributionLoading] = useState(true);
  const [avgLatency, setAvgLatency] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [miniChartData, setMiniChartData] = useState<{ val: number }[]>([]);

  const mapChartData = useCallback((raw: { date: string; requests: number }[]) => {
    return raw.map((item) => {
      const date = new Date(item.date);
      const name = timeRange === "1"
        ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString([], { weekday: "short" });
      return { name, date: item.date, requests: item.requests };
    });
  }, [timeRange]);

  const fetchChartData = useCallback(async () => {
    try {
      if (chartData.length === 0) setChartLoading(true);
      const params = new URLSearchParams();
      params.set("days", timeRange);
      if (projectFilter !== "all") params.set("projectId", projectFilter);

      const usageSeriesRes = await api.get(`/keys/analytics/time-series?${params.toString()}`);
      const mapped = mapChartData(Array.isArray(usageSeriesRes.data) ? usageSeriesRes.data : []);
      setChartData(mapped);
      setLastUpdatedAt(new Date());
    } catch (_err) {
      console.error(_err);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, [chartData.length, mapChartData, projectFilter, timeRange]);

  // Fetch recent logs for "Recent Requests" panel
  const fetchRecentLogs = useCallback(async () => {
    try {
      setLogsLoading(true);
      const res = await api.get("/keys/analytics/logs?limit=8");
      setRecentLogs(Array.isArray(res.data) ? res.data : []);

      // Calculate average latency from recent logs
      const logs = Array.isArray(res.data) ? res.data : [];
      if (logs.length > 0) {
        const totalLatency = logs.reduce((sum: number, log: UsageLog) => sum + (log.responseTime || 0), 0);
        setAvgLatency(Math.round(totalLatency / logs.length));
      }
    } catch (_err) {
      console.error(_err);
      setRecentLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  // Fetch distribution data for status pie chart and top endpoints
  const fetchDistribution = useCallback(async () => {
    try {
      setDistributionLoading(true);
      const res = await api.get("/keys/analytics/distribution?days=30");
      setDistribution(res.data || { statusData: [], endpointsData: [] });
    } catch (_err) {
      console.error(_err);
      setDistribution({ statusData: [], endpointsData: [] });
    } finally {
      setDistributionLoading(false);
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await api.get("/keys/alerts");
      setAlerts(Array.isArray(res.data) ? res.data.filter((a: AlertItem) => !a.isRead).slice(0, 3) : []);
    } catch (_err) {
      console.error(_err);
      setAlerts([]);
    }
  }, []);

  // Fetch mini chart data for stats cards (7-day time series)
  const fetchMiniChartData = useCallback(async () => {
    try {
      const res = await api.get("/keys/analytics/time-series?days=7");
      const raw = Array.isArray(res.data) ? res.data : [];
      setMiniChartData(raw.map((d: { requests: number }) => ({ val: d.requests })));
    } catch (_err) {
      console.error(_err);
      setMiniChartData([]);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [usageRes, meRes] = await Promise.all([
          api.get("/keys/summary"),
          api.get("/users/me"),
        ]);
        setSummary(usageRes.data);
        setPlan(meRes.data?.plan || "free");
        setUserName(meRes.data?.name || "Developer");

        const keysRes = await api.get("/keys");
        setApiKeys(Array.isArray(keysRes.data) ? keysRes.data : []);
      } catch (_err) {
        console.error(_err);
      } finally {
        setLoading(false);
      }

      // Fetch supplementary data in parallel after core data loads
      await Promise.allSettled([
        fetchRecentLogs(),
        fetchDistribution(),
        fetchAlerts(),
        fetchMiniChartData(),
      ]);
    };

    load();
  }, [fetchRecentLogs, fetchDistribution, fetchAlerts, fetchMiniChartData]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchChartData();
    });
  }, [fetchChartData]);

  const resetLabel = summary.nextResetAt
    ? new Date(summary.nextResetAt).toLocaleDateString()
    : "No limit";

  // Compute success rate from real distribution data
  const totalStatusCount = distribution.statusData.reduce((sum, d) => sum + d.value, 0);
  const successCount = distribution.statusData.find(d => d.name === "Success")?.value || 0;
  const successRate = totalStatusCount > 0 ? Math.round((successCount / totalStatusCount) * 100) : 0;

  // Compute top endpoints with percentage shares from real distribution data
  const totalEndpointCount = distribution.endpointsData.reduce((sum, d) => sum + d.value, 0);
  const topEndpoints = distribution.endpointsData.map(d => ({
    route: d.name || "Unknown",
    count: formatCount(d.value),
    share: totalEndpointCount > 0 ? Math.round((d.value / totalEndpointCount) * 100) : 0,
  }));

  // Prepare mini chart variants for different stat cards using the same base time series
  const miniChartKeys = useMemo(() =>
    apiKeys.length > 0 ? miniChartData.map((d, i) => ({ val: Math.max(1, d.val + (i % 3)) })) : [],
    [apiKeys.length, miniChartData]
  );
  const miniChartLatency = useMemo(() =>
    miniChartData.map((_d, i) => ({ val: avgLatency ? avgLatency + ((i % 3) - 1) * 2 : 0 })),
    [avgLatency, miniChartData]
  );

  return (
    <div className="pb-24 pt-2 text-slate-900 dark:text-slate-100">
      {/* Header Area */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 dark:bg-cyan-400 animate-pulse"></span>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-400">System Online</p>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-5xl bg-gradient-to-r from-slate-900 via-slate-750 to-slate-500 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent flex items-center flex-wrap gap-3">
            <span>Welcome back, {userName}</span>
            <span className="text-xs font-bold bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 px-2.5 py-1 rounded-xl border border-indigo-500/20 capitalize tracking-wide align-middle">
              {plan} plan
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
            Here is your API network health, traffic distribution, and live platform analytics.
          </p>
        </motion.div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/projects"
            className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 transition-all active:scale-[0.98]"
          >
            <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Manage Workspaces</span>
          </Link>
          <Link
            href="/dashboard/projects"
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </Link>
        </div>
      </div>

      <PendingInvites />

      {/* 4 Analytics Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Total Requests */}
        <GlassCard className="relative overflow-hidden group p-6" delay={0.02}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors"></div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Requests</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                {loading ? "..." : summary.totalUsage.toLocaleString()}
              </h3>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-1 rounded-lg">
              {summary.totalLimit > 0 ? `${Math.round((summary.totalUsage / summary.totalLimit) * 100)}%` : "∞"} used
            </span>
          </div>
          <div className="h-12 w-full mt-4">
            {miniChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={miniChartData}>
                  <Area type="monotone" dataKey="val" stroke="#06B6D4" strokeWidth={2} fillOpacity={0.1} fill="#06B6D4" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">No data yet</div>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            {summary.remaining.toLocaleString()} remaining of {summary.totalLimit.toLocaleString()}
          </p>
        </GlassCard>

        {/* Card 2: Active APIs */}
        <GlassCard className="relative overflow-hidden group p-6" delay={0.06}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active APIs</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                {loading ? "..." : projects.length}
              </h3>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg">
              {projects.length} projects
            </span>
          </div>
          <div className="h-12 w-full mt-4">
            {miniChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={miniChartData}>
                  <Bar dataKey="val" fill="#818CF8" radius={[2, 2, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">No data yet</div>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Endpoints receiving live traffic</p>
        </GlassCard>

        {/* Card 3: API Keys */}
        <GlassCard className="relative overflow-hidden group p-6" delay={0.1}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/10 transition-colors"></div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">API Keys</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                {loading ? "..." : apiKeys.length}
              </h3>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold bg-purple-500/10 text-purple-650 dark:text-purple-400 px-2 py-1 rounded-lg">
              Active
            </span>
          </div>
          <div className="h-12 w-full mt-4">
            {miniChartKeys.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={miniChartKeys}>
                  <Area type="monotone" dataKey="val" stroke="#A78BFA" strokeWidth={2} fillOpacity={0.1} fill="#A78BFA" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">No data yet</div>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Authorized access keys</p>
        </GlassCard>

        {/* Card 4: Avg Latency */}
        <GlassCard className="relative overflow-hidden group p-6" delay={0.14}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-pink-500/10 transition-colors"></div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Avg. Latency</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                {logsLoading ? "..." : avgLatency !== null ? `${avgLatency}ms` : "—"}
              </h3>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg">
              {avgLatency !== null && avgLatency < 100 ? "Fast" : avgLatency !== null ? "Normal" : "—"}
            </span>
          </div>
          <div className="h-12 w-full mt-4">
            {miniChartLatency.length > 0 && avgLatency !== null ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={miniChartLatency}>
                  <Area type="monotone" dataKey="val" stroke="#F472B6" strokeWidth={2} fillOpacity={0.1} fill="#F472B6" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">No data yet</div>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Next billing reset: {resetLabel}</p>
        </GlassCard>
      </div>

      {/* Main Central Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Center: Request Overview Area Chart */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 flex flex-col h-108" hover={false} delay={0.16}>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                  <span>Request Overview</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>Traffic rate (last {timeRange === "1" ? "24h" : `${timeRange} days`})</span>
                  {lastUpdatedAt && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-500 font-mono">Updated {lastUpdatedAt.toLocaleTimeString()}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-950/40 px-2 py-1">
                  <Filter className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none border-none cursor-pointer"
                  >
                    <option value="1" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-300">24h</option>
                    <option value="7" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-300">7d</option>
                    <option value="30" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-300">30d</option>
                  </select>
                </div>

                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-950/40 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                >
                  <option value="all" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-300">All workspaces</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id} className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-300">
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative flex-1 w-full min-h-0 overflow-hidden">
              {chartLoading ? (
                <div className="w-full h-full bg-slate-200/40 dark:bg-slate-800/20 rounded-xl animate-pulse flex items-center justify-center text-slate-500 text-xs">
                  Loading telemetry...
                </div>
              ) : chartData.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                  <Activity className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-medium">No request data yet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-650">Start making API calls to see traffic here</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '16px',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                        background: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.3)' : '0 20px 50px rgba(15,23,42,0.08)'
                      }}
                      itemStyle={{ color: '#7C3AED', fontWeight: 600 }}
                      labelStyle={{ color: isDark ? '#94a3b8' : '#475569', fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey="requests" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#purpleGlow)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right: Recent API Requests Panel — Real Data */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 flex flex-col h-108" hover={false} delay={0.22}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Recent Requests</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Live platform activity</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {logsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 bg-slate-200/50 dark:bg-slate-800/30 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : recentLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                  <Terminal className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-medium">No requests yet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-650 text-center">API requests will appear here in real time</p>
                </div>
              ) : (
                recentLogs.map((log) => {
                  const getMethodBadgeClass = (method: string) => {
                    switch (method) {
                      case "GET": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
                      case "POST": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                      case "DELETE": return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
                      case "PUT": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
                      case "PATCH": return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
                      default: return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
                    }
                  };

                  const getStatusDot = (code: number) => {
                    return code < 400 ? "bg-emerald-400" : "bg-red-400";
                  };

                  return (
                    <div key={log._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100/70 bg-slate-50/40 hover:bg-slate-100/50 hover:border-slate-200/70 dark:border-white/5 dark:bg-slate-900/30 dark:hover:bg-slate-900/50 dark:hover:border-white/10 transition-all duration-200">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border tracking-wide ${getMethodBadgeClass(log.method)}`}>
                          {log.method}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate font-mono">{log.endpoint}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(log.statusCode)}`}></span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{formatStatus(log.statusCode)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-mono text-slate-700 dark:text-slate-300">{log.responseTime}ms</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-500 flex items-center gap-1 mt-0.5 justify-end">
                          <Clock className="w-2.5 h-2.5" />
                          {formatRelativeTime(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Endpoints & Status Pie & AI/Alerts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Endpoints Card — Real Data */}
        <GlassCard className="p-6 flex flex-col h-96" hover={false} delay={0.24}>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
            <span>Top Endpoints</span>
          </h3>

          <div className="flex-1 space-y-5 overflow-y-auto pr-1">
            {distributionLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-slate-200/50 dark:bg-slate-800/30 rounded animate-pulse w-3/4"></div>
                    <div className="h-1.5 bg-slate-200/50 dark:bg-slate-800/30 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : topEndpoints.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                <Compass className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-medium">No endpoint data</p>
                <p className="text-xs text-slate-500 dark:text-slate-650 text-center">Endpoint usage will appear as your APIs receive traffic</p>
              </div>
            ) : (
              topEndpoints.map((endpoint, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-800 dark:text-slate-300 font-medium truncate max-w-44">{endpoint.route}</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 font-mono">{endpoint.count} reqs ({endpoint.share}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${endpoint.share}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Requests by Status Donut Chart — Real Data */}
        <GlassCard className="p-6 flex flex-col h-96" hover={false} delay={0.28}>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
            <span>Requests by Status</span>
          </h3>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
            {distributionLoading ? (
              <div className="w-40 h-40 bg-slate-200/50 dark:bg-slate-800/30 rounded-full animate-pulse"></div>
            ) : distribution.statusData.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                <Activity className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-medium">No status data</p>
                <p className="text-xs text-slate-500 dark:text-slate-655 text-center">Status distribution will appear here</p>
              </div>
            ) : (
              <>
                <div className="relative w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribution.statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {distribution.statusData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{successRate}%</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Success</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {distribution.statusData.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }}></span>
                      <div className="flex items-center justify-between w-32">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.name}</span>
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{formatCount(item.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </GlassCard>

        {/* AI / Alerts Intelligence Card — Real Data */}
        <GlassCard className="p-6 flex flex-col h-96 relative overflow-hidden bg-gradient-to-br from-indigo-50/50 via-slate-50/50 to-purple-50/50 border border-indigo-100/60 dark:from-indigo-900/10 dark:via-[#101730] dark:to-purple-900/10 dark:border-indigo-500/20 group hover:border-indigo-200 dark:hover:border-indigo-500/40" hover={true} delay={0.32}>
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500"></div>

          <div className="flex items-center gap-2 mb-4">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10 animate-pulse">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/10">AI Copilot</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Intelligence Insights</h3>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between mt-4">
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert._id} className="p-3 bg-white/60 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-white/5 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{alert.message}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{formatRelativeTime(alert.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3.5">
                <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
                  {totalStatusCount > 0 ? (
                    <>
                      Your APIs processed <code className="text-xs font-mono text-cyan-600 bg-cyan-50/80 dark:text-cyan-400 dark:bg-slate-950/60 px-1.5 py-0.5 rounded">{formatCount(totalStatusCount)}</code> requests in the last 30 days.
                    </>
                  ) : (
                    "No traffic data available yet."
                  )}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {successRate >= 95
                    ? "Your API health is excellent. Keep monitoring for anomalies."
                    : successRate >= 80
                    ? "Some errors detected. Review your error logs for patterns."
                    : totalStatusCount > 0
                    ? "High error rate detected. Check your endpoints for issues."
                    : "Start making API calls to generate insights and recommendations."}
                </p>
                <div className="p-3 bg-white/60 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-white/5 flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Status:</span>
                  <span className="text-xs text-slate-800 dark:text-slate-300 font-medium">
                    {successRate >= 95 ? "All systems healthy ✓" : successRate >= 80 ? "Minor issues detected" : totalStatusCount > 0 ? "Needs attention" : "Awaiting data"}
                  </span>
                </div>
              </div>
            )}

            <Link
              href="/dashboard/api-keys"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 flex items-center justify-center gap-2 group cursor-pointer mt-4"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              <span>View Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
          <span>Quick Actions</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/collections"
            className="group p-5 bg-white/60 hover:bg-white/80 border border-slate-100 hover:border-indigo-500/30 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between h-32 cursor-pointer dark:bg-slate-900/30 dark:hover:bg-slate-900/60 dark:border-white/5 dark:hover:border-indigo-500/30"
          >
            <div className="h-10 w-10 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors border border-indigo-500/10">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-400 transition-colors">Ship new routes</p>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                <span>Create API</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h4>
            </div>
          </Link>

          <Link
            href="/dashboard/projects"
            className="group p-5 bg-white/60 hover:bg-white/80 border border-slate-100 hover:border-indigo-500/30 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between h-32 cursor-pointer dark:bg-slate-900/30 dark:hover:bg-slate-900/60 dark:border-white/5 dark:hover:border-indigo-500/30"
          >
            <div className="h-10 w-10 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors border border-cyan-500/10">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-400 transition-colors">Launch workspace</p>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                <span>Create Project</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h4>
            </div>
          </Link>

          <Link
            href="/dashboard/api-keys"
            className="group p-5 bg-white/60 hover:bg-white/80 border border-slate-100 hover:border-indigo-500/30 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between h-32 cursor-pointer dark:bg-slate-900/30 dark:hover:bg-slate-900/60 dark:border-white/5 dark:hover:border-indigo-500/30"
          >
            <div className="h-10 w-10 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors border border-purple-500/10">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-400 transition-colors">Secure access credentials</p>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                <span>Generate API Key</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h4>
            </div>
          </Link>

          <Link
            href="https://github.com/nishant4086/Nigris"
            target="_blank"
            className="group p-5 bg-white/60 hover:bg-white/80 border border-slate-100 hover:border-indigo-500/30 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between h-32 cursor-pointer dark:bg-slate-900/30 dark:hover:bg-slate-900/60 dark:border-white/5 dark:hover:border-indigo-500/30"
          >
            <div className="h-10 w-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors border border-emerald-500/10">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-400 transition-colors">Read platform guides</p>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                <span>View Docs</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h4>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
