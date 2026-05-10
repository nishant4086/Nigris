type EndpointData = {
  name: string;
  value: number;
};

type ApiKeyBreakdownProps = {
  data: EndpointData[];
  loading: boolean;
};

export default function ApiKeyBreakdown({ data, loading }: ApiKeyBreakdownProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-[350px] flex flex-col justify-center gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="w-full h-8 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.value), 1); // Avoid division by zero

  return (
    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-[350px] overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Endpoint Breakdown</h3>
        <p className="text-sm text-slate-500">Most active routes</p>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-slate-400 text-center mt-12">No endpoint data</p>
      ) : (
        <div className="space-y-4 mt-6">
          {data.map((item, idx) => (
            <div key={idx} className="relative">
              <div className="flex justify-between text-xs mb-1 relative z-10">
                <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[70%]">{item.name}</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{item.value.toLocaleString()} reqs</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800/60 rounded-full h-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${(item.value / maxVal) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
