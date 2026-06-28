import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { cn } from "../../utils";

const TIPS = [
  "You are a Queen! Remember to wear your invisible crown today. 👑",
  "Beauty Tip: Hydration is key! Drink 8 glasses of water today. 💧",
  "Don't forget to moisturize your neck—it shows aging first! 🧴",
  "Beauty Tip: Always take off your makeup before bed to let your skin breathe. 🌙",
  "Treat yourself! You've earned a relaxing massage this week. 💆‍♀️"
];

export default function DailyTipModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [tip, setTip] = useState("");

  useEffect(() => {
    // Only show once per session
    const hasSeenTip = sessionStorage.getItem("hasSeenDailyTip");
    if (!hasSeenTip) {
      // Pick a random tip
      const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
      setTip(randomTip);
      
      // Delay popup slightly for dramatic effect
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("hasSeenDailyTip", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm glass bg-white/80 dark:bg-black/60 rounded-3xl p-6 shadow-2xl border border-[var(--color-border)] overflow-hidden"
          >
            {/* Background decorations */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-rose-500)]/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />

            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-4 h-4 text-[var(--color-text-primary)]" />
            </button>

            <div className="relative z-10 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--color-rose-400)] to-[var(--color-rose-600)] flex items-center justify-center shadow-lg shadow-[var(--color-rose-500)]/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold text-[var(--color-text-primary)] mb-2">
                Just for you
              </h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {tip}
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-[var(--color-rose-500)] text-white font-medium hover:bg-[var(--color-rose-600)] transition-colors"
              >
                Thanks!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
