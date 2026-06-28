import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, Crown, UserPlus } from "lucide-react";

// Mock data to simulate active users
const NAMES = ["Priya", "Sneha", "Anjali", "Neha", "Riya", "Kavya", "Aarohi", "Meera", "Shruti", "Tara"];
const ACTIONS = [
  { text: "just booked a Hair Spa", icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
  { text: "just registered for the app", icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { text: "just became a Gold Member", icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { text: "just booked a Bridal Makeup", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10" },
  { text: "earned 50 Glow Points", icon: Sparkles, color: "text-[var(--color-rose-500)]", bg: "bg-[var(--color-rose-500)]/10" },
];

export default function SocialProofPopup() {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start the cycle after a few seconds
    const initialDelay = setTimeout(() => {
      triggerNextEvent();
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, []);

  const triggerNextEvent = () => {
    const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
    const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const timeAgo = Math.floor(Math.random() * 10) + 1; // 1 to 10 mins ago

    setCurrentEvent({
      name: randomName,
      action: randomAction,
      time: `${timeAgo} min ago`
    });
    
    setIsVisible(true);

    // Hide after 4 seconds
    setTimeout(() => {
      setIsVisible(false);
      
      // Schedule next event between 8 to 20 seconds later
      const nextDelay = Math.floor(Math.random() * 12000) + 8000;
      setTimeout(() => {
        triggerNextEvent();
      }, nextDelay);
    }, 4000);
  };

  return (
    <AnimatePresence>
      {isVisible && currentEvent && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 left-6 z-50 flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl rounded-2xl p-3 pr-6 max-w-sm"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${currentEvent.action.bg}`}>
            <currentEvent.action.icon className={`w-5 h-5 ${currentEvent.action.color}`} />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-primary)]">
              <span className="font-bold">{currentEvent.name}</span> {currentEvent.action.text}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{currentEvent.time}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
