import { Link, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Calendar, Star, Package,
  BarChart3, Trophy, Globe, Activity, Bell, Settings,
  Sparkles, ChevronLeft, ChevronRight, LogOut, Wrench,
  ShoppingCart, Menu, X, ShieldAlert, Eye, Plus, Grid
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
      { icon: Eye, label: "Visitors", to: "/admin/visitors" },
    ],
  },
  {
    label: "Operations",
    items: [
      { icon: Users, label: "Customers", to: "/admin/customers" },
      { icon: Calendar, label: "Appointments", to: "/admin/appointments" },
      { icon: ShoppingCart, label: "Orders", to: "/admin/orders" },
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
      { icon: ShieldAlert, label: "Feed Moderation", to: "/admin/moderation" },
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
    // Lock body scroll when mobile menu is open
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50 md:bg-[var(--color-surface)]">
      
      {/* 📱 MOBILE HEADER (Sticky) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white z-40 flex items-center justify-between px-4 max-w-md mx-auto shadow-sm">
        {/* Left: Hamburger */}
        <button 
          onClick={() => setMobileMenuOpen(true)} 
          className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Center: Logo */}
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <div className="w-6 h-6 rounded bg-rose-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-black text-rose-600 tracking-tight text-lg leading-none">
            Gayatri
          </span>
        </div>

        {/* Right: Notifications */}
        <Link to="/admin/notifications" className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 relative hover:bg-gray-50 transition-colors shadow-sm">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
            12
          </span>
        </Link>
      </div>

      {/* 📱 MOBILE SIDEBAR DRAWER (Slide in from left) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            
            {/* Sidebar Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-bold">
                     {getInitials(user?.firstName, user?.lastName)}
                   </div>
                   <div>
                     <p className="font-bold text-gray-900">{user?.firstName}</p>
                     <p className="text-xs text-rose-500">Administrator</p>
                   </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Scrollable Nav */}
              <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                {navGroups.map((group) => (
                  <div key={group.label} className="mb-4">
                    <p className="px-6 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
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
                              ? "bg-rose-50 text-rose-500 font-bold"
                              : "text-gray-600 font-medium hover:bg-gray-50"
                          )}
                        >
                          <item.icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-rose-500" : "text-gray-400")} />
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-white border border-red-100 text-red-500 font-bold hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 📱 MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-rose-100 z-40 px-6 flex items-center justify-between max-w-md mx-auto shadow-[0_-10px_40px_rgba(244,63,94,0.05)] rounded-t-3xl">
        <Link to="/admin" className="flex flex-col items-center gap-1">
          <LayoutDashboard className={cn("w-6 h-6", location.pathname === "/admin" ? "text-rose-500" : "text-gray-400")} />
          <span className={cn("text-[9px] font-bold", location.pathname === "/admin" ? "text-rose-500" : "text-gray-400")}>Dashboard</span>
        </Link>
        <Link to="/admin/appointments" className="flex flex-col items-center gap-1">
          <Calendar className={cn("w-6 h-6", location.pathname.includes("/admin/appointments") ? "text-rose-500" : "text-gray-400")} />
          <span className={cn("text-[9px] font-bold", location.pathname.includes("/admin/appointments") ? "text-rose-500" : "text-gray-400")}>Appointments</span>
        </Link>
        
        {/* Floating Center Action Button */}
        <div className="relative -top-5">
           <button 
             className="w-14 h-14 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/40 border-4 border-white active:scale-95 transition-transform"
             onClick={() => {/* Implement Quick Add Menu later */}}
           >
              <Plus className="w-6 h-6" />
           </button>
        </div>

        <Link to="/admin/customers" className="flex flex-col items-center gap-1">
          <Users className={cn("w-6 h-6", location.pathname.includes("/admin/customers") ? "text-rose-500" : "text-gray-400")} />
          <span className={cn("text-[9px] font-bold", location.pathname.includes("/admin/customers") ? "text-rose-500" : "text-gray-400")}>Customers</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(true)} className="flex flex-col items-center gap-1">
          <Grid className="w-6 h-6 text-gray-400" />
          <span className="text-[9px] font-bold text-gray-400">More</span>
        </button>
      </div>

      {/* 💻 DESKTOP SIDEBAR */}
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
        <nav className="flex-1 py-4 overflow-y-auto space-y-4 scrollbar-hide">
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
          "flex-1 transition-all duration-300 overflow-x-hidden w-full md:w-auto mt-16 md:mt-0 mb-20 md:mb-0 max-w-md mx-auto md:max-w-none bg-white md:bg-[var(--color-surface)] shadow-2xl md:shadow-none min-h-screen",
          collapsed ? "md:ml-[72px]" : "md:ml-[260px]"
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
