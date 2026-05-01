"use client";

import { useEffect, useState } from "react";
import { api, getApiErrorMessage } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

type DailyData = {
  time: string;
  count: number;
};

type EndpointData = {
  endpoint: string;
  count: number;
};

type Project = {
  _id: string;
  name: string;
};

export default function UsagePage() {
  const [summary, setSummary] = useState({ totalRequests: 0, successCount: 0, errorCount: 0, avgResponseTime: 0 });
  const [daily, setDaily] = useState<DailyData[]>([]);
  const [endpoints, setEndpoints] = useState<EndpointData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch projects on mount
  useEffect(() => {
    api.get("/projects")
      .then((res) => setProjects(res.data))
      .catch((err) => console.error("Failed to load projects", err));
  }, []);

  // Fetch usage when filters change
  useEffect(() => {
    const fetchUsage = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (selectedProject) params.append("projectId", selectedProject);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const q = params.toString() ? `?${params.toString()}` : "";
        const timeQ = params.toString() ? `?${params.toString()}&groupBy=day` : "?groupBy=day";

        const [sumRes, timeRes, topRes] = await Promise.all([
          api.get(`/usage/summary${q}`),
          api.get(`/usage/timeseries${timeQ}`),
          api.get(`/usage/top-endpoints${q}`)
        ]);

        setSummary(sumRes.data);
        setDaily(timeRes.data);
        setEndpoints(topRes.data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load usage data. Please try again later."));
        console.error("Failed to fetch usage", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [selectedProject, startDate, endDate]);

  return (
    <div className="p-6 space-y-6">

      {/* 🎛 FILTERS */}
      <div className="bg-white shadow rounded-2xl p-6 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Project</label>
          <select
            className="border p-2 rounded-md bg-gray-50"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Start Date</label>
          <input
            type="date"
            className="border p-2 rounded-md bg-gray-50"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">End Date</label>
          <input
            type="date"
            className="border p-2 rounded-md bg-gray-50"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* 🚨 ERROR ALERT */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ⏳ LOADING SKELETON */}
      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="bg-gray-200 h-24 rounded-2xl"></div>)}
          </div>
          <div className="bg-gray-200 h-80 rounded-2xl"></div>
          <div className="bg-gray-200 h-80 rounded-2xl"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 🔢 TOTAL CARD */}
            <div className="bg-white shadow rounded-2xl p-6">
              <h2 className="text-gray-500 text-sm">Total Requests</h2>
              <p className="text-3xl font-bold">{summary.totalRequests}</p>
            </div>
            {/* ✅ SUCCESS CARD */}
            <div className="bg-white shadow rounded-2xl p-6">
              <h2 className="text-gray-500 text-sm">Success</h2>
              <p className="text-3xl font-bold text-green-600">{summary.successCount}</p>
            </div>
            {/* ❌ ERROR CARD */}
            <div className="bg-white shadow rounded-2xl p-6">
              <h2 className="text-gray-500 text-sm">Errors</h2>
              <p className="text-3xl font-bold text-red-600">{summary.errorCount}</p>
            </div>
            {/* ⏱ RESPONSE TIME CARD */}
            <div className="bg-white shadow rounded-2xl p-6">
              <h2 className="text-gray-500 text-sm">Avg Response Time</h2>
              <p className="text-3xl font-bold text-blue-600">{summary.avgResponseTime}ms</p>
            </div>
          </div>

          {/* 📈 DAILY CHART */}
          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Usage Over Time</h2>
            {daily.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-400">No Data</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={daily}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 📊 ENDPOINTS CHART */}
          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Top Endpoints</h2>
            {endpoints.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-400">No Data</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={endpoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="endpoint" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}