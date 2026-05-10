import { Clock, Key, Activity as ActivityIcon } from "lucide-react";

type UsageLog = {
  _id: string;
  projectId: { name: string } | string;
  apiKeyId: { name: string; maskedKey: string; environment: string } | string | null;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
};

type ActivityTableProps = {
  logs: UsageLog[];
  loading: boolean;
};

export default function ActivityTable({ logs, loading }: ActivityTableProps) {
  return (
    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Activity</h3>
        <p className="text-sm text-slate-500">Live feed of API requests across your projects</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3 font-medium">Timestamp</th>
              <th className="px-6 py-3 font-medium">API Key</th>
              <th className="px-6 py-3 font-medium">Endpoint</th>
              <th className="px-6 py-3 font-medium text-right">Status</th>
              <th className="px-6 py-3 font-medium text-right">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-48"></div></td>
                  <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-12 ml-auto"></div></td>
                  <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-12 ml-auto"></div></td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <ActivityIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
                    <p>No activity logs found for this time range.</p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isError = log.statusCode >= 400;
                
                // Safely extract API Key info
                let keyName = "Unknown Key";
                let keyEnv = "";
                if (log.apiKeyId && typeof log.apiKeyId === "object") {
                  keyName = log.apiKeyId.name || log.apiKeyId.maskedKey;
                  keyEnv = log.apiKeyId.environment;
                }

                return (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-[#202020]/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-md">
                          <Key className="w-3 h-3 text-slate-500" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{keyName}</span>
                        {keyEnv && (
                          <span className="text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                            {keyEnv}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          log.method === 'GET' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                          log.method === 'POST' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                          log.method === 'DELETE' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {log.method}
                        </span>
                        <code className="text-xs text-slate-600 dark:text-slate-400">{log.endpoint}</code>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        isError 
                          ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                      }`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 font-mono text-xs">
                      {log.responseTime}ms
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
