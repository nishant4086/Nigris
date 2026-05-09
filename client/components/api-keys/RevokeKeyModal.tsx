import { useState } from "react";
import { X, AlertOctagon, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

type RevokeKeyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  keyId: string;
  keyName: string;
};

export default function RevokeKeyModal({ isOpen, onClose, onSuccess, keyId, keyName }: RevokeKeyModalProps) {
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState("");
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen) return null;

  const handleRevoke = async () => {
    if (confirmText !== keyName) {
      setError("Confirmation text does not match.");
      return;
    }

    setRevoking(true);
    setError("");
    try {
      // The user asked for "Revoke / Delete Key", the backend uses DELETE /keys/:id
      await api.delete(`/keys/${keyId}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to revoke key");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#191919] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Revoke API Key</h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={revoking}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#252525] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            This action cannot be undone. Any applications using this API key will immediately lose access and requests will fail.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Type <strong className="text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{keyName || "Untitled"}</strong> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={keyName || "Untitled"}
              className="w-full bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all dark:text-slate-200"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#111111] border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <button
            onClick={onClose}
            disabled={revoking}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRevoke}
            disabled={revoking || confirmText !== keyName}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {revoking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {revoking ? "Revoking..." : "Revoke Key"}
          </button>
        </div>

      </div>
    </div>
  );
}
