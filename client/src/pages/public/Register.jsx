import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, User, Mail, Lock, Phone } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useRegister, useGoogleLogin } from "../../hooks/useAuth";
import { toast } from "sonner";
import { SALON_NAME } from "../../constants";

const schema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Invalid phone number"),
  password: z.string().min(6, "At least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Register() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const { mutate: register, isPending } = useRegister();
  const navigate = useNavigate();

  const { register: reg, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (data) => {
    register(data, { onSuccess: () => navigate("/login") });
  };

  const { mutate: googleLoginMutation } = useGoogleLogin();

  const handleGoogleSuccess = (credentialResponse) => {
    googleLoginMutation({ token: credentialResponse.credential }, {
      onSuccess: (res) => {
        navigate(res?.data?.user?.role === "admin" || res?.data?.role === "admin" ? "/admin" : "/dashboard", { replace: true });
      }
    });
  };

  const fields = [
    { name: "firstName", label: "First Name", icon: User, placeholder: "Nishad", type: "text", col: 1 },
    { name: "lastName", label: "Last Name", icon: User, placeholder: "Damale", type: "text", col: 1 },
    { name: "email", label: "Email", icon: Mail, placeholder: "you@email.com", type: "email", col: 2 },
    { name: "phone", label: "Phone", icon: Phone, placeholder: "+91 98765 43210", type: "tel", col: 2 },
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Dramatic Full-Screen Background */}
      <div className="absolute inset-0 z-0">
        <img src="/images/hero-1.jpg" alt="Salon Background" className="w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-purple-900/60" />
      </div>

      {/* Floating Sparkles & Orbs */}
      <motion.div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-[var(--color-rose-600)]/20 blur-[100px] animate-float pointer-events-none z-0" />
      <motion.div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px] animate-float pointer-events-none z-0" style={{ animationDelay: "2s" }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[1200px] flex flex-col lg:flex-row items-center justify-center p-4 lg:p-0 gap-8 lg:gap-16"
      >
        {/* Left Side: Dramatic Text */}
        <div className="hidden lg:flex flex-col flex-1 px-8 text-white">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--color-rose-500)] to-purple-600 mb-6 shadow-[0_0_40px_rgba(244,63,94,0.5)] border border-white/10">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-5xl xl:text-7xl font-black mb-6 leading-tight drop-shadow-2xl">
              Join the <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-rose-400)] to-purple-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">Glow Club.</span>
            </h1>
            
            <div className="mt-8 space-y-4">
              {[
                { icon: "✨", text: "Earn 1 Glow Point per ₹100" },
                { icon: "🎁", text: "Redeem points for free services" },
                { icon: "🏆", text: "Compete on the Leaderboard" },
                { icon: "📅", text: "Easy appointment booking" },
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + (idx * 0.1) }}
                  className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3.5 shadow-lg w-max"
                >
                  <span className="text-2xl drop-shadow-md">{item.icon}</span>
                  <span className="text-gray-200 font-medium tracking-wide">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side: Glass Form */}
        <div className="w-full max-w-lg bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden group">
          {/* Subtle hover glow on card */}
          <div className="absolute inset-0 bg-gradient-to-bl from-[var(--color-rose-500)]/0 to-[var(--color-rose-500)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="mb-8 text-center">
              <h2 className="font-display text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-gray-400 text-sm">Start your beauty journey today</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {fields.filter(f => f.col === 1).map(({ name, label, icon: Icon, placeholder, type }) => (
                  <div key={name}>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input {...reg(name)} type={type} placeholder={placeholder}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--color-rose-400)] focus:bg-white/10 focus:ring-1 focus:ring-[var(--color-rose-400)]/50 transition-all text-sm shadow-inner"
                      />
                    </div>
                    {errors[name] && <p className="text-xs text-red-400 mt-1.5 ml-1">{errors[name].message}</p>}
                  </div>
                ))}
              </div>

              {fields.filter(f => f.col === 2).map(({ name, label, icon: Icon, placeholder, type }) => (
                <div key={name}>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input {...reg(name)} type={type} placeholder={placeholder}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--color-rose-400)] focus:bg-white/10 focus:ring-1 focus:ring-[var(--color-rose-400)]/50 transition-all shadow-inner"
                    />
                  </div>
                  {errors[name] && <p className="text-xs text-red-400 mt-1.5 ml-1">{errors[name].message}</p>}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input {...reg("password")} type={showPass ? "text" : "password"} placeholder="Min 6 chars"
                      className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--color-rose-400)] focus:bg-white/10 focus:ring-1 focus:ring-[var(--color-rose-400)]/50 transition-all text-sm shadow-inner"
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1">
                      {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400 mt-1.5 ml-1">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input {...reg("confirmPassword")} type={showConfirmPass ? "text" : "password"} placeholder="Confirm"
                      className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--color-rose-400)] focus:bg-white/10 focus:ring-1 focus:ring-[var(--color-rose-400)]/50 transition-all text-sm shadow-inner"
                    />
                    <button type="button" onClick={() => setShowConfirmPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1">
                      {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-400 mt-1.5 ml-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <button type="submit" disabled={isPending}
                className="w-full py-4 bg-gradient-to-r from-[var(--color-rose-500)] to-[var(--color-rose-600)] hover:from-[var(--color-rose-400)] hover:to-[var(--color-rose-500)] text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.6)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 border border-white/10"
              >
                {isPending ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Account ✨"}
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="flex justify-center [&>div]:w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google registration failed")}
                  useOneTap
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  text="signup_with"
                  width="100%"
                />
              </div>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-[var(--color-rose-400)] hover:text-white font-bold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
