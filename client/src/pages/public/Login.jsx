import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { useState } from "react";
import confetti from "canvas-confetti";
import { useLogin, useGoogleLogin } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import { SALON_NAME } from "../../constants";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [showPass, setShowPass] = useState(false);
  const { mutate: login, isPending } = useLogin();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ? (location.state.from.pathname + (location.state.from.search || "")) : (user?.role === "admin" ? "/admin" : "/dashboard");

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const playLoginSound = () => {
    const audio = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=success-1-6297.mp3");
    audio.play().catch(e => console.log("Audio play failed:", e));
  };

  const triggerRoyalWelcome = () => {
    playLoginSound();
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#eab308', '#ec4899', '#ffffff'] // Rose, Gold, Pink
    });
  };

  const onSubmit = (data) => {
    login(data, {
      onSuccess: (res) => {
        triggerRoyalWelcome();
        navigate(res?.data?.user?.role === "admin" || res?.data?.role === "admin" ? "/admin" : from, { replace: true });
      },
    });
  };

  const { mutate: googleLoginMutation } = useGoogleLogin();

  const handleGoogleSuccess = (credentialResponse) => {
    googleLoginMutation({ token: credentialResponse.credential }, {
      onSuccess: (res) => {
        triggerRoyalWelcome();
        navigate(res?.data?.user?.role === "admin" || res?.data?.role === "admin" ? "/admin" : from, { replace: true });
      }
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left – decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[var(--color-surface-2)] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-rose-900)]/40 to-purple-900/20" />
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[var(--color-rose-600)]/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-purple-600/10 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="relative z-10 text-center px-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--color-rose-500)] to-[var(--color-rose-700)] flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-glow-rose)]">
            <Sparkles className="w-10 h-10 text-[var(--color-text-primary)]" />
          </div>
          <h1 className="font-display text-4xl font-bold text-[var(--color-text-primary)] mb-3">{SALON_NAME}</h1>
          <p className="text-[var(--color-text-muted)] text-lg">Your beauty, our passion</p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { val: "1000+", label: "Happy Clients" },
              { val: "10+", label: "Years Experience" },
              { val: "50+", label: "Services" },
              { val: "100%", label: "Satisfaction" },
            ].map(({ val, label }) => (
              <div key={label} className="glass rounded-2xl p-4 text-center">
                <p className="font-display text-2xl font-bold text-gradient-rose">{val}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right – form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--color-surface)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-rose-500)] to-[var(--color-rose-700)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[var(--color-text-primary)]" />
              </div>
              <span className="font-display font-bold text-[var(--color-text-primary)]">{SALON_NAME}</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-[var(--color-text-primary)]">Welcome back</h2>
            <p className="text-[var(--color-text-muted)] mt-2">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] focus:ring-1 focus:ring-[var(--color-rose-500)]/30 transition-all"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] focus:ring-1 focus:ring-[var(--color-rose-500)]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 -white font-semibold rounded-xl transition-all hover:shadow-[var(--shadow-glow-rose)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <span className="w-5 h-5 border-2 border-[var(--color-rose-500)]/30 border-t-white rounded-full animate-spin" />
              ) : "Sign In"}
            </button>
            <p className="text-center text-sm text-[var(--color-text-muted)] my-4">OR</p>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google login failed")}
                useOneTap
                theme="outline"
                shape="pill"
              />
            </div>

          </form>

          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-[var(--color-rose-400)] hover:text-[var(--color-rose-300)] font-medium transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
