import { useQuery } from "@tanstack/react-query";
import { Trophy, Crown, Sparkles, Star, Target } from "lucide-react";
import { motion } from "framer-motion";
import { authService } from "../../services";
import { getInitials } from "../../utils";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";

export default function Leaderboard() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState("monthly");
  
  const { data: leaderboardData, isLoading: isLoadingLifetime } = useQuery({ queryKey: ["LEADERBOARD"], queryFn: authService.getLeaderboard });
  const { data: monthlyData, isLoading: isLoadingMonthly } = useQuery({ queryKey: ["MONTHLY_LEADERBOARD"], queryFn: authService.getMonthlyLeaderboard });
  
  const isLoading = activeTab === "monthly" ? isLoadingMonthly : isLoadingLifetime;
  const leaderboard = activeTab === "monthly" ? (monthlyData?.data || []) : (leaderboardData?.data?.lifetime || []);
  const pointsKey = activeTab === "monthly" ? "monthlyGlowPoints" : "lifetimeGlowPoints";

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-10">
      
      {/* Header */}
      <div className="text-center space-y-3 pt-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[var(--shadow-glow-rose)] mb-4 animate-float">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-600 to-amber-700">
          Hall of Fame
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm sm:text-lg max-w-xl mx-auto mb-6">
          The most glamorous beauties of our salon! Earn points by booking services and climb to the top.
        </p>
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-[var(--color-surface-2)] p-1 rounded-xl inline-flex shadow-sm border border-[var(--color-border)]">
            <button 
              onClick={() => setActiveTab("monthly")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "monthly" ? "bg-[var(--color-rose-500)] text-white shadow-md" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"}`}
            >
              This Month
            </button>
            <button 
              onClick={() => setActiveTab("lifetime")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "lifetime" ? "bg-amber-500 text-white shadow-md" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"}`}
            >
              Lifetime Glory
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-20 text-center text-[var(--color-text-muted)] text-xl animate-pulse">Summoning the Leaderboard...</div>
      ) : leaderboard.length === 0 ? (
        <div className="p-20 text-center text-[var(--color-text-muted)] text-xl">No entries on the leaderboard yet.</div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Main Content (Top 3 & List) */}
          <div className="flex-1 space-y-12">
            
            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
              {/* Rank 2 - Silver */}
              {top3[1] && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="order-2 md:order-1 relative bg-gradient-to-b from-gray-100 to-white dark:from-gray-800 dark:to-[var(--color-surface-card)] rounded-3xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center mt-0 md:mt-10 hover:shadow-xl hover:-translate-y-2 transition-all"
                >
                  <div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white dark:border-[var(--color-surface)]">
                    2
                  </div>
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 border-4 border-gray-300 flex items-center justify-center font-display text-2xl font-bold mt-4">
                    {getInitials(top3[1].firstName, top3[1].lastName)}
                  </div>
                  <h3 className="font-display text-xl font-bold mt-4">{top3[1].firstName} {top3[1].lastName}</h3>
                  <p className="text-sm text-gray-500 mb-4">{top3[1].membership} Member</p>
                  <div className="w-full pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="font-display text-2xl font-bold text-gray-600 dark:text-gray-300">{top3[1][pointsKey] || 0}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Points</p>
                  </div>
                </motion.div>
              )}

              {/* Rank 1 - Gold */}
              {top3[0] && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="order-1 md:order-2 relative bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/30 dark:to-[var(--color-surface-card)] rounded-3xl p-5 sm:p-8 border-2 border-yellow-400 flex flex-col items-center text-center shadow-[0_0_40px_-10px_rgba(250,204,21,0.5)] z-10 hover:shadow-[0_0_50px_-5px_rgba(250,204,21,0.6)] hover:-translate-y-2 transition-all"
                >
                  <div className="absolute -top-8 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 text-white flex items-center justify-center font-bold text-3xl shadow-lg border-4 border-white dark:border-[var(--color-surface)]">
                    <Crown className="w-8 h-8" />
                  </div>
                  <div className="w-32 h-32 rounded-full bg-yellow-100 dark:bg-yellow-900/50 border-4 border-yellow-400 flex items-center justify-center font-display text-4xl font-bold mt-6 text-yellow-600 dark:text-yellow-500">
                    {getInitials(top3[0].firstName, top3[0].lastName)}
                  </div>
                  <h3 className="font-display text-2xl font-bold mt-5 text-yellow-700 dark:text-yellow-500">{top3[0].firstName} {top3[0].lastName}</h3>
                  <p className="text-sm text-yellow-600/70 dark:text-yellow-500/70 mb-5">{top3[0].membership} Member</p>
                  <div className="w-full pt-5 border-t border-yellow-200 dark:border-yellow-700/50">
                    <p className="font-display text-4xl font-bold text-yellow-600 dark:text-yellow-500">{top3[0][pointsKey] || 0}</p>
                    <p className="text-sm text-yellow-600/70 dark:text-yellow-500/70 uppercase tracking-wider font-semibold">Points</p>
                  </div>
                </motion.div>
              )}

              {/* Rank 3 - Bronze */}
              {top3[2] && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="order-3 md:order-3 relative bg-gradient-to-b from-orange-50 to-white dark:from-amber-900/20 dark:to-[var(--color-surface-card)] rounded-3xl p-6 border border-amber-200 dark:border-amber-900/50 flex flex-col items-center text-center mt-0 md:mt-10 hover:shadow-xl hover:-translate-y-2 transition-all"
                >
                  <div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white dark:border-[var(--color-surface)]">
                    3
                  </div>
                  <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-amber-900/30 border-4 border-amber-600 flex items-center justify-center font-display text-2xl font-bold mt-4 text-amber-700">
                    {getInitials(top3[2].firstName, top3[2].lastName)}
                  </div>
                  <h3 className="font-display text-xl font-bold mt-4 text-amber-800 dark:text-amber-500">{top3[2].firstName} {top3[2].lastName}</h3>
                  <p className="text-sm text-amber-600/70 mb-4">{top3[2].membership} Member</p>
                  <div className="w-full pt-4 border-t border-amber-200 dark:border-amber-900/50">
                    <p className="font-display text-2xl font-bold text-amber-700 dark:text-amber-500">{top3[2][pointsKey] || 0}</p>
                    <p className="text-xs text-amber-600/70 uppercase tracking-wider">Points</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* List / Table for Rank 4+ */}
            {others.length > 0 && (
              <div className="bg-[var(--color-surface-card)] rounded-3xl border border-[var(--color-border)] overflow-x-auto">
                <div className="grid grid-cols-12 gap-4 p-4 sm:px-8 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  <div className="col-span-2 text-center">Rank</div>
                  <div className="col-span-6">Beauty</div>
                  <div className="col-span-4 text-right">Glow Points</div>
                </div>
                <div className="divide-y divide-[var(--color-border)]">
                  {others.map((customer, index) => {
                    const rank = index + 4;
                    const isMe = customer._id === user?._id;
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
                        key={customer._id}
                        className={`grid grid-cols-12 gap-4 p-4 sm:px-8 items-center transition-colors ${
                          isMe ? "bg-[var(--color-rose-500)]/10" : "hover:bg-[var(--color-surface-3)]"
                        }`}
                      >
                        <div className="col-span-2 flex justify-center">
                          <span className="font-display font-bold text-lg text-[var(--color-text-muted)]">#{rank}</span>
                        </div>
                        
                        <div className="col-span-6 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-center font-semibold text-sm text-[var(--color-text-primary)] hidden sm:flex">
                            {getInitials(customer.firstName, customer.lastName)}
                          </div>
                          <div>
                            <p className={`font-semibold text-base ${isMe ? "text-[var(--color-rose-500)]" : "text-[var(--color-text-primary)]"}`}>
                              {customer.firstName} {customer.lastName}
                              {isMe && <span className="ml-2 text-[10px] bg-[var(--color-rose-500)] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">You</span>}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">{customer.membership} Member</p>
                          </div>
                        </div>

                        <div className="col-span-4 text-right">
                          <p className="font-display font-bold text-lg text-[var(--color-text-primary)]">{customer[pointsKey] || 0}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Personal Overview */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <div className="sticky top-24 bg-[var(--color-surface-card)] rounded-3xl border border-[var(--color-border)] p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-rose-500)]/10 blur-3xl rounded-full" />
              
              <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-6 uppercase tracking-widest text-center border-b border-[var(--color-border)] pb-4">
                Your Status
              </h3>
              
              {user && (
                <div className="space-y-6 relative z-10">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--color-rose-400)] to-[var(--color-rose-600)] flex items-center justify-center font-display text-2xl font-bold text-white shadow-lg mb-3">
                      {getInitials(user.firstName, user.lastName)}
                    </div>
                    <p className="font-bold text-xl text-[var(--color-text-primary)]">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{user.membership} Member</p>
                  </div>

                  <div className="bg-[var(--color-surface-2)] rounded-2xl p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--color-text-muted)]">Current Rank</span>
                      <span className="font-display font-bold text-[var(--color-text-primary)]">
                        {leaderboard.findIndex(c => c._id === user._id) !== -1 
                          ? `#${leaderboard.findIndex(c => c._id === user._id) + 1}` 
                          : "Unranked"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--color-text-muted)]">{activeTab === "monthly" ? "Monthly" : "Total"} Points</span>
                      <span className="font-display font-bold text-gradient-rose">{user[pointsKey] || 0}</span>
                    </div>
                  </div>

                  {/* Goal Tracking */}
                  {(() => {
                    const myRankIndex = leaderboard.findIndex(c => c._id === user._id);
                    if (myRankIndex === 0) {
                      return (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 text-center">
                          <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-500">You are the Queen!</p>
                        </div>
                      );
                    } else if (myRankIndex > 0) {
                      const pointsDiff = (leaderboard[myRankIndex - 1][pointsKey] || 0) - (user[pointsKey] || 0);
                      return (
                        <div className="bg-[var(--color-surface-3)] rounded-2xl p-4">
                          <div className="flex items-center gap-2 text-[var(--color-text-primary)] mb-2">
                            <Target className="w-4 h-4 text-[var(--color-rose-500)]" />
                            <span className="text-sm font-semibold">Next Target</span>
                          </div>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            You need <strong className="text-[var(--color-rose-500)]">{pointsDiff}</strong> points to overtake <strong>{leaderboard[myRankIndex - 1].firstName}</strong>!
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
