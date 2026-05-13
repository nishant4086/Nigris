import { AlertTriangle, Info, X } from "lucide-react";
import { api } from "@/lib/api";

export type AlertType = {
  _id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type AlertBannerProps = {
  alert: AlertType | null;
  onDismiss: () => void;
};

export default function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  if (!alert) return null;

  const handleDismiss = async () => {
    try {
      await api.patch(`/keys/alerts/${alert._id}/read`);
      onDismiss();
    } catch {
      // Dismiss locally anyway
      onDismiss();
    }
  };

  const isQuota = alert.type === "quota";

  return (
    <div className={`mb-6 flex items-start justify-between gap-4 p-4 rounded-xl border shadow-sm animate-in slide-in-from-top-4 ${
      isQuota 
        ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50" 
        : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/50"
    }`}>
      <div className="flex items-start gap-3">
        {isQuota ? (
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        )}
        <div>
          <h4 className={`font-bold text-sm ${isQuota ? "text-amber-800 dark:text-amber-300" : "text-blue-800 dark:text-blue-300"}`}>
            {isQuota ? "Quota Alert" : "System Alert"}
          </h4>
          <p className={`text-sm mt-0.5 ${isQuota ? "text-amber-700 dark:text-amber-400" : "text-blue-700 dark:text-blue-400"}`}>
            {alert.message}
          </p>
        </div>
      </div>
      
      <button 
        onClick={handleDismiss}
        className={`p-1.5 rounded-lg transition-colors shrink-0 ${
          isQuota 
            ? "text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/40" 
            : "text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40"
        }`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
