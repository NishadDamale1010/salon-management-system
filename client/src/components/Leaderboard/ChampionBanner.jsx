import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getInitials } from "../../utils";

export default function ChampionBanner({ user, leaderboard = [] }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const diff = nextMonth - now;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      
      setTimeLeft(`${days.toString().padStart(2, '0')}d : ${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m`);
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  if (!user || leaderboard.length === 0) return null;

  const myRankIndex = leaderboard.findIndex(c => c._id === user._id);
  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : "-";
  
  // Top 3 users
  const top3 = leaderboard.slice(0, 3);
  
  // Confetti graphic URL or SVG
  const confettiBg = "url('data:image/svg+xml;utf8,<svg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"20\" cy=\"20\" r=\"3\" fill=\"%23ffeb3b\"/><path d=\"M50 80l5 -15l10 5z\" fill=\"%23f44336\"/><rect x=\"80\" y=\"30\" width=\"8\" height=\"8\" fill=\"%239c27b0\" transform=\"rotate(45 80 30)\"/></svg>')";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-4 sm:p-5 mb-8 relative overflow-hidden flex flex-col gap-4 shadow-xl border border-rose-900/30"
      style={{
        background: `linear-gradient(135deg, #4a0d24 0%, #7e163d 50%, #4a0d24 100%)`,
        backgroundImage: `radial-gradient(circle at right, rgba(255,100,150,0.1) 0%, transparent 50%), linear-gradient(135deg, #4a0d24 0%, #7e163d 50%, #4a0d24 100%)`
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2">
          <span className="text-xl">👑</span>
          <h2 className="font-display text-base font-bold text-yellow-400">July Champion Board</h2>
          <div className="hidden sm:flex items-center ml-2 bg-black/30 rounded-full px-3 py-1 border border-white/10">
            <span className="text-xs text-white/80">Resets in <span className="font-mono text-white">{timeLeft}</span></span>
          </div>
        </div>
        <Link to="/leaderboard" className="flex items-center gap-1 text-xs text-white/80 hover:text-white bg-white/10 px-3 py-1.5 rounded-full border border-white/20 transition-colors">
          View Leaderboard <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Mobile timer row */}
      <div className="sm:hidden flex items-center justify-center bg-black/30 rounded-full px-3 py-1.5 border border-white/10 w-fit">
        <span className="text-[10px] text-white/80">Resets in <span className="font-mono text-white">{timeLeft}</span></span>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mt-2 relative z-10 w-full">
        
        {/* Your Rank Card */}
        <div className="bg-white rounded-2xl p-4 w-full sm:w-1/3 shadow-lg flex flex-col items-center justify-center border-2 border-transparent">
          <p className="text-xs font-semibold text-gray-800">Your Rank</p>
          <p className="text-4xl font-display font-bold text-[var(--color-rose-500)] mt-1">#{myRank}</p>
          <p className="text-xs font-medium text-gray-600 mt-2">{user.monthlyGlowPoints?.toLocaleString() || user.glowPoints?.toLocaleString() || 0} Glow Points</p>
        </div>

        {/* Top 3 Avatars */}
        <div className="flex-1 flex justify-center items-end h-28 gap-4 sm:gap-6 relative">
           {/* Confetti Background for right side */}
          <div className="absolute top-0 right-0 bottom-0 left-0 opacity-40 pointer-events-none" style={{ backgroundImage: confettiBg, backgroundSize: '150px' }}></div>
          
          {/* Rank 2 */}
          {top3[1] && (
            <div className="flex flex-col items-center relative z-10 transform translate-y-2">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-[3px] border-gray-300 overflow-hidden bg-gray-200">
                  {top3[1].avatar ? <img src={top3[1].avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">{getInitials(top3[1].firstName, top3[1].lastName)}</div>}
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center border-2 border-[#6c1134] text-[#6c1134] font-bold text-xs shadow-md">2</div>
              </div>
              <p className="text-white font-medium text-xs mt-2 truncate max-w-[70px] text-center">{top3[1].firstName} {top3[1].lastName?.charAt(0)}.</p>
              <p className="text-[var(--color-rose-300)] font-bold text-sm">{top3[1].monthlyGlowPoints?.toLocaleString()}</p>
            </div>
          )}

          {/* Rank 1 */}
          {top3[0] && (
            <div className="flex flex-col items-center relative z-20">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-[3px] border-yellow-400 overflow-hidden bg-yellow-100 shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                  {top3[0].avatar ? <img src={top3[0].avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-yellow-600 font-bold text-lg">{getInitials(top3[0].firstName, top3[0].lastName)}</div>}
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-[#6c1134] text-yellow-900 font-bold text-sm shadow-md">1</div>
              </div>
              <p className="text-white font-bold text-sm mt-2 truncate max-w-[80px] text-center">{top3[0].firstName} {top3[0].lastName?.charAt(0)}.</p>
              <p className="text-yellow-400 font-bold text-base">{top3[0].monthlyGlowPoints?.toLocaleString()}</p>
            </div>
          )}

          {/* Rank 3 */}
          {top3[2] && (
            <div className="flex flex-col items-center relative z-10 transform translate-y-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-[3px] border-amber-700 overflow-hidden bg-amber-100">
                  {top3[2].avatar ? <img src={top3[2].avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-amber-700 font-bold text-sm">{getInitials(top3[2].firstName, top3[2].lastName)}</div>}
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-amber-700 rounded-full flex items-center justify-center border-2 border-[#6c1134] text-white font-bold text-xs shadow-md">3</div>
              </div>
              <p className="text-white font-medium text-xs mt-2 truncate max-w-[70px] text-center">{top3[2].firstName} {top3[2].lastName?.charAt(0)}.</p>
              <p className="text-[var(--color-rose-300)] font-bold text-sm">{top3[2].monthlyGlowPoints?.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
