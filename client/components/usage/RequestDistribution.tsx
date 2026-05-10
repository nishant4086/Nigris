import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type StatusData = {
  name: string;
  value: number;
};

type RequestDistributionProps = {
  data: StatusData[];
  loading: boolean;
};

const COLORS = {
  Success: "#10b981", // emerald-500
  Error: "#ef4444",   // red-500
};

const CHART_HEIGHT = 246;

export default function RequestDistribution({ data, loading }: RequestDistributionProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-[350px] flex items-center justify-center">
        <div className="w-48 h-48 rounded-full border-8 border-slate-100 dark:border-[#252525] animate-pulse"></div>
      </div>
    );
  }

  const hasData = data.some(d => d.value > 0);

  return (
    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-[350px] flex flex-col">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Status Code Distribution</h3>
        <p className="text-sm text-slate-500">Success vs Failed requests</p>
      </div>

      <div className="relative flex h-[246px] min-h-[246px] w-full min-w-0 items-center justify-center overflow-hidden">
        {!hasData ? (
          <p className="text-sm text-slate-400">No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={0}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#64748b"} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => {
                  const count = typeof value === "number" ? value : Number(value ?? 0);
                  return [`${count.toLocaleString()} requests`, "Count"];
                }}
                contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        )}
        
        {/* Inner absolute text for donut chart */}
        {hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {data.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">Total</span>
          </div>
        )}
      </div>
    </div>
  );
}
