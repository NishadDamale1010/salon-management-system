import { Link, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "../../utils";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";
import { SALON_NAME } from "../../constants";
import Footer from "./Footer";
import MobileBookBar from "../pwa/MobileBookBar";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/products", label: "Products" },
  { to: "/gallery", label: "Gallery" },
  { to: "/offers", label: "Offers" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "glass-dark shadow-sm" : "bg-white/80 backdrop-blur-lg md:bg-white/60 border-b border-transparent md:border-[var(--color-border)]/40"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-rose-500)] to-[var(--color-rose-700)] flex items-center justify-center group-hover:shadow-[var(--shadow-glow-rose)] transition-all">
              <Sparkles className="w-4 h-4 text-[var(--color-text-primary)]" />
            </div>
            <span className="font-display font-bold text-[var(--color-text-primary)] text-sm hidden sm:block">{SALON_NAME}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {publicLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  location.pathname === link.to
                    ? "text-[var(--color-rose-400)] bg-[var(--color-rose-500)]/10"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-rose-500)]/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={user?.role === "admin" ? "/admin" : "/dashboard"}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 btn-primary text-sm font-medium rounded-xl transition-all hover:shadow-[var(--shadow-glow-rose)]"
                >
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-rose-500)]/5 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass border-t border-white/5"
            >
              <div className="px-4 py-4 space-y-1">
                {publicLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-rose-500)]/5 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2 border-t border-white/5 flex gap-2">
                  {isAuthenticated ? (
                    <Link to={user?.role === "admin" ? "/admin" : "/dashboard"}
                      className="flex-1 text-center py-2.5 btn-primary text-sm font-medium rounded-xl"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link to="/login" className="flex-1 text-center py-2.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium rounded-xl">Login</Link>
                      <Link to="/register" className="flex-1 text-center py-2.5 btn-primary text-sm font-medium rounded-xl">Book Now</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page Content */}
      <main className="flex-1 pt-16 pb-20 md:pb-0">
        <Outlet />
      </main>

      <Footer />
      <MobileBookBar />
    </div>
  );
}
