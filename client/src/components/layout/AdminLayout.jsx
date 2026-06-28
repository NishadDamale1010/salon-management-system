import { Link, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Calendar, Star, Package,
  BarChart3, Trophy, Globe, Activity, Bell, Settings,
  Sparkles, ChevronLeft, ChevronRight, LogOut, Wrench,
  ShoppingCart, Menu, X
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../../utils";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";
import { getInitials } from "../../utils";
import { SALON_NAME } from "../../constants";

import { useNotifications } from "../../hooks/useNotifications";

const navGroups = [  {
    label: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", to: "/admin" },
      { icon: BarChart3, label: "Analytics", to: "/admin/analytics" },
      { icon: Activity, label: "Activity Log", to: "/admin/activity" },
    ],
  },
  {
    label: "Operations",
    items: [
      { icon: Users, label: "Customers", to: "/admin/customers" },
      { icon: Calendar, label: "Appointments", to: "/admin/appointments" },
      { icon: Wrench, label: "Services", to: "/admin/services" },
    ],
  },
  {
    label: "Loyalty",
    items: [
      { icon: Star, label: "Rewards", to: "/admin/rewards" },
      { icon: Trophy, label: "Leaderboard", to: "/admin/leaderboard" },
    ],
  },
  {
    label: "Management",
    items: [
      { icon: Package, label: "Inventory", to: "/admin/inventory" },
      { icon: Globe, label: "CMS", to: "/admin/cms" },
      { icon: Bell, label: "Notifications", to: "/admin/notifications" },
      { icon: Settings, label: "Settings", to: "/admin/settings" },
    ],
  },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();

  // Mount notification listener so toasts and cache invalidations run globally
  useNotifications();

  useEffect(() => {
    // Optionally request permission or let user do it via UI
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[var(--color-border)] z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-rose-500)] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-[var(--color-text-primary)]">Admin Panel</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-[var(--color-text-primary)]">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-16 bg-white z-30 overflow-y-auto pb-10"
          >
            <nav className="py-4 space-y-6">
              {navGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-6 mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                    {group.label}
                  </p>
                  {group.items.map((item) => {
                    const active = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 mx-4 mb-1 px-4 py-3 rounded-xl transition-all",
                          active
                            ? "bg-[var(--color-rose-500)]/10 text-[var(--color-rose-500)] font-medium"
                            : "text-[var(--color-text-secondary)]"
                        )}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
              <div className="mx-4 mt-6">
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-red-50 text-red-500 font-medium"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-display font-bold text-sm text-[var(--color-text-primary)] whitespace-nowrap">Admin Panel</p>
                <p className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">{SALON_NAME}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Nav */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-5 mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]"
                  >
                    {group.label}
                  </motion.p>
                )}
              </AnimatePresence>
              {group.items.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 mx-2 mb-0.5 px-3 py-2.5 rounded-xl transition-all",
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
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-[var(--color-border)] p-3 flex-shrink-0">
          <div className={cn("flex items-center gap-3 rounded-xl p-2", collapsed && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-rose-400)] to-[var(--color-rose-600)] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {getInitials(user?.firstName, user?.lastName)}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-[var(--color-rose-400)] truncate">Administrator</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 mt-1 rounded-xl text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 transition-all text-sm",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Logout</motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors z-10 shadow-sm"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      <main
        className={cn(
          "flex-1 transition-all duration-300 overflow-x-hidden w-full md:w-auto mt-16 md:mt-0",
          collapsed ? "md:ml-[72px]" : "md:ml-[260px]"
        )}
      >
        <div className="min-h-screen p-4 md:p-6 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
