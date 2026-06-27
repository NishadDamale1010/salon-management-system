import { useState, useEffect } from "react";
import { WifiOff, RotateCcw, Home, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    // Simulate check
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setIsRetrying(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-surface)] px-4 text-center relative overflow-hidden">
      
      {/* Background Magic Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[var(--color-rose-500)]/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-md w-full glass border border-[var(--color-border)] p-8 md:p-12 rounded-[3rem] shadow-2xl flex flex-col items-center">
        
        {/* Animated Wi-Fi Off Icon */}
        <div className="w-24 h-24 rounded-full bg-[var(--color-rose-500)]/10 border border-[var(--color-rose-500)]/30 flex items-center justify-center mb-8 relative animate-pulse">
          <WifiOff className="w-10 h-10 text-[var(--color-rose-500)]" />
          <div className="absolute -top-1 -right-1 text-yellow-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <h1 className="font-display text-3xl font-black text-[var(--color-text-primary)] mb-3">
          Connection Lost
        </h1>
        
        <p className="text-[var(--color-text-secondary)] font-medium text-base mb-8">
          It looks like you're offline. Check your internet connection or try again. Gayatri Beauty Studio is ready to welcome you back once you're online! 👑
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 font-bold rounded-2xl text-base transition-all hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Checking..." : "Retry Connection"}
          </button>
          
          <Link
            to="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 glass border border-[var(--color-border)] text-[var(--color-text-primary)] font-bold rounded-2xl text-base transition-all hover:bg-[var(--color-surface-2)] hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4 text-[var(--color-rose-500)]" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
