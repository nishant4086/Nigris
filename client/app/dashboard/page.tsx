"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { 
  BarChart, 
  Activity, 
  CreditCard, 
  Key,
  ArrowUpRight,
  Database,
  Filter,
  Mail,
  type LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
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

type ProjectPreview = {
  _id: string;
  name: string;
};

type TemplatePreview = {
  _id: string;
  name: string;
  project: string | { _id: string; name: string };
  createdAt: string;
};

type ApiKeyPreview = {
  _id: string;
  name?: string;
  maskedKey?: string;
};

function StatsCard({
  title,
  value,
  subtext,
  icon: Icon,
  loading,
  delay,
}: {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  loading: boolean;
  delay: number;
}) {
  return (
    <GlassCard className="min-h-45 overflow-hidden" delay={delay}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Icon className="h-5 w-5" />
        </div>
        <span className="glass-pill rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Live
        </span>
      </div>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
        </div>
      ) : (
        <>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{value}</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{title}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">{subtext}</p>
        </>
      )}
    </GlassCard>
  );
}

const DASHBOARD_CHART_HEIGHT = 272;
const POLL_INTERVAL_MS = 10000;

function UsageChart({
  data,
  loading,
  timeRange,
  projectId,
  apiKeyId,
  projects,
  apiKeys,
  onTimeRangeChange,
  onProjectChange,
  onApiKeyChange,
  lastUpdatedAt,
}: {
  data: ChartPoint[];
  loading: boolean;
  timeRange: string;
  projectId: string;
  apiKeyId: string;
  projects: ProjectPreview[];
  apiKeys: ApiKeyPreview[];
  onTimeRangeChange: (value: string) => void;
  onProjectChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
  lastUpdatedAt: Date | null;
}) {
  const subtitle = useMemo(() => {
    if (timeRange === "1") return "Requests in the last 24 hours";
    return `Requests over the last ${timeRange} days`;
  }, [timeRange]);

  return (
    <GlassCard className="h-96 flex flex-col" hover={false} delay={0.16}>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">Daily API Usage</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
          <div className="glass-pill rounded-full px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-300">
            Realtime
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/50 px-2 py-1 dark:border-white/10 dark:bg-white/5">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              className="bg-transparent px-2 py-1 text-xs font-semibold text-slate-700 outline-none dark:text-slate-200"
            >
              <option value="1">24h</option>
              <option value="7">7d</option>
              <option value="30">30d</option>
            </select>
          </div>

          <select
            value={projectId}
            onChange={(e) => onProjectChange(e.target.value)}
            className="rounded-xl border border-slate-200/70 bg-white/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            <option value="all">All projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={apiKeyId}
            onChange={(e) => onApiKeyChange(e.target.value)}
            className="rounded-xl border border-slate-200/70 bg-white/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            <option value="all">All API keys</option>
            {apiKeys.map((key) => (
              <option key={key._id} value={key._id}>
                {key.name || key.maskedKey || "Untitled key"}
              </option>
            ))}
          </select>

          <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
            Updated: {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString() : "--"}
          </span>
        </div>
      </div>
      <div className="relative h-68 min-h-68 w-full min-w-0 overflow-hidden">
        {loading ? (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse"></div>
        ) : (
          <ResponsiveContainer width="100%" height={DASHBOARD_CHART_HEIGHT} minWidth={0}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '14px', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)', background: 'var(--glass-bg-strong)', backdropFilter: 'blur(20px)' }}
                itemStyle={{ color: '#3B82F6', fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}

// --- Main Page ---

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary>({
    totalUsage: 0,
    totalLimit: 0,
    remaining: 0,
    nextResetAt: null,
  });
  const [plan, setPlan] = useState("free");
  const [projects, setProjects] = useState<ProjectPreview[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyPreview[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7");
  const [projectFilter, setProjectFilter] = useState("all");
  const [apiKeyFilter, setApiKeyFilter] = useState("all");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [recentTemplates, setRecentTemplates] = useState<TemplatePreview[]>([]);
  const [loading, setLoading] = useState(true);

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
      if (apiKeyFilter !== "all") params.set("apiKeyId", apiKeyFilter);

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
  }, [apiKeyFilter, chartData.length, mapChartData, projectFilter, timeRange]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [usageRes, meRes, projRes] = await Promise.all([
          api.get("/keys/summary"),
          api.get("/users/me"),
          api.get("/projects"),
        ]);
        setSummary(usageRes.data);
        setPlan(meRes.data?.plan || "free");
        const projectList = (projRes.data || []) as ProjectPreview[];
        setProjects(projectList);
        const keysRes = await api.get("/keys");
        setApiKeys(Array.isArray(keysRes.data) ? keysRes.data : []);

        // Fetch recent templates across all projects (or just recent ones)
        // Since we don't have a global recent templates API yet, let's just fetch from the first project or similar
        // For now, let's assume we might need a new API endpoint for global recent templates
        // But we can try to fetch from all projects if they are few
        if (projectList.length > 0) {
           const templatePromises = projectList.slice(0, 3).map(p => api.get(`/email-templates/${p._id}`));
           const templateResults = await Promise.all(templatePromises);
           const allTemplates = templateResults.flatMap(res => res.data).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
           setRecentTemplates(allTemplates.slice(0, 5));
        }
      } catch (_err) {
        console.error(_err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchChartData();
    });
  }, [fetchChartData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchChartData();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchChartData]);

  const resetLabel = summary.nextResetAt
    ? new Date(summary.nextResetAt).toLocaleDateString()
    : "No limit";

  return (
    <div className="pb-12 pt-2">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.22em] text-blue-500">Nigris Cloud</p>
        <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
          Overview
        </h1>
        <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">A clean control surface for projects, API keys, billing, and usage.</p>
      </motion.div>

      <PendingInvites />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total API Requests" 
          value={summary.totalUsage.toLocaleString()} 
          subtext="Requests made in current cycle"
          icon={Activity}
          loading={loading}
          delay={0.02}
        />
        <StatsCard 
          title="Remaining Quota" 
          value={summary.remaining.toLocaleString()} 
          subtext={`Resets on ${resetLabel}`}
          icon={BarChart}
          loading={loading}
          delay={0.06}
        />
        <StatsCard 
          title="Active Projects" 
          value={projects.length} 
          subtext="Managed under your account"
          icon={Database}
          loading={loading}
          delay={0.1}
        />
        <StatsCard 
          title="Current Plan" 
          value={plan.charAt(0).toUpperCase() + plan.slice(1)} 
          subtext={`${summary.totalLimit.toLocaleString()} reqs / cycle`}
          icon={CreditCard}
          loading={loading}
          delay={0.14}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UsageChart
            data={chartData}
            loading={chartLoading}
            timeRange={timeRange}
            projectId={projectFilter}
            apiKeyId={apiKeyFilter}
            projects={projects}
            apiKeys={apiKeys}
            onTimeRangeChange={setTimeRange}
            onProjectChange={setProjectFilter}
            onApiKeyChange={setApiKeyFilter}
            lastUpdatedAt={lastUpdatedAt}
          />
        </div>

        <GlassCard className="flex flex-col" hover={false} delay={0.22}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Projects</h3>
            <Link href="/dashboard/projects" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
              View all <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                      <div className="h-3 bg-slate-50 dark:bg-slate-800 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 rounded-2xl border border-dashed border-slate-200/80 bg-white/35 dark:border-white/10 dark:bg-white/5">
                <Database className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">No projects yet</p>
                <p className="text-xs text-slate-500 mt-1">Create a project to start organizing data.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map(p => (
                  <div key={p._id} className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-white/60 dark:hover:border-white/10 cursor-pointer">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{p.name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">ID: {p._id.slice(-6)}</p>
                    </div>
                    <Key className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col" hover={false} delay={0.28}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Templates</h3>
            <Link href="/dashboard/projects" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1">
              View projects <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
              <div className="space-y-4">
                {[1,2].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                      <div className="h-3 bg-slate-50 dark:bg-slate-800 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 rounded-2xl border border-dashed border-slate-200/80 bg-white/35 dark:border-white/10 dark:bg-white/5">
                <Mail className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">No templates yet</p>
                <p className="text-xs text-slate-500 mt-1">Create templates within your projects.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTemplates.map(t => (
                  <div 
                    key={t._id} 
                    onClick={() => {
                      // We need the project ID to navigate. 
                      // If t.project is an object, use t.project._id, otherwise use t.project
                      const pId = typeof t.project === 'object' ? t.project._id : t.project;
                      window.location.href = `/dashboard/projects/${pId}/templates/${t._id}`;
                    }}
                    className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-white/60 dark:hover:border-white/10 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{t.name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">Updated {new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
