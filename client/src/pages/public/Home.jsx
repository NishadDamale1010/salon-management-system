import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles, Calendar, Star, Gift,
  ShoppingBag, Tag, Users, Crown, Award,
  ArrowRight, Video, MessageCircle, Heart, ChevronRight,
  Clock, ShieldCheck, CheckCircle2, Wallet, Scissors, CalendarCheck2, CheckCircle, Smartphone
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { SALON_WHATSAPP, SALON_INSTAGRAM } from "../../constants";
import { serviceService, inventoryService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import ServicesSection from "../../components/home/ServicesSection";
import FeaturedProductsSection from "../../components/home/FeaturedProductsSection";
import AIConsultant from "../../components/ai/AIConsultant";

/* ─── Custom hook: fire once when element enters viewport ─── */
function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─── Floating badge that sits on the hero image ─── */
const HeroBadge = ({ children, className = "", delay = 0 }) => (
  <div
    className={`absolute z-20 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 px-3 py-2 animate-float ${className}`}
    style={{ animationDelay: `${delay}s` }}
  >
    {children}
  </div>
);

/* ─── Quick-link card ─── */
const QuickLink = ({ icon: Icon, label, subtext, to, bg, fg }) => (
  <Link
    to={to}
    className="flex flex-col items-center p-3 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] active:scale-95 transition-transform snap-start min-w-[80px] shrink-0 select-none"
  >
    <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-2`}>
      <Icon className={`w-5 h-5 ${fg}`} />
    </div>
    <span className="text-[11px] font-bold text-[var(--color-text-primary)] leading-tight text-center">{label}</span>
    <span className="text-[9px] text-[var(--color-text-muted)] leading-tight text-center mt-0.5">{subtext}</span>
  </Link>
);

/* ─── Animated marquee strip ─── */
const MARQUEE_ITEMS = [
  "✨ 5-Star Rated Salon",
  "💄 Happy Clients",
  "🌸 Premium Beauty",
  "⭐ Book Today",
  "💅 Expert Stylists",
  "🎁 Loyalty Rewards",
];
const MarqueeStrip = () => {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden bg-[var(--color-rose-500)] py-2 -mx-4">
      <div className="home-marquee flex gap-10 w-max">
        {doubled.map((item, i) => (
          <span key={i} className="text-white text-xs font-semibold shrink-0">{item}</span>
        ))}
      </div>
    </div>
  );
};

/* ─── Section header with optional "See all" link ─── */
const SectionHeader = ({ title, accent, to, linkText = "See all" }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-display font-bold text-[var(--color-text-primary)]">
      {title} <span className="text-[var(--color-rose-500)]">{accent}</span>
    </h2>
    {to && (
      <Link to={to} className="text-xs font-semibold text-[var(--color-rose-500)] flex items-center gap-0.5 active:opacity-70">
        {linkText} <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    )}
  </div>
);

/* ══════════════════════════════════════════════════════════════ */
export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  /* mount flag drives hero entrance animation */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  /* scroll-reveal refs for each section below the hero */
  const [quickRef, quickVis] = useScrollReveal();
  const [feedRef, feedVis] = useScrollReveal();
  const [promoRef, promoVis] = useScrollReveal();

  const bookLink = isAuthenticated
    ? (user?.role === "admin" ? "/admin" : "/customer")
    : "/register";

  const { data: servicesData } = useQuery({ queryKey: QUERY_KEYS.SERVICES, queryFn: serviceService.getAll });
  const { data: inventoryData } = useQuery({ queryKey: QUERY_KEYS.INVENTORY, queryFn: inventoryService.getAll });

  const quickLinks = [
    { icon: Calendar, label: "Book", subtext: "Appointment", to: bookLink, bg: "bg-rose-50", fg: "text-[var(--color-rose-500)]" },
    { icon: Sparkles, label: "Journey", subtext: "Progress", to: isAuthenticated ? "/customer/journey" : "/register", bg: "bg-purple-50", fg: "text-purple-500" },
    { icon: Video, label: "GlowFeed", subtext: "Community", to: "/feed", bg: "bg-pink-50", fg: "text-pink-500" },
    { icon: Crown, label: "Rewards", subtext: "Earn & Redeem", to: isAuthenticated ? "/customer/rewards" : "/register", bg: "bg-amber-50", fg: "text-amber-500" },
    { icon: ShoppingBag, label: "Shop", subtext: "Products", to: "/shop", bg: "bg-sky-50", fg: "text-sky-500" },
    { icon: Award, label: "Awards", subtext: "Trophies", to: "/awards", bg: "bg-emerald-50", fg: "text-emerald-500" },
    { icon: Gift, label: "Gift", subtext: "Cards", to: "/shop", bg: "bg-rose-50", fg: "text-[var(--color-rose-500)]" },
    { icon: Users, label: "Refer", subtext: "Invite Friends", to: isAuthenticated ? "/customer/rewards" : "/register", bg: "bg-violet-50", fg: "text-violet-500" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-28 relative overflow-x-hidden">

      {/* ── ambient background blobs ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="home-blob-1" />
        <div className="home-blob-2" />
      </div>

      <main className="max-w-6xl mx-auto px-4 space-y-8 pt-4">

        {/* ════════════════════════════════════════════════════
            HERO
            mobile:  image on top  →  text below  (flex-col-reverse)
            desktop: text on left  ←  image right (md:flex-row)
        ════════════════════════════════════════════════════ */}
        <section
          className={`flex flex-col-reverse md:flex-row items-center gap-8 md:gap-16
                      home-hero-enter ${mounted ? "home-hero-visible" : ""}`}
        >

          {/* ── Hero text (Optimized for CRO) ── */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Official Gayatri Beauty Studio App
            </div>

            <h1 className="text-[2.5rem] leading-[1.1] md:text-[3.5rem] lg:text-[4.2rem] font-display font-black text-gray-900 tracking-tight">
              Book Your Salon Appointment in <br className="hidden md:block" />
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600">
                30 Seconds.
                <span className="absolute -bottom-1.5 left-0 h-[4px] w-full bg-gradient-to-r from-rose-400 via-pink-400 to-transparent rounded-full opacity-70" />
              </span>
            </h1>

            <p className="text-gray-600 text-[15px] md:text-lg max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
              Skip the calls. Book instantly, earn loyalty rewards, and manage your beauty schedule with zero wait time.
            </p>

            {/* Benefit Microcopy */}
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-gray-700 font-semibold mb-2">
              <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Free Registration</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> No Card Required</div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start w-full max-w-md mx-auto md:mx-0">
              <Link
                to={isAuthenticated ? "/book" : "/register"}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4
                           bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold rounded-2xl
                           shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_12px_25px_rgba(244,63,94,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all text-base"
              >
                Reserve My Appointment <ArrowRight className="w-5 h-5" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="flex-1 flex items-center justify-center px-6 py-4
                             bg-white text-rose-600 border-2 border-rose-100 hover:bg-rose-50 hover:border-rose-200
                             font-bold rounded-2xl active:scale-95 transition-all text-base"
                >
                  Create Free Account
                </Link>
              )}
            </div>

            {/* Trust Signals */}
            <div className="flex items-center justify-center md:justify-start gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">100% Secure Data</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">5-Star Rated</span>
              </div>
            </div>
          </div>

          {/* ── Hero image (appears FIRST on mobile via flex-col-reverse) ── */}
          <div className="flex-1 relative w-full max-w-[320px] md:max-w-lg mx-auto">
            {/* soft glow halo behind the image */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-rose-200/70 to-pink-200/50 blur-3xl scale-110" aria-hidden />

            {/* image frame */}
            <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white/80 shadow-2xl aspect-[3/4] z-10">
              <img src="/hero-girl.png" alt="Gayatri Beauty Studio" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>

            {/* Promo Bubble */}
            <div className="absolute -right-4 md:-right-8 top-6 z-30 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="relative bg-gradient-to-r from-rose-500 to-purple-600 rounded-2xl shadow-[0_8px_20px_rgba(244,63,94,0.4)] px-4 py-2.5 border-2 border-white/20 backdrop-blur-md">
                {/* Ping animation behind */}
                <div className="absolute inset-0 rounded-2xl border-2 border-rose-400 animate-ping opacity-20" />
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs md:text-sm font-black text-white whitespace-nowrap drop-shadow-sm">Free Registration 🎉</span>
                </div>
              </div>
            </div>

            {/* rating badge */}
            <HeroBadge className="-left-3 top-1/4" delay={0}>
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <div>
                  <div className="text-xs font-bold text-[var(--color-text-primary)]">4.9 / 5</div>
                  <div className="text-[9px] text-[var(--color-text-muted)]">Rating</div>
                </div>
              </div>
            </HeroBadge>

            {/* clients badge */}
            <HeroBadge className="-right-3 bottom-1/3" delay={1.2}>
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <div>
                  <div className="text-xs font-bold text-[var(--color-text-primary)]">😊</div>
                  <div className="text-[9px] text-[var(--color-text-muted)]">Happy Clients</div>
                </div>
              </div>
            </HeroBadge>

            {/* bottom social-proof pill */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-lg border border-rose-100">
                <div className="flex -space-x-1.5">
                  {["from-rose-300 to-pink-400", "from-purple-300 to-indigo-400", "from-amber-300 to-orange-400"].map((g, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full bg-gradient-to-br ${g} border-[1.5px] border-white`} />
                  ))}
                </div>
                <span className="text-[10px] font-semibold text-[var(--color-text-primary)]">Loved by all</span>
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
              </div>
            </div>

            {/* floating sparkles */}
            <Sparkles className="absolute top-3 right-6 z-20 w-5 h-5 text-yellow-400 drop-shadow animate-float" style={{ animationDelay: "0.4s" }} aria-hidden />
            <Sparkles className="absolute top-16 -left-1 z-20 w-3.5 h-3.5 text-rose-400 drop-shadow animate-float" style={{ animationDelay: "1.7s" }} aria-hidden />
          </div>
        </section>

        {/* ── marquee ── */}
        <MarqueeStrip />

        {/* ════════════════════════════════════════════════════
            QUICK LINKS
        ════════════════════════════════════════════════════ */}
        <section
          ref={quickRef}
          className={`home-reveal ${quickVis ? "home-reveal-visible" : ""}`}
        >
          <SectionHeader title="Quick" accent="Access" />
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1 -mx-1 px-1">
            {quickLinks.map((link) => (
              <QuickLink key={link.label} {...link} />
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            WHY USE OUR APP (CRO Benefit Cards)
        ════════════════════════════════════════════════════ */}
        <section className="py-6 home-reveal home-reveal-visible">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-black text-gray-900 mb-3">Why Book on the App?</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto font-medium">Skip the wait and unlock premium benefits.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Clock, title: "Book 24/7", desc: "Schedule your visit anytime, even at midnight.", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: Smartphone, title: "Zero Wait Time", desc: "Skip the lobby. Instant confirmation.", color: "text-rose-500", bg: "bg-rose-50" },
              { icon: Scissors, title: "Choose Stylist", desc: "Pick your preferred expert.", color: "text-purple-500", bg: "bg-purple-50" },
              { icon: Wallet, title: "Digital Wallet", desc: "Earn loyalty points on every visit.", color: "text-amber-500", bg: "bg-amber-50" },
              { icon: CalendarCheck2, title: "1-Tap Reschedule", desc: "Change plans with zero hassle.", color: "text-emerald-500", bg: "bg-emerald-50" },
              { icon: Star, title: "App-Only Offers", desc: "Unlock exclusive VIP discounts.", color: "text-pink-500", bg: "bg-pink-50" },
            ].map((benefit, i) => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow group">
                <div className={`w-12 h-12 rounded-2xl ${benefit.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{benefit.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            HOW IT WORKS (4-Step Timeline)
        ════════════════════════════════════════════════════ */}
        <section className="py-8 bg-gradient-to-b from-transparent via-rose-50/50 to-transparent rounded-[3rem] px-4 md:px-8 home-reveal home-reveal-visible mb-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-black text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto font-medium">Your beauty journey in 4 simple steps.</p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6 relative">
            {/* Vertical Line */}
            <div className="absolute top-4 bottom-4 left-[27px] w-1 bg-gradient-to-b from-rose-200 to-purple-200 rounded-full" />
            
            {[
              { num: 1, title: "Create Free Account", desc: "Takes 15 seconds. No credit card required.", icon: Smartphone },
              { num: 2, title: "Choose Service & Stylist", desc: "Browse our premium catalog and select your favorite expert.", icon: Scissors },
              { num: 3, title: "Pick Your Perfect Time", desc: "View real-time availability and lock in your slot instantly.", icon: CalendarCheck2 },
              { num: 4, title: "Visit & Earn Rewards", desc: "Enjoy your service and accumulate loyalty points automatically!", icon: Gift },
            ].map((step, idx) => (
              <div key={idx} className="relative pl-16 flex items-start gap-4">
                {/* Number Orb */}
                <div className="absolute left-0 top-0 w-14 h-14 bg-white rounded-2xl border-2 border-rose-100 shadow-md flex items-center justify-center text-rose-500 font-black text-xl z-10">
                  {step.num}
                </div>
                
                <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <step.icon className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
             <Link to={isAuthenticated ? "/book" : "/register"} className="px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:-translate-y-1 transition-transform flex items-center gap-2">
               Start Your Journey <ArrowRight className="w-5 h-5" />
             </Link>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            GLOWFEED BANNER
        ════════════════════════════════════════════════════ */}
        <section
          ref={feedRef}
          className={`home-reveal ${feedVis ? "home-reveal-visible" : ""}`}
        >
          <div className="home-glowfeed-card relative rounded-3xl p-5 flex flex-col md:flex-row items-center gap-4 overflow-hidden">
            {/* background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50" aria-hidden />
            <div className="absolute top-0 right-0 w-44 h-44 bg-pink-200/30 rounded-full blur-3xl" aria-hidden />

            <div className="relative z-10 flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-200 rotate-3 shadow-inner">
                  <Video className="w-7 h-7" />
                </div>
                {/* yellow sparkle dot */}
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-[var(--color-text-primary)] mb-0.5">Join the GlowFeed!</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Discover trends & share your looks</p>
              </div>
            </div>

            <Link
              to="/feed"
              className="relative z-10 w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3
                         bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold rounded-2xl
                         shadow-lg shadow-purple-500/25 active:scale-95 transition-transform"
            >
              Explore <Sparkles className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            SERVICES & PRODUCTS  (these sections have their own reveal)
        ════════════════════════════════════════════════════ */}
        <ServicesSection
          services={servicesData?.data || []}
          bookLink={bookLink}
          isAuthenticated={isAuthenticated}
        />
        <FeaturedProductsSection products={inventoryData?.data || []} />

        {/* ════════════════════════════════════════════════════
            PROMO BANNERS
        ════════════════════════════════════════════════════ */}
        <section
          ref={promoRef}
          className={`grid grid-cols-2 gap-3 home-reveal ${promoVis ? "home-reveal-visible" : ""}`}
        >
          {/* Loyalty */}
          <div className="bg-[#FFF4E6] border border-[#FFE8CC] rounded-2xl p-4 relative overflow-hidden min-h-[130px]">
            <h3 className="text-[#D97706] font-display font-bold text-sm mb-1">Loyalty Rewards</h3>
            <p className="text-[9px] text-[#92400E] mb-3 leading-snug">Earn points on every booking!</p>
            <Link
              to={isAuthenticated ? "/customer/rewards" : "/register"}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-[#D97706] text-[10px] font-bold rounded-xl shadow-sm active:scale-95 transition-transform"
            >
              Explore <ArrowRight className="w-2.5 h-2.5" />
            </Link>
            
          </div>

          {/* Beauty Journal */}
          <div className="bg-[#F3E8FF] border border-[#E9D5FF] rounded-2xl p-4 relative overflow-hidden min-h-[130px]">
            <h3 className="text-[#7E22CE] font-display font-bold text-sm mb-1">Beauty Journal</h3>
            <p className="text-[9px] text-[#581C87] mb-3 leading-snug">Expert tips & beauty guides</p>
            <Link
              to="/about"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-[#7E22CE] text-[10px] font-bold rounded-xl shadow-sm active:scale-95 transition-transform"
            >
              Read Now <ArrowRight className="w-2.5 h-2.5" />
            </Link>
            
          </div>
        </section>

      </main>

      {/* Floating AI chat */}
      <AIConsultant />
    </div>
  );
}