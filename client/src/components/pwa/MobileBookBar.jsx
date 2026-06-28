import { Link, useLocation } from "react-router-dom";
import { Calendar, Sparkles } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const HIDDEN_ON = ["/login", "/register"];

export default function MobileBookBar() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (HIDDEN_ON.includes(location.pathname)) return null;

  const bookTo = isAuthenticated
    ? user?.role === "admin"
      ? "/admin/appointments"
      : "/book"
    : "/register";

  const label = isAuthenticated ? "Book Now" : "Get Started";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
      <Link
        to={bookTo}
        className="pointer-events-auto flex items-center justify-center gap-2 w-full py-3.5 btn-primary rounded-2xl text-sm font-bold shadow-[0_8px_30px_rgba(255,20,147,0.35)]"
      >
        <Calendar className="w-4 h-4" />
        {label}
        <Sparkles className="w-4 h-4 opacity-80" />
      </Link>
    </div>
  );
}
