import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Calendar, ArrowRight, Bell, Gift, Trophy, Crown, ChevronLeft, ChevronRight, Clock, ShoppingBag, Package } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "../../store/authStore";
import { appointmentService, notificationService, rewardService, authService, serviceService, inventoryService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { formatDate, formatCurrency, getMembershipColor } from "../../utils";
import { StatCard } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { APPOINTMENT_STATUSES } from "../../constants";

export default function CustomerDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: apptData } = useQuery({ queryKey: QUERY_KEYS.MY_APPOINTMENTS, queryFn: appointmentService.getMyAppointments });
  const { data: notifData } = useQuery({ queryKey: QUERY_KEYS.NOTIFICATIONS, queryFn: notificationService.getAll });
  const { data: rewardsData } = useQuery({ queryKey: QUERY_KEYS.REWARDS, queryFn: rewardService.getAll });
  const { data: leaderboardData } = useQuery({ queryKey: ["LEADERBOARD"], queryFn: authService.getLeaderboard });
  const { data: servicesData } = useQuery({ queryKey: QUERY_KEYS.SERVICES, queryFn: serviceService.getAll });
  const { data: productsData } = useQuery({ queryKey: QUERY_KEYS.PRODUCTS, queryFn: inventoryService.getProducts });

  const appointments = apptData?.data || [];
  const notifications = notifData?.data || [];
  const rewards = rewardsData?.data || [];
  const leaderboard = leaderboardData?.data?.lifetime || [];
  const services = servicesData?.data || [];
  const products = productsData?.data || [];

  const upcoming = appointments.find(a => a.status === "Confirmed" || a.status === "Pending");
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Calculate Points Away
  let pointsAwayText = "";
  if (leaderboard.length > 0 && user) {
    const myRankIndex = leaderboard.findIndex(c => c._id === user._id);
    if (myRankIndex === 0) {
      pointsAwayText = "You are the reigning Queen! 👑 Keep glowing!";
    } else if (myRankIndex > 0) {
      const pointsDiff = leaderboard[myRankIndex - 1].glowPoints - user.glowPoints;
      pointsAwayText = `You are only ${pointsDiff} Glow Points away from overtaking ${leaderboard[myRankIndex - 1].firstName}! Keep glowing, gorgeous! ✨`;
    } else {
      const lastOnBoard = leaderboard[leaderboard.length - 1];
      const pointsDiff = lastOnBoard.glowPoints > user.glowPoints ? lastOnBoard.glowPoints - user.glowPoints : 10;
      pointsAwayText = `You are ${pointsDiff} points away from entering the Leaderboard! Book a session to catch up!`;
    }
  }

  // ───── Services Slider Logic ─────
  const sliderRef = useRef(null);
  const [sliderIndex, setSliderIndex] = useState(0);
  const activeServices = services.filter(s => s.isActive);
  const maxIndex = Math.max(0, activeServices.length - 1);

  const scrollToIndex = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(idx, maxIndex));
    setSliderIndex(clamped);
    if (sliderRef.current) {
      const card = sliderRef.current.children[clamped];
      if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [maxIndex]);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    if (activeServices.length <= 1) return;
    const timer = setInterval(() => {
      setSliderIndex(prev => {
        const next = prev >= maxIndex ? 0 : prev + 1;
        if (sliderRef.current?.children[next]) {
          sliderRef.current.children[next].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [activeServices.length, maxIndex]);

  // Touch/drag swipe support
  const touchStart = useRef(null);
  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      scrollToIndex(diff > 0 ? sliderIndex + 1 : sliderIndex - 1);
    }
    touchStart.current = null;
  };

  // Service card gradient colors
  const serviceColors = [
    "from-rose-500/20 to-pink-500/10",
    "from-purple-500/20 to-indigo-500/10",
    "from-amber-500/20 to-yellow-500/10",
    "from-emerald-500/20 to-teal-500/10",
    "from-blue-500/20 to-cyan-500/10",
    "from-fuchsia-500/20 to-pink-500/10",
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              Hello, Queen {user?.firstName}! <Crown className="w-8 h-8 text-yellow-400" />
            </h1>
            <p className="text-[var(--color-text-muted)] mt-1">Welcome back to your royal beauty dashboard</p>
          </div>
          <Link to="/book" className="inline-flex items-center gap-2 px-6 py-3 -white font-medium rounded-xl transition-all hover:shadow-[var(--shadow-glow-rose)] hover:-translate-y-0.5">
            <Calendar className="w-4 h-4" /> Book Appointment
          </Link>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Sparkles} label="Glow Points" value={user?.glowPoints || 0} sub="Current Balance" color="rose" />
        <StatCard icon={Calendar} label="Total Appointments" value={appointments.length} sub="All time" color="blue" />
        <StatCard icon={Bell} label="Notifications" value={unreadCount} sub="Unread" color="purple" />
        <StatCard icon={Gift} label="Rewards Available" value={rewards.length} sub="Eligible to redeem" color="gold" />
      </div>

      {/* Membership Card */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="rounded-2xl overflow-hidden relative p-6 border border-[var(--color-border)]"
        style={{ background: `linear-gradient(135deg, var(--color-surface-card) 0%, rgba(${user?.membership === 'Gold' ? '251,191,36' : user?.membership === 'Platinum' ? '229,228,226' : user?.membership === 'Silver' ? '168,169,173' : '205,127,50'},0.08) 100%)` }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">Membership Status</p>
            <h2 className="font-display text-3xl font-bold mt-1" style={{ color: getMembershipColor(user?.membership) }}>
              {user?.membership} Member
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Lifetime Points: <span className="text-[var(--color-text-primary)] font-semibold">{user?.lifetimeGlowPoints || 0}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--color-text-muted)]">Current Glow Points</p>
            <p className="font-display text-5xl font-bold text-gradient-rose">{user?.glowPoints || 0}</p>
          </div>
        </div>
      </motion.div>

      {/* Points Away Widget */}
      {pointsAwayText && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-[var(--color-rose-500)]/5 border border-[var(--color-rose-500)]/30 p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-[var(--color-rose-500)]/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-[var(--color-rose-500)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)]">Glow Points Goal</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{pointsAwayText}</p>
          </div>
        </motion.div>
      )}

      {/* ═══════════════ Our Services Slider ═══════════════ */}
      {activeServices.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--color-rose-400)]" /> Our Services
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => scrollToIndex(sliderIndex - 1)} disabled={sliderIndex === 0}
                className="w-8 h-8 rounded-full bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-rose-500)]/30 transition-all disabled:opacity-30 disabled:pointer-events-none">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => scrollToIndex(sliderIndex + 1)} disabled={sliderIndex >= maxIndex}
                className="w-8 h-8 rounded-full bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-rose-500)]/30 transition-all disabled:opacity-30 disabled:pointer-events-none">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div ref={sliderRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {activeServices.map((svc, i) => (
              <motion.div key={svc._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`snap-center flex-shrink-0 w-[260px] sm:w-[280px] rounded-2xl bg-gradient-to-br ${serviceColors[i % serviceColors.length]} border border-[var(--color-border)] p-5 flex flex-col justify-between hover:border-[var(--color-rose-500)]/40 transition-all hover:-translate-y-1 hover:shadow-lg`}
              >
                {svc.image && (
                  <img src={svc.image} alt={svc.name} className="w-full h-32 object-cover rounded-xl mb-3" />
                )}
                <div className="flex-1">
                  <Badge variant="ghost" className="mb-2 text-[10px]">{svc.category}</Badge>
                  <h3 className="font-display font-bold text-[var(--color-text-primary)] text-base">{svc.name}</h3>
                  {svc.description && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">{svc.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {svc.duration} min</span>
                    <span className="font-bold text-[var(--color-rose-400)] text-sm">{formatCurrency(svc.price)}</span>
                  </div>
                </div>
                <Link to={`/book?service=${svc._id}`}
                  className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-[var(--color-rose-500)] hover:bg-[var(--color-rose-600)] text-white font-semibold rounded-xl text-xs transition-all hover:shadow-md"
                >
                  <Calendar className="w-3.5 h-3.5" /> Book Now
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Dot indicators */}
          {activeServices.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {activeServices.map((_, i) => (
                <button key={i} onClick={() => scrollToIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === sliderIndex ? "bg-[var(--color-rose-500)] w-5" : "bg-[var(--color-text-muted)]/30 hover:bg-[var(--color-text-muted)]/60"}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ═══════════════ Products We Offer ═══════════════ */}
      {products.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-purple-400" /> Products We Use
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((p, i) => (
              <motion.div key={p._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 hover:border-purple-500/30 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold text-sm text-[var(--color-text-primary)] line-clamp-1">{p.name}</h3>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{p.brand || "Salon Product"} · {p.category}{p.size ? ` · ${p.size}` : ""}</p>
                {p.description && <p className="text-[10px] text-[var(--color-text-secondary)] mt-1 line-clamp-2">{p.description}</p>}
                {p.keyIngredients?.length > 0 && <p className="text-[10px] text-[var(--color-text-muted)] mt-1 line-clamp-1">{p.keyIngredients.slice(0, 3).join(", ")}</p>}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${p.stockQuantity > p.lowStockThreshold ? "bg-emerald-400" : p.stockQuantity > 0 ? "bg-yellow-400" : "bg-red-400"}`} />
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {p.stockQuantity > p.lowStockThreshold ? "In Stock" : p.stockQuantity > 0 ? "Low Stock" : "Out of Stock"}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Upcoming Appointment */}
      {upcoming && (
        <div>
          <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)] mb-4">Upcoming Appointment</h2>
          <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {upcoming.services?.map((s) => (
                    <Badge key={s.serviceName} variant="ghost">{s.serviceName}</Badge>
                  ))}
                </div>
                <p className="text-[var(--color-text-muted)] text-sm">{formatDate(upcoming.appointmentDate)} at {upcoming.appointmentTime}</p>
                <p className="text-[var(--color-rose-400)] font-semibold mt-1">{formatCurrency(upcoming.totalAmount)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={upcoming.status === "Confirmed" ? "success" : "warning"}>{upcoming.status}</Badge>
                <Link to={`/appointments/${upcoming._id}`} className="text-sm text-[var(--color-rose-400)] hover:underline flex items-center gap-1">
                  View <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">Recent Notifications</h2>
            <Link to="/notifications" className="text-sm text-[var(--color-rose-400)] hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((n) => (
              <div key={n._id} className={`flex gap-3 p-4 rounded-xl border transition-all ${n.isRead ? "bg-[var(--color-surface-card)] border-[var(--color-border)]" : "bg-[var(--color-rose-500)]/5 border-[var(--color-rose-500)]/20"}`}>
                <Bell className="w-4 h-4 text-[var(--color-rose-400)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{n.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Appointments */}
      {appointments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">Recent Appointments</h2>
            <Link to="/appointments" className="text-sm text-[var(--color-rose-400)] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {appointments.slice(0, 3).map((a) => {
              const s = APPOINTMENT_STATUSES[a.status] || APPOINTMENT_STATUSES.Pending;
              return (
                <Link key={a._id} to={`/appointments/${a._id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-rose-500)]/30 transition-all"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{a.services?.map(s => s.serviceName).join(", ")}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{formatDate(a.appointmentDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[var(--color-rose-400)]">{formatCurrency(a.totalAmount)}</span>
                    <Badge variant={a.status === "Completed" ? "info" : a.status === "Confirmed" ? "success" : a.status === "Cancelled" ? "error" : "warning"}>
                      {a.status}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
