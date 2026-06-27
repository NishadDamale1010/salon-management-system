import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Sparkles } from "lucide-react";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";

export default function InstallBanner() {
  const { isInstallable, triggerInstall } = useInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner after a slight delay if app is installable
    if (isInstallable) {
      const timer = setTimeout(() => {
        // Only show if the user hasn't dismissed it in this session
        const isDismissed = sessionStorage.getItem("pwa_install_dismissed");
        if (!isDismissed) {
          setIsVisible(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  const handleInstall = async () => {
    const success = await triggerInstall();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa_install_dismissed", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[100]"
        >
          <div className="glass border border-yellow-400/50 p-5 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface-card)] to-purple-950/20">
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[var(--color-rose-500)]/20 rounded-full blur-xl pointer-events-none" />

            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1"
              aria-label="Dismiss install prompt"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-4 items-start pr-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                <Sparkles className="w-6 h-6 text-amber-950 animate-pulse" />
              </div>
              <div>
                <h4 className="font-display font-black text-base text-[var(--color-text-primary)] flex items-center gap-1.5">
                  Gayatri Beauty App
                </h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 font-semibold">
                  Install for a faster, offline-friendly booking experience right from your home screen.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleInstall}
                className="flex-1 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 font-bold rounded-xl text-sm transition-all hover:shadow-[0_0_15px_rgba(250,204,21,0.4)] flex items-center justify-center gap-1.5 hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 bg-[var(--color-surface-2)] text-[var(--color-text-primary)] font-bold rounded-xl text-sm border border-[var(--color-border)] hover:bg-[var(--color-surface-card)] transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
