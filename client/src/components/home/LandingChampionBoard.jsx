import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Clock, ArrowRight, Users, Sparkles } from "lucide-react";
import { authService } from "../../services";
import { useAuthStore } from "../../store/authStore";
import { getInitials } from "../../utils";

export default function LandingChampionBoard({ compact = false }) {
  const { data: monthlyData } = useQuery({ 
    queryKey: ["MONTHLY_LEADERBOARD"], 
    queryFn: authService.getMonthlyLeaderboard 
  });
  
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  
  const leaderboard = monthlyData?.data || [];
  const top3 = leaderboard.slice(0, 3);
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });
  const [currentMonth, setCurrentMonth] = useState("");
  const [nextMonth, setNextMonth] = useState("");

  useEffect(() => {
    const now = new Date();
    setCurrentMonth(now.toLocaleString('default', { month: 'short' }));
    
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    setNextMonth(nextMonthDate.toLocaleString('default', { month: 'short' }));

    const updateTimer = () => {
      const diff = nextMonthDate - new Date();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          mins: Math.floor((diff / 1000 / 60) % 60)
        });
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  if (leaderboard.length === 0) return null;

  if (compact) {
    return (
      <div className="w-full bg-gradient-to-br from-rose-50 to-pink-100/50 rounded-2xl p-2 sm:p-3 border border-rose-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
         <h3 className="text-[9px] sm:text-[10px] font-bold text-gray-900 mb-2 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            {currentMonth} Champions
         </h3>
         
         <div className="flex items-end justify-center gap-1 sm:gap-2 h-16 sm:h-20 w-full px-1">
            {/* Rank 2 */}
            {top3[1] && (
              <div className="flex flex-col items-center flex-1">
                 <div className="text-[10px]">🥈</div>
                 <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 border border-gray-300 mt-0.5 flex items-center justify-center overflow-hidden">
                   {top3[1].avatar ? <img src={top3[1].avatar} className="w-full h-full object-cover"/> : <span className="text-[8px] font-bold text-gray-500">{getInitials(top3[1].firstName, "")}</span>}
                 </div>
                 <div className="w-full h-4 sm:h-6 bg-gray-100 rounded-t border border-gray-200 border-b-0 mt-1 flex justify-center">
                    <span className="text-[8px] sm:text-[9px] font-bold text-gray-600 mt-1">2</span>
                 </div>
              </div>
            )}
            
            {/* Rank 1 */}
            {top3[0] && (
              <div className="flex flex-col items-center flex-1 relative z-10 -mt-2">
                 <div className="text-[12px] animate-bounce">👑</div>
                 <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-100 border-2 border-yellow-400 mt-0.5 flex items-center justify-center overflow-hidden shadow-sm">
                   {top3[0].avatar ? <img src={top3[0].avatar} className="w-full h-full object-cover"/> : <span className="text-[10px] font-bold text-yellow-600">{getInitials(top3[0].firstName, "")}</span>}
                 </div>
                 <div className="w-full h-6 sm:h-8 bg-yellow-50 rounded-t-md border border-yellow-300 border-b-0 mt-1 flex justify-center">
                    <span className="text-[9px] sm:text-[10px] font-black text-yellow-700 mt-1">1</span>
                 </div>
              </div>
            )}
            
            {/* Rank 3 */}
            {top3[2] && (
              <div className="flex flex-col items-center flex-1">
                 <div className="text-[10px]">🥉</div>
                 <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-100 border border-orange-200 mt-0.5 flex items-center justify-center overflow-hidden">
                   {top3[2].avatar ? <img src={top3[2].avatar} className="w-full h-full object-cover"/> : <span className="text-[8px] font-bold text-orange-600">{getInitials(top3[2].firstName, "")}</span>}
                 </div>
                 <div className="w-full h-3 sm:h-4 bg-orange-50 rounded-t border border-orange-200 border-b-0 mt-1 flex justify-center">
                    <span className="text-[8px] sm:text-[9px] font-bold text-orange-600 mt-0.5">3</span>
                 </div>
              </div>
            )}
         </div>

         <div className="w-full bg-white rounded-lg py-1 mt-1 border border-rose-100 shadow-inner">
           {isAuthenticated && user ? (
              <div className="text-[8px] font-bold text-gray-700 flex justify-between px-2">
                 <span>Your Rank:</span>
                 <span className="text-rose-500">#{leaderboard.findIndex(c => c._id === user._id) !== -1 ? leaderboard.findIndex(c => c._id === user._id) + 1 : "N/A"}</span>
              </div>
           ) : (
              <Link to="/register" className="text-[8px] font-bold text-rose-500 block hover:underline">
                 Join Leaderboard <ArrowRight className="w-2 h-2 inline" />
              </Link>
           )}
         </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-rose-50/80 via-white to-pink-50/80 rounded-3xl p-6 border border-rose-100 shadow-[0_8px_30px_rgba(244,63,94,0.06)] overflow-hidden relative mb-12">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-200/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />
      
      {/* Confetti / Sparkles */}
      <Sparkles className="absolute top-6 left-6 text-yellow-400 w-4 h-4 opacity-50" />
      <Sparkles className="absolute top-12 right-1/4 text-rose-400 w-3 h-3 opacity-50" />
      <Sparkles className="absolute bottom-8 right-8 text-purple-400 w-5 h-5 opacity-50" />

      <div className="relative z-10 flex flex-col xl:flex-row items-center gap-8 justify-between">
        
        {/* LEFT COLUMN: Header & Timer */}
        <div className="flex-1 flex flex-col items-center xl:items-start text-center xl:text-left gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              {currentMonth} Champion Board
            </h2>
            <p className="text-gray-500 text-xs font-medium">Top Glow Points Earners This Month</p>
          </div>

          <div className="mt-2 inline-flex items-center gap-2 bg-rose-50 text-rose-500 px-3 py-1.5 rounded-full font-bold text-[10px]">
            Resets in: {String(timeLeft.days).padStart(2, '0')}d : {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.mins).padStart(2, '0')}m
          </div>
          
          <div className="mt-4 hidden xl:block">
             <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg relative">
                <Trophy className="w-12 h-12 text-white drop-shadow-md" />
                <Sparkles className="absolute -right-2 top-2 text-yellow-600 w-6 h-6 animate-pulse" />
             </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Top 3 Podium Cards */}
        <div className="flex-1 flex items-end justify-center gap-2 md:gap-4 shrink-0">
          
          {/* Rank 2 */}
          {top3[1] && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} 
              className="bg-white rounded-[2rem] p-4 w-[100px] sm:w-[120px] border border-gray-100 shadow-sm flex flex-col items-center text-center relative z-10 pb-6">
              <div className="absolute -top-5 w-10 h-10">
                 <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-gray-300 drop-shadow"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/></svg>
                 <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-gray-600 mt-1">2</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 mt-4 flex items-center justify-center overflow-hidden">
                {top3[1].avatar ? <img src={top3[1].avatar} className="w-full h-full object-cover"/> : <span className="text-sm font-bold text-gray-500">{getInitials(top3[1].firstName, top3[1].lastName)}</span>}
              </div>
              <p className="font-bold text-[11px] sm:text-xs text-gray-900 mt-3 truncate w-full">{top3[1].firstName}</p>
              <p className="font-display font-black text-sm sm:text-base text-rose-500 mt-1">{top3[1].monthlyGlowPoints}</p>
              <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-semibold">Glow Points</p>
            </motion.div>
          )}

          {/* Rank 1 */}
          {top3[0] && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} 
              className="bg-white rounded-[2.5rem] p-4 w-[110px] sm:w-[130px] border border-yellow-200 shadow-md flex flex-col items-center text-center relative z-20 -mt-6 pb-8">
              <div className="absolute -top-7 w-14 h-14 z-30">
                 <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-yellow-400 drop-shadow-md"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/></svg>
                 <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-yellow-800 mt-1">1</span>
              </div>
              <div className="w-14 h-14 rounded-full bg-yellow-50 border-2 border-yellow-300 mt-4 flex items-center justify-center overflow-hidden shadow-inner">
                {top3[0].avatar ? <img src={top3[0].avatar} className="w-full h-full object-cover"/> : <span className="text-lg font-bold text-yellow-600">{getInitials(top3[0].firstName, top3[0].lastName)}</span>}
              </div>
              <p className="font-bold text-xs sm:text-sm text-gray-900 mt-3 truncate w-full">{top3[0].firstName}</p>
              <p className="font-display font-black text-lg sm:text-xl text-rose-500 mt-1">{top3[0].monthlyGlowPoints}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-semibold">Glow Points</p>
            </motion.div>
          )}

          {/* Rank 3 */}
          {top3[2] && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} 
              className="bg-white rounded-[2rem] p-4 w-[100px] sm:w-[120px] border border-gray-100 shadow-sm flex flex-col items-center text-center relative z-10 pb-6">
              <div className="absolute -top-5 w-10 h-10">
                 <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-orange-300 drop-shadow"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/></svg>
                 <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-orange-800 mt-1">3</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 mt-4 flex items-center justify-center overflow-hidden">
                {top3[2].avatar ? <img src={top3[2].avatar} className="w-full h-full object-cover"/> : <span className="text-sm font-bold text-gray-500">{getInitials(top3[2].firstName, top3[2].lastName)}</span>}
              </div>
              <p className="font-bold text-[11px] sm:text-xs text-gray-900 mt-3 truncate w-full">{top3[2].firstName}</p>
              <p className="font-display font-black text-sm sm:text-base text-rose-500 mt-1">{top3[2].monthlyGlowPoints}</p>
              <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-semibold">Glow Points</p>
            </motion.div>
          )}

        </div>

        {/* RIGHT COLUMN: Personal CTA */}
        <div className="w-full xl:w-48 bg-white rounded-3xl p-5 border border-rose-100 flex flex-col items-center justify-center text-center shrink-0">
          {isAuthenticated && user ? (
            <>
              <p className="text-[10px] text-gray-500 font-bold mb-1">Your Rank</p>
              <p className="font-display text-4xl font-black text-rose-500">
                {leaderboard.findIndex(c => c._id === user._id) !== -1 ? `#${leaderboard.findIndex(c => c._id === user._id) + 1}` : "N/A"}
              </p>
              <p className="text-sm font-bold text-gray-900 mt-1">{user.monthlyGlowPoints || 0}</p>
              <p className="text-[8px] text-gray-500 font-medium mb-4">Glow Points</p>
              <Link to="/leaderboard" className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-md transition-colors text-[10px] active:scale-95">
                View Leaderboard
              </Link>
            </>
          ) : (
            <>
              <p className="text-[10px] text-gray-500 font-bold mb-1">Join to Rank</p>
              <p className="font-display text-2xl font-black text-rose-500 mb-2">#?</p>
              <p className="text-[8px] text-gray-500 mb-4 px-2">Earn points on every booking!</p>
              <Link to="/register" className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-md transition-colors text-[10px] active:scale-95">
                Register Free
              </Link>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
