import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles, Calendar, Star, Trophy, ShieldCheck,
  Gift, ShoppingBag, Tag, Users, Activity, Crown,
  ArrowRight, Video, MessageCircle
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { SALON_WHATSAPP, SALON_INSTAGRAM } from "../../constants";
import { cmsService, serviceService, inventoryService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";

import ServicesSection from "../../components/home/ServicesSection";
import FeaturedProductsSection from "../../components/home/FeaturedProductsSection";
import AIConsultant from "../../components/ai/AIConsultant";

const QuickLink = ({ icon: Icon, label, subtext, to }) => (
  <Link to={to} className="flex flex-col items-center p-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] rounded-3xl transition-all min-w-[100px] text-center border border-[var(--color-border)] hover:border-[var(--color-rose-300)] hover:shadow-sm">
    <div className="w-12 h-12 bg-rose-50 text-[var(--color-rose-500)] rounded-full flex items-center justify-center mb-3">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-0.5">{label}</h3>
    <span className="text-[10px] text-[var(--color-text-muted)] leading-tight">{subtext}</span>
  </Link>
);

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const bookLink = isAuthenticated ? (user?.role === "admin" ? "/admin" : "/customer") : "/register";

  const { data: servicesData } = useQuery({ queryKey: QUERY_KEYS.SERVICES, queryFn: serviceService.getAll });
  const { data: inventoryData } = useQuery({ queryKey: QUERY_KEYS.INVENTORY, queryFn: inventoryService.getAll });
  const services = servicesData?.data || [];
  const products = inventoryData?.data || [];

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-24 relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-50/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 -z-10" />

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-12 space-y-12">
        
        {/* HERO SECTION */}
        <section className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1 space-y-6 z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
              Hello, Glow Getter! <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] text-[var(--color-text-primary)]">
              Look Beautiful.<br/>
              <span className="text-[var(--color-rose-500)]">Feel Confident.</span>
            </h1>
            <p className="text-[var(--color-text-muted)] text-lg md:text-xl max-w-md mx-auto md:mx-0">
              Your premium beauty destination. Book, earn rewards and shine every day.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
              <Link to={bookLink} className="w-full sm:w-auto px-8 py-3.5 bg-[var(--color-rose-500)] hover:bg-[var(--color-rose-600)] text-white font-semibold rounded-2xl shadow-lg shadow-rose-500/30 transition-all flex items-center justify-center gap-2">
                Book Appointment <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/services" className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-rose-50 text-[var(--color-rose-600)] border border-[var(--color-rose-200)] font-semibold rounded-2xl transition-all text-center">
                Explore Services
              </Link>
            </div>
            
            {/* Social Links Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-8 border-t border-[var(--color-border)] mt-8">
              <a href={SALON_INSTAGRAM} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-colors border border-rose-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-500 text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </div>
                <div className="font-semibold text-rose-900 text-sm">Follow us on Instagram</div>
              </a>
              <a href={`https://wa.me/${SALON_WHATSAPP}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition-colors border border-emerald-100">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center"><MessageCircle className="w-4 h-4"/></div>
                <div className="font-semibold text-emerald-900 text-sm">Chat on WhatsApp</div>
              </a>
            </div>
          </div>

          {/* Hero Image & Floating Card */}
          <div className="flex-1 relative w-full max-w-lg mx-auto mt-12 md:mt-0">
            <div className="relative rounded-[3rem] overflow-hidden border-[8px] border-white/50 shadow-2xl aspect-[4/5] z-10">
              <img src="https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?q=80&w=1000&auto=format&fit=crop" alt="Beautiful girl" className="w-full h-full object-cover" />
            </div>
            
            {/* Glow Status Floating Card */}
            <div className="absolute top-12 -right-8 md:-right-16 bg-white/80 backdrop-blur-md border border-white p-5 rounded-3xl shadow-xl z-20 w-64">
              <div className="text-xs font-semibold text-[var(--color-text-muted)] mb-3">Your Glow Status</div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-[var(--color-rose-500)]"><Crown className="w-5 h-5"/></div>
                <div>
                  <div className="font-bold text-sm text-[var(--color-text-primary)]">Glow Princess</div>
                  <div className="text-xs font-medium text-[var(--color-text-muted)]">Level 12</div>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1.5">
                <div className="bg-[var(--color-rose-500)] h-1.5 rounded-full" style={{ width: '72%' }}></div>
              </div>
              <div className="text-[10px] text-right text-[var(--color-text-muted)] mb-4">720 / 1000 XP</div>
              
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-rose-400"/>
                <div className="text-xs text-[var(--color-text-primary)]"><span className="text-[var(--color-text-muted)]">Next Reward</span><br/><span className="font-bold">50 Glow Points</span></div>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-400"/>
                <div className="text-xs text-[var(--color-text-primary)] font-medium">At Level 13</div>
              </div>
            </div>
            
            {/* Decorative Petals */}
            <div className="absolute top-0 right-10 w-6 h-6 bg-rose-300/40 rounded-full blur-sm z-20 mix-blend-multiply animate-pulse" />
            <div className="absolute bottom-20 -left-6 w-8 h-8 bg-pink-300/40 rounded-full blur-sm z-20 mix-blend-multiply animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </section>

        {/* QUICK LINKS */}
        <section className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          <QuickLink icon={Calendar} label="Book" subtext="Appointment" to={bookLink} />
          <QuickLink icon={Sparkles} label="Beauty Journey" subtext="Track Progress" to={isAuthenticated ? "/customer/journey" : "/register"} />
          <QuickLink icon={Video} label="GlowFeed" subtext="Community" to="/feed" />
          <QuickLink icon={Crown} label="Rewards" subtext="Earn & Redeem" to={isAuthenticated ? "/customer/rewards" : "/register"} />
          <QuickLink icon={ShoppingBag} label="Shop" subtext="Beauty Products" to="/shop" />
          <QuickLink icon={Tag} label="Offers" subtext="Best Deals" to="/offers" />
          <QuickLink icon={Gift} label="Gift Cards" subtext="For Loved Ones" to="/shop" />
          <QuickLink icon={Users} label="Refer & Earn" subtext="Invite Friends" to={isAuthenticated ? "/customer/rewards" : "/register"} />
        </section>

        {/* GLOWFEED BANNER */}
        <section className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-200/50 rounded-full blur-3xl" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 relative">
              <div className="w-full h-full bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner rotate-3">
                <Video className="w-10 h-10" />
              </div>
              <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-display font-bold text-[var(--color-text-primary)] mb-1">Join the GlowFeed!</h3>
              <p className="text-[var(--color-text-muted)] text-sm md:text-base">
                Discover the latest beauty trends, share your looks, and connect with our community.
              </p>
            </div>
          </div>
          <Link to="/feed" className="w-full md:w-auto px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-2xl shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap z-10">
            Explore Feed <Sparkles className="w-4 h-4" />
          </Link>
        </section>

        {/* SERVICES AND PRODUCTS */}
        <ServicesSection services={services} bookLink={bookLink} isAuthenticated={isAuthenticated} />
        <FeaturedProductsSection products={products} />

        {/* BOTTOM PROMO BANNERS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FFF4E6] border border-[#FFE8CC] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-center">
            <div className="relative z-10 w-2/3">
              <h3 className="text-[#D97706] font-display font-bold text-lg mb-1">Loyalty Rewards</h3>
              <p className="text-sm text-[#92400E] mb-3 leading-snug">Earn points on every booking & redeem exciting rewards!</p>
              <Link to={isAuthenticated ? "/customer/rewards" : "/register"} className="inline-block px-4 py-1.5 bg-white text-[#D97706] text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-shadow">Explore Rewards</Link>
            </div>
            <img src="https://cdn3d.iconscout.com/3d/premium/thumb/trophy-4994273-4161175.png" alt="Trophy" className="absolute -right-4 -bottom-4 w-32 h-32 object-contain opacity-90 drop-shadow-xl" />
          </div>

          <div className="bg-[#F3E8FF] border border-[#E9D5FF] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-center">
            <div className="relative z-10 w-2/3">
              <h3 className="text-[#7E22CE] font-display font-bold text-lg mb-1">Beauty Journal</h3>
              <p className="text-sm text-[#581C87] mb-3 leading-snug">Get expert tips, beauty guides and trend updates daily.</p>
              <Link to="/about" className="inline-block px-4 py-1.5 bg-white text-[#7E22CE] text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-shadow">Read Now</Link>
            </div>
            <img src="https://cdn3d.iconscout.com/3d/premium/thumb/makeup-kit-5402773-4521404.png" alt="Makeup" className="absolute -right-2 bottom-0 w-28 h-28 object-contain drop-shadow-xl" />
          </div>
        </section>
        
      </main>

      {/* FLOATING AI CHAT */}
      <AIConsultant />
    </div>
  );
}
