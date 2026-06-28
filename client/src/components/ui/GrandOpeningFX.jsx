import { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

export default function GrandOpeningFX() {
  useEffect(() => {
    // Fireworks effect from the bottom corners (slower and smaller)
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    
    // Toned down confetti to make it less aggressive
    const defaults = { 
      startVelocity: 20, 
      spread: 360, 
      ticks: 200, // makes them last longer and fall slower
      zIndex: 0,
      scalar: 0.7, // smaller particles
      gravity: 0.6 // fall slower
    };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 20 * (timeLeft / duration); // fewer particles
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.1 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.1 } }));
    }, 800); // Trigger less frequently

    return () => clearInterval(interval);
  }, []);

  // Floating celebration emojis instead of fake CSS balloons
  const floaters = [
    { id: 1, text: "🎈", left: "15%", delay: 0, size: "text-6xl" },
    { id: 2, text: "🎉", left: "35%", delay: 2, size: "text-5xl" },
    { id: 3, text: "🥳", left: "50%", delay: 1, size: "text-7xl" },
    { id: 4, text: "🎈", left: "70%", delay: 3, size: "text-5xl" },
    { id: 5, text: "✨", left: "85%", delay: 1.5, size: "text-6xl" },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {floaters.map((f) => (
        <motion.div
          key={f.id}
          initial={{ y: "110vh", opacity: 0, rotate: -10 }}
          animate={{ 
            y: "-20vh", 
            opacity: [0, 1, 1, 0],
            rotate: 10,
            x: [0, 20, -20, 0] // gentle sway
          }}
          transition={{ 
            duration: 12, // slow float
            delay: f.delay, 
            ease: "easeInOut", 
            repeat: Infinity 
          }}
          className={`absolute ${f.size} drop-shadow-lg opacity-80`}
          style={{ left: f.left }}
        >
          {f.text}
        </motion.div>
      ))}
    </div>
  );
}
