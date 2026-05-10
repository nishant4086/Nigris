import { Activity, Database, Zap, Key } from "lucide-react";

type SummaryCardsProps = {
  data: {
    totalRequests: number;
    totalLimit: number;
    remaining: number;
    activeKeys: number;
    dailyAvg: number;
    nextResetAt: string;
  };
  loading: boolean;
};

export default function SummaryCards({ data, loading }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm animate-pulse h-[116px]"></div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Requests",
      value: data.totalRequests.toLocaleString(),
      subValue: `Reset: ${data.nextResetAt ? new Date(data.nextResetAt).toLocaleDateString() : 'N/A'}`,
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      label: "Remaining Quota",
      value: data.remaining.toLocaleString(),
      subValue: `Limit: ${data.totalLimit.toLocaleString()}`,
      icon: Database,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      label: "Daily Average",
      value: data.dailyAvg.toLocaleString(),
      subValue: "Last 30 days",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20"
    },
    {
      label: "Active API Keys",
      value: data.activeKeys.toString(),
      subValue: "Generating traffic",
      icon: Key,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between mb-2">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {card.label}
            </span>
            <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
              <card.icon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {card.value}
            </span>
            <span className="text-xs font-medium text-slate-400 mt-1">
              {card.subValue}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
