import { useState } from "react";
import { Copy, Check } from "lucide-react";

type CopyButtonProps = {
  text: string | undefined | null;
  className?: string;
  showText?: boolean;
};

export default function CopyButton({ text, className = "", showText = false }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  // Don't render if text is empty
  if (!text) {
    return null;
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-HTTPS or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Silently fail but keep the visual feedback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`group relative flex items-center justify-center transition-colors ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-500 animate-in zoom-in duration-200" />
      ) : (
        <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
      )}

      {showText && (
        <span className={`ml-2 text-sm font-medium ${copied ? "text-emerald-500" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"}`}>
          {copied ? "Copied!" : "Copy"}
        </span>
      )}

      {/* Tooltip */}
      {!showText && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {copied ? "Copied!" : "Copy key"}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </button>
  );
}
