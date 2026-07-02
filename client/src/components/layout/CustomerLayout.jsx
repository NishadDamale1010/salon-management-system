import { Link, useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, Gift, Trophy, Bell, User,
  Sparkles, ShoppingBag, ChevronLeft, ChevronRight,
  LogOut, History, Share2, X
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn, getInitials, getMembershipColor } from "../../utils";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { SALON_NAME } from "../../constants";

import { useCartStore } from "../../store/cartStore";

const navItems = [
  { icon: LayoutDashboard, label: "Home", to: "/dashboard" },
  { icon: Calendar, label: "Book", to: "/book" },
  { icon: History, label: "My Appts", to: "/appointments" },
  { icon: ShoppingBag, label: "Shop", to: "/products" },
  { icon: Share2, label: "GlowFeed", to: "/feed" },
  { icon: Trophy, label: "Leaderboard", to: "/leaderboard" },
  { icon: User, label: "Profile", to: "/profile" },
];

export default function CustomerLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();
  const cartCount = useCartStore((s) => s.getItemCount());

  // Mount notification listener so toasts run globally
  useNotifications();

  useEffect(() => {
    // Optional permissions handle
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)] pb-16 md:pb-0">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop & Mobile Sidebar */}
      <motion.aside
        animate={{ 
          width: collapsed ? 72 : 260 
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed left-0 top-0 h-full z-50 flex-col bg-[var(--color-surface-2)] border-r border-[var(--color-border)] overflow-hidden transition-transform duration-300 ease-in-out md:translate-x-0 md:z-30",
          mobileMenuOpen ? "translate-x-0 flex w-[260px]" : "-translate-x-full hidden md:flex"
        )}
        style={{ width: mobileMenuOpen ? 260 : undefined }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--color-border)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-rose-400)] to-[var(--color-rose-600)] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <AnimatePresence>
              {(!collapsed || mobileMenuOpen) && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-display font-bold text-sm text-[var(--color-text-primary)] whitespace-nowrap overflow-hidden"
                >
                  {SALON_NAME}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          
          {/* Close button for mobile */}
          {mobileMenuOpen && (
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-1 text-gray-500 hover:text-gray-900 rounded-full bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                title={collapsed && !mobileMenuOpen ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 mx-2 mb-1 px-3 py-2.5 rounded-xl transition-all",
                  active
                    ? "bg-[var(--color-rose-500)]/10 text-[var(--color-rose-500)] border border-[var(--color-rose-300)]"
                    : "text-[var(--color-text-secondary)] hover:bg-black/5 hover:text-[var(--color-text-primary)]"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {(!collapsed || mobileMenuOpen) && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.to === "/products" && cartCount > 0 && (
                  <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-rose-500)] text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-[var(--color-border)] p-3 flex-shrink-0">
          <div className={cn("flex items-center gap-3 rounded-xl p-2", collapsed && !mobileMenuOpen && "justify-center")}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 bg-[var(--color-rose-500)]"
            >
              {getInitials(user?.firstName, user?.lastName)}
            </div>
            <AnimatePresence>
              {(!collapsed || mobileMenuOpen) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs truncate" style={{ color: getMembershipColor(user?.membership) }}>
                    {user?.membership} Member
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
            }}
            title={collapsed && !mobileMenuOpen ? "Logout" : undefined}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 mt-1 rounded-xl text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 transition-all text-sm",
              collapsed && !mobileMenuOpen && "justify-center"
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <AnimatePresence>
              {(!collapsed || mobileMenuOpen) && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors z-10 shadow-sm"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 overflow-x-hidden w-full md:w-auto",
          collapsed ? "md:ml-[72px]" : "md:ml-[260px]"
        )}
      >
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 bg-white z-40 flex items-center justify-between px-4 py-3 shadow-sm border-b border-[var(--color-border)]">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[var(--color-rose-500)] active:bg-rose-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-rose-400)] to-[var(--color-rose-600)] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="font-display font-bold text-lg text-[var(--color-rose-500)] leading-tight">{SALON_NAME}</span>
                    <span className="text-[8px] uppercase tracking-widest text-[var(--color-text-muted)]">Beauty Studio</span>
                 </div>
             </div>
          </div>

          <Link to="/notifications" className="relative w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 bg-white">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-rose-500)] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              3
            </span>
          </Link>
        </div>

        <div className="min-h-screen p-4 md:p-6 w-full pb-24 md:pb-6 bg-white md:bg-[var(--color-surface)]">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between px-6 pb-safe rounded-t-3xl">
        <Link to="/dashboard" className="flex flex-col items-center justify-center w-12 h-full gap-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill={location.pathname === "/dashboard" ? "var(--color-rose-500)" : "none"} stroke={location.pathname === "/dashboard" ? "var(--color-rose-500)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={location.pathname === "/dashboard" ? "text-[var(--color-rose-500)]" : "text-gray-400"}>
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span className={cn("text-[10px] font-medium", location.pathname === "/dashboard" ? "text-[var(--color-rose-500)]" : "text-gray-400")}>
            Home
          </span>
        </Link>
        
        <Link to="/appointments" className="flex flex-col items-center justify-center w-12 h-full gap-1">
          <Calendar className={cn("w-6 h-6", location.pathname === "/appointments" ? "text-[var(--color-rose-500)]" : "text-gray-400")} />
          <span className={cn("text-[10px] font-medium", location.pathname === "/appointments" ? "text-[var(--color-rose-500)]" : "text-gray-400")}>
            Bookings
          </span>
        </Link>

        {/* Floating Action Button */}
        <div className="relative -top-6">
          <Link to="/book" className="w-14 h-14 rounded-full bg-[var(--color-rose-500)] shadow-[0_8px_16px_rgba(244,63,94,0.4)] flex items-center justify-center text-white hover:scale-105 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </Link>
        </div>

        <Link to="/feed" className="flex flex-col items-center justify-center w-12 h-full gap-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={location.pathname === "/feed" ? "var(--color-rose-500)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={location.pathname === "/feed" ? "text-[var(--color-rose-500)]" : "text-gray-400"}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <span className={cn("text-[10px] font-medium", location.pathname === "/feed" ? "text-[var(--color-rose-500)]" : "text-gray-400")}>
            Activity
          </span>
        </Link>

        <Link to="/profile" className="flex flex-col items-center justify-center w-12 h-full gap-1">
          <User className={cn("w-6 h-6", location.pathname === "/profile" ? "text-[var(--color-rose-500)]" : "text-gray-400")} />
          <span className={cn("text-[10px] font-medium", location.pathname === "/profile" ? "text-[var(--color-rose-500)]" : "text-gray-400")}>
            Profile
          </span>
        </Link>
      </div>
    </div>
  );
}
