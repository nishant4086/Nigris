"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Brain, Shield, Zap, AlertTriangle, CheckCircle, RefreshCcw } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

interface AiReport {
  _id: string;
  reportDate: string;
  healthScore: number;
  criticalIssues: string[];
  performanceInsights: string[];
  securityInsights: string[];
  recommendations: string[];
}

export default function IntelligenceDashboard() {
  const [report, setReport] = useState<AiReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchLatestReport = async () => {
    try {
      setLoading(true);
      const res = await api.get("/intelligence/latest");
      setReport(res.data);
    } catch (err) {
      console.error("Failed to fetch report", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLatestReport();
  }, []);

  const triggerGeneration = async () => {
    try {
      setGenerating(true);
      await api.post("/intelligence/generate");
      alert("AI Report generation queued successfully. It may take a few minutes.");
    } catch {
      alert("Failed to queue generation");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Intelligence Center
          </h1>
          <p className="text-slate-500">
            AI-powered insights, security analysis, and performance recommendations.
          </p>
        </div>
        <button
          onClick={triggerGeneration}
          disabled={generating}
          className="gradient-button flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {generating ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
          {generating ? "Generating..." : "Run AI Analysis"}
        </button>
      </div>

      {!report ? (
        <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
          <Brain className="mb-4 h-12 w-12 text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">No AI Reports Found</h2>
          <p className="mt-2 text-sm text-slate-500">Run an analysis to generate your first intelligence report.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-12">
          {/* Health Score Overview */}
          <GlassCard className="col-span-12 md:col-span-4 flex flex-col items-center justify-center text-center p-8">
            <div className="relative mb-6">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={377} strokeDashoffset={377 - (377 * report.healthScore) / 100}
                  className={report.healthScore > 80 ? "text-emerald-500" : report.healthScore > 50 ? "text-amber-500" : "text-red-500"}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-black">{report.healthScore}</span>
              </div>
            </div>
            <h3 className="text-lg font-bold">System Health Score</h3>
            <p className="text-xs text-slate-500 mt-2">Generated on {new Date(report.reportDate).toLocaleDateString()}</p>
          </GlassCard>

          {/* Critical Issues */}
          <GlassCard className="col-span-12 md:col-span-8 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Critical Issues</h3>
            </div>
            {report.criticalIssues.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-sm font-medium text-slate-500">No critical issues detected.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {report.criticalIssues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0" />
                    <p className="text-sm text-red-900 dark:text-red-200">{issue}</p>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>

          {/* Insights Grid */}
          <GlassCard className="col-span-12 md:col-span-4 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">Security Insights</h3>
            </div>
            <ul className="space-y-3">
              {report.securityInsights.map((insight, idx) => (
                <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-white/5 last:border-0">{insight}</li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="col-span-12 md:col-span-4 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">Performance Insights</h3>
            </div>
            <ul className="space-y-3">
              {report.performanceInsights.map((insight, idx) => (
                <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-white/5 last:border-0">{insight}</li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="col-span-12 md:col-span-4 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-slate-900 dark:text-white">AI Recommendations</h3>
            </div>
            <ul className="space-y-3">
              {report.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-white/5 last:border-0">{rec}</li>
              ))}
            </ul>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
