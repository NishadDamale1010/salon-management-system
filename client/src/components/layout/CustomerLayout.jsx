import { Link, useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, Gift, Trophy, Bell, User,
  Sparkles, ShoppingBag, ChevronLeft, ChevronRight,
  LogOut, History,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn, getInitials, getMembershipColor } from "../../utils";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { SALON_NAME } from "../../constants";

const navItems = [
  { icon: LayoutDashboard, label: "Home", to: "/dashboard" },
  { icon: Calendar, label: "Book", to: "/book" },
  { icon: ShoppingBag, label: "My Appts", to: "/appointments" },
  { icon: Sparkles, label: "Products", to: "/products" },
  { icon: Gift, label: "Rewards", to: "/rewards" },
  { icon: Trophy, label: "Leaderboard", to: "/leaderboard" },
  { icon: User, label: "Profile", to: "/profile" },
];

export default function CustomerLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();

  // Mount notification listener so toasts run globally
  useNotifications();

  useEffect(() => {
    // Optional permissions handle
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)] pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="hidden md:flex fixed left-0 top-0 h-full z-30 flex-col bg-[var(--color-surface-2)] border-r border-[var(--color-border)] overflow-hidden"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--color-border)] flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-rose-400)] to-[var(--color-rose-600)] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
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

        {/* Desktop Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 mx-2 mb-1 px-3 py-2.5 rounded-xl transition-all",
                  active
                    ? "bg-[var(--color-rose-500)]/10 text-[var(--color-rose-500)] border border-[var(--color-rose-300)]"
                    : "text-[var(--color-text-secondary)] hover:bg-black/5 hover:text-[var(--color-text-primary)]"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-[var(--color-border)] p-3 flex-shrink-0">
          <div className={cn("flex items-center gap-3 rounded-xl p-2", collapsed && "justify-center")}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 bg-[var(--color-rose-500)]"
            >
              {getInitials(user?.firstName, user?.lastName)}
            </div>
            <AnimatePresence>
              {!collapsed && (
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
            onClick={() => logout()}
            title={collapsed ? "Logout" : undefined}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 mt-1 rounded-xl text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 transition-all text-sm",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
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
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors z-10 shadow-sm"
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
        <div className="min-h-screen p-4 md:p-6 w-full">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[var(--color-border)] z-50 flex items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center w-full h-full space-y-1"
            >
              <item.icon
                className={cn("w-6 h-6", active ? "text-[var(--color-rose-500)]" : "text-[var(--color-text-muted)]")}
              />
              <span className={cn("text-[10px] font-medium", active ? "text-[var(--color-rose-500)]" : "text-[var(--color-text-muted)]")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
