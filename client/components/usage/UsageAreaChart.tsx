import { useTheme } from "next-themes";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";

type TimeSeriesData = {
  date: string;
  requests: number;
  errors: number;
  isAnomaly?: boolean;
};

type UsageAreaChartProps = {
  data: TimeSeriesData[];
  loading: boolean;
};

const CHART_HEIGHT = 300;

export default function UsageAreaChart({ data, loading }: UsageAreaChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6 h-[400px] flex items-center justify-center">
        <div className="w-full h-full bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6 h-[400px] flex flex-col items-center justify-center text-slate-500">
        <p className="font-semibold text-slate-700 dark:text-slate-300">No usage data</p>
        <p className="text-sm">Start making API requests to see trends here.</p>
      </div>
    );
  }

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">API Requests</h3>
        <p className="text-sm text-slate-500">Total volume over the selected time range</p>
      </div>
      
      <div className="relative h-[300px] min-h-[300px] w-full min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={0}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#e2e8f0"} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: isDark ? "#888" : "#64748b", fontSize: 12 }} 
              dy={10}
              minTickGap={30}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: isDark ? "#888" : "#64748b", fontSize: 12 }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? "#111" : "#fff", 
                borderRadius: "12px",
                border: isDark ? "1px solid #333" : "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            />
            <Area 
              type="monotone" 
              dataKey="requests" 
              name="Success"
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRequests)" 
            />
            <Area 
              type="monotone" 
              dataKey="errors" 
              name="Errors"
              stroke="#ef4444" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorErrors)" 
            />
            {data.filter(d => d.isAnomaly).map((anomaly, index) => (
              <ReferenceDot 
                key={`anomaly-${index}`}
                x={anomaly.date} 
                y={anomaly.requests} 
                r={6} 
                fill="#ef4444" 
                stroke={isDark ? "#191919" : "#fff"} 
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
