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

  const triggerRoyalWelcome = (userObj) => {
    playLoginSound();
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#eab308', '#ec4899', '#ffffff'] // Rose, Gold, Pink
    });
    
    // Personalized welcome toast
    const name = userObj?.firstName || "Beautiful";
    toast.success(`Welcome back, ${name}! ✨`, {
      description: "Ready for your glow up?",
      duration: 5000,
    });
  };

  const onSubmit = (data) => {
    login(data, {
      onSuccess: (res) => {
        const loggedInUser = res?.data?.user || res?.data;
        triggerRoyalWelcome(loggedInUser);
        navigate(loggedInUser?.role === "admin" ? "/admin" : from, { replace: true });
      },
    });
  };

  const { mutate: googleLoginMutation } = useGoogleLogin();

  const handleGoogleSuccess = (credentialResponse) => {
    googleLoginMutation({ token: credentialResponse.credential }, {
      onSuccess: (res) => {
        const loggedInUser = res?.data?.user || res?.data;
        triggerRoyalWelcome(loggedInUser);
        navigate(loggedInUser?.role === "admin" ? "/admin" : from, { replace: true });
      }
    });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Dramatic Full-Screen Background */}
      <div className="absolute inset-0 z-0">
        <img src="/images/hero-1.jpg" alt="Salon Background" className="w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-[var(--color-rose-900)]/60" />
      </div>

      {/* Floating Sparkles & Orbs */}
      <motion.div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[var(--color-rose-600)]/20 blur-[100px] animate-float pointer-events-none z-0" />
      <motion.div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px] animate-float pointer-events-none z-0" style={{ animationDelay: "1.5s" }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[1000px] flex flex-col lg:flex-row items-center justify-center p-4 lg:p-0 gap-8"
      >
        {/* Left Side: Dramatic Text */}
        <div className="hidden lg:flex flex-col flex-1 px-8 text-center lg:text-left text-white">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--color-rose-500)] to-purple-600 mb-6 shadow-[0_0_40px_rgba(244,63,94,0.5)] border border-white/10">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-5xl xl:text-7xl font-black mb-4 leading-tight drop-shadow-2xl">
              Unleash Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-rose-400)] to-purple-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">Inner Glow.</span>
            </h1>
            <p className="text-gray-300 text-lg xl:text-xl font-medium max-w-md">
              Sign in to book your next premium beauty experience, earn points, and unlock exclusive rewards.
            </p>
          </motion.div>
        </div>

        {/* Right Side: Glass Form */}
        <div className="w-full max-w-md bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden group">
          {/* Subtle hover glow on card */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-rose-500)]/0 to-[var(--color-rose-500)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="mb-8 text-center">
              <h2 className="font-display text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400 text-sm">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@email.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--color-rose-400)] focus:bg-white/10 focus:ring-1 focus:ring-[var(--color-rose-400)]/50 transition-all shadow-inner"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400 mt-1.5 ml-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register("password")}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--color-rose-400)] focus:bg-white/10 focus:ring-1 focus:ring-[var(--color-rose-400)]/50 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1.5 ml-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-gradient-to-r from-[var(--color-rose-500)] to-[var(--color-rose-600)] hover:from-[var(--color-rose-400)] hover:to-[var(--color-rose-500)] text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.6)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 border border-white/10"
              >
                {isPending ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Sign In ✨"}
              </button>
              
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="flex justify-center [&>div]:w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google login failed")}
                  useOneTap
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  width="100%"
                />
              </div>

            </form>

            <p className="text-center text-sm text-gray-400 mt-8">
              Don't have an account?{" "}
              <Link to="/register" className="text-[var(--color-rose-400)] hover:text-white font-bold transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
