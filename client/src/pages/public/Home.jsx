import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles, Calendar, Star, Gift,
  ArrowRight, Video,
  Clock, ShieldCheck, CheckCircle, Smartphone
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { serviceService, inventoryService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import ServicesSection from "../../components/home/ServicesSection";
import FeaturedProductsSection from "../../components/home/FeaturedProductsSection";
import AIConsultant from "../../components/ai/AIConsultant";
import LandingChampionBoard from "../../components/home/LandingChampionBoard";

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

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  /* mount flag drives hero entrance animation */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const [feedRef, feedVis] = useScrollReveal();
  const [testimRef, testimVis] = useScrollReveal();

  const bookLink = isAuthenticated
    ? (user?.role === "admin" ? "/admin" : "/customer")
    : "/register";

  const { data: servicesData } = useQuery({ queryKey: QUERY_KEYS.SERVICES, queryFn: serviceService.getAll });
  const { data: inventoryData } = useQuery({ queryKey: QUERY_KEYS.INVENTORY, queryFn: inventoryService.getProducts });

  return (
    <div className="min-h-screen bg-white pb-20 relative overflow-x-hidden max-w-md mx-auto shadow-2xl md:max-w-6xl md:shadow-none">

      <main className="px-4 space-y-8 pt-2">

        {/* ════════════════════════════════════════════════════
            HERO
        ════════════════════════════════════════════════════ */}
        <section
          className={`flex flex-row items-center gap-3 md:gap-8 
                      home-hero-enter ${mounted ? "home-hero-visible" : ""}`}
        >

          {/* ── Hero text ── */}
          <div className="flex-1 space-y-3 text-left order-1 py-4">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[8px] sm:text-[10px] font-bold shadow-sm">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Gayatri Beauty Studio
            </div>

            <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-black text-gray-900 tracking-tight leading-[1.1]">
              Your Beauty. <br/>
              Our Expertise. <br/>
              <span className="text-rose-500">Timeless You.</span>
            </h1>

            <p className="text-gray-600 text-[9px] sm:text-xs md:text-base max-w-[160px] sm:max-w-lg font-medium leading-tight">
              Book your favorite salon services in just a few taps. Earn Glow Points & unlock perks.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
              <Link
                to={bookLink}
                className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5
                           bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg sm:rounded-xl
                           shadow-md active:scale-95 transition-transform text-[9px] sm:text-xs"
              >
                Book Appointment
              </Link>
            </div>
          </div>

          {/* ── Hero image ── */}
          <div className="flex-1 relative w-full max-w-[150px] sm:max-w-[220px] md:max-w-lg mx-auto order-2 mt-2 md:mt-0">
            {/* Background Pink Circle Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] aspect-square rounded-full bg-gradient-to-tr from-pink-100 to-rose-50 blur-xl" aria-hidden />

            {/* image frame */}
            <div className="relative z-10 flex justify-center">
              <img src="/hero-girl.png" alt="Gayatri Beauty Studio" className="w-[140px] sm:w-[220px] h-auto drop-shadow-xl mix-blend-multiply" style={{ objectFit: 'contain' }} />
            </div>

            {/* rating badge */}
            <HeroBadge className="-left-4 top-1/4 scale-[0.6] origin-left" delay={0}>
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-1 text-sm font-black text-gray-900">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  4.9/5
                </div>
                <div className="text-[9px] font-bold text-amber-500">2.8k+ Reviews</div>
              </div>
            </HeroBadge>

            {/* Hygienic badge */}
            <HeroBadge className="-right-6 top-4 scale-[0.6] origin-right" delay={1.2}>
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                    <ShieldCheck className="w-4 h-4" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-900">Hygienic & Safe</span>
                    <span className="text-[8px] text-gray-500">Your safety is our priority</span>
                 </div>
               </div>
            </HeroBadge>

            {/* New Here badge */}
            <HeroBadge className="-right-4 bottom-4 scale-[0.6] origin-right" delay={0.5}>
               <div className="flex items-center gap-2">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white">
                    <Gift className="w-5 h-5" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-900">New Here?</span>
                    <span className="text-[8px] text-gray-500 max-w-[100px] leading-tight">Create an account and get 50 Glow Points!</span>
                 </div>
               </div>
            </HeroBadge>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            CHAMPION BOARD
        ════════════════════════════════════════════════════ */}
        <section className="pt-6">
           <LandingChampionBoard />
        </section>

        {/* ════════════════════════════════════════════════════
            SERVICES
        ════════════════════════════════════════════════════ */}
        <div id="services">
          <ServicesSection
            services={servicesData?.data || []}
            bookLink={bookLink}
            isAuthenticated={isAuthenticated}
          />
        </div>

        {/* ════════════════════════════════════════════════════
            GLOWFEED BANNER (Replaces Refer & Earn)
        ════════════════════════════════════════════════════ */}
        <section
          ref={feedRef}
          className={`home-reveal ${feedVis ? "home-reveal-visible" : ""}`}
        >
          <div className="relative rounded-3xl bg-gradient-to-r from-pink-50 to-rose-100 p-6 flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-sm border border-rose-100">
             <div className="relative z-10 flex-1 text-center md:text-left space-y-2 mb-6 md:mb-0">
               <h3 className="text-xl font-display font-black text-rose-600">Join the GlowFeed!</h3>
               <p className="text-xs text-gray-600 max-w-[200px] mx-auto md:mx-0 leading-relaxed font-medium">
                 Discover trends, share your looks, and connect with our beauty community.
               </p>
               <Link
                 to="/feed"
                 className="inline-flex items-center justify-center gap-2 px-5 py-2.5 mt-2
                            bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-full
                            shadow-md active:scale-95 transition-transform"
               >
                 Explore GlowFeed <ArrowRight className="w-3.5 h-3.5" />
               </Link>
             </div>
             
             {/* Illustration Side */}
             <div className="relative z-10 w-40 h-32 flex-shrink-0">
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-24 h-24 bg-rose-200/50 rounded-full animate-pulse" />
                   <Video className="w-16 h-16 text-rose-500 absolute drop-shadow-xl" />
                   <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 absolute -top-2 right-2 animate-bounce" />
                   <Sparkles className="w-5 h-5 text-purple-400 absolute bottom-0 left-2 animate-bounce" style={{ animationDelay: '0.5s' }} />
                </div>
             </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            FEATURES GRID
        ════════════════════════════════════════════════════ */}
        <section className="py-4">
           <div className="grid grid-cols-3 gap-y-6 gap-x-2">
             {[
               { icon: Calendar, title: "Easy & Fast\nBooking", color: "text-rose-500" },
               { icon: Sparkles, title: "Verified\nBeauticians", color: "text-rose-500" },
               { icon: Gift, title: "Premium\nProducts", color: "text-rose-500" },
               { icon: ShieldCheck, title: "Hygienic\nEnvironment", color: "text-rose-500" },
               { icon: Clock, title: "24/7 Customer\nSupport", color: "text-rose-500" },
               { icon: CheckCircle, title: "Secure\nPayments", color: "text-rose-500" },
             ].map((feat, i) => (
               <div key={i} className="flex flex-col items-center text-center gap-2">
                  <feat.icon className={`w-6 h-6 ${feat.color}`} />
                  <span className="text-[10px] font-bold text-gray-800 whitespace-pre-line leading-snug">{feat.title}</span>
               </div>
             ))}
           </div>
        </section>

        {/* ════════════════════════════════════════════════════
            TESTIMONIALS
        ════════════════════════════════════════════════════ */}
        <section ref={testimRef} className={`home-reveal ${testimVis ? "home-reveal-visible" : ""} py-4`}>
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold text-gray-900">What Our Clients Say</h2>
              <span className="text-[10px] font-bold text-rose-500 flex items-center">View All Reviews <ArrowRight className="w-3 h-3 ml-0.5" /></span>
           </div>
           
           <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide">
              {[
                { name: "Priya Sharma", text: "Absolutely love the services! The staff is so professional and the results are always amazing.", stars: 5 },
                { name: "Sneha Patil", text: "The best salon experience I've ever had. Highly recommend Gayatri Beauty Studio!", stars: 5 },
                { name: "Anjali Deshmukh", text: "Great ambiance, excellent service and super friendly staff. Will definitely come again!", stars: 5 }
              ].map((rev, i) => (
                <div key={i} className="snap-center w-64 shrink-0 bg-white border border-rose-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                   <div>
                     <div className="text-rose-400 font-serif text-3xl leading-none h-4">"</div>
                     <p className="text-xs text-gray-600 font-medium leading-relaxed mt-2">{rev.text}</p>
                   </div>
                   <div className="mt-4 flex items-center gap-3">
                     <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${rev.name}`} alt={rev.name} className="w-full h-full" />
                     </div>
                     <div>
                       <div className="text-[11px] font-bold text-gray-900">{rev.name}</div>
                       <div className="flex gap-0.5">
                         {[...Array(rev.stars)].map((_, j) => <Star key={j} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
                       </div>
                     </div>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* ════════════════════════════════════════════════════
            CTA FOOTER
        ════════════════════════════════════════════════════ */}
        <section className="mt-6 mb-8 relative rounded-3xl overflow-hidden bg-rose-50 p-6 flex flex-col items-center text-center shadow-inner">
           {/* Decorative corner flowers/blobs */}
           <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-200/50 rounded-full blur-xl" />
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-200/50 rounded-full blur-xl" />
           
           <h2 className="text-2xl font-display font-black text-gray-900 mb-2 relative z-10">Ready to Glow?</h2>
           <p className="text-xs text-gray-600 max-w-[250px] mb-6 font-medium relative z-10">
             Book your appointment now and experience the magic of beauty & care at Gayatri Beauty Studio.
           </p>
           
           <Link
             to={bookLink}
             className="relative z-10 px-6 py-3 bg-rose-500 text-white font-bold rounded-full shadow-lg hover:bg-rose-600 transition-colors flex items-center gap-2 text-sm"
           >
             Book Appointment Now <ArrowRight className="w-4 h-4" />
           </Link>
           <p className="text-[9px] text-gray-400 font-semibold mt-3 relative z-10 flex items-center gap-1"><Clock className="w-3 h-3 text-rose-400" /> Takes Less Than 30 Seconds!</p>
        </section>

      </main>

      {/* Floating AI chat */}
      <AIConsultant />
    </div>
  );
}