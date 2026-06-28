import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X, Sparkles } from "lucide-react";

export default function UpdateToast({ needRefresh, updateServiceWorker, close }) {
  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed top-4 left-4 right-4 md:top-auto md:bottom-6 md:left-auto md:right-4 md:w-96 z-[100]"
        >
          <div className="glass border border-[var(--color-rose-500)]/40 p-5 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface-card)] to-purple-950/20">
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[var(--color-rose-500)]/20 rounded-full blur-xl pointer-events-none" />

            <button
              onClick={close}
              className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1"
              aria-label="Close update prompt"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-4 items-start pr-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-rose-500)] to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h4 className="font-display font-black text-base text-[var(--color-text-primary)]">
                  App Update Available
                </h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 font-semibold">
                  A new version of Gayatri Beauty Studio is available. Update now to experience the latest features and magic.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => updateServiceWorker()}
                className="flex-1 py-2.5 bg-gradient-to-r from-[var(--color-rose-500)] to-purple-600 text-white font-bold rounded-xl text-sm transition-all hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] flex items-center justify-center gap-1.5 hover:scale-[1.02]"
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                Update Now
              </button>
              <button
                onClick={close}
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
