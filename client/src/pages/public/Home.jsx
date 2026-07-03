import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles, Calendar, Star, Gift,
  ArrowRight, Image, Video,
  Clock, ShieldCheck, CheckCircle, Scissors, Heart, MapPin, CreditCard, User, History, Trophy
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { serviceService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import ServicesSection from "../../components/home/ServicesSection";
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
  return (
    <div className="min-h-screen bg-white pb-20 relative overflow-x-hidden max-w-md mx-auto shadow-2xl md:max-w-6xl md:shadow-none">

      <main className="px-4 space-y-8 pt-2">

        {/* ════════════════════════════════════════════════════
            PREMIUM MOBILE HERO — FIRST SCREEN
        ════════════════════════════════════════════════════ */}
        <section className={`relative -mx-4 min-h-[92vh] overflow-hidden bg-[#fff7fa] home-hero-enter ${mounted ? "home-hero-visible" : ""}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(255,255,255,.95),transparent_28%),radial-gradient(circle_at_88%_30%,rgba(255,182,193,.42),transparent_24%),linear-gradient(180deg,#fff_0%,#fff7fa_36%,#fde7ef_100%)]" />
          <div className="absolute -left-16 top-24 h-44 w-44 rounded-full bg-rose-200/30 blur-3xl" />
          <div className="absolute -right-20 top-12 h-56 w-56 rounded-full bg-pink-300/25 blur-3xl" />
          <Sparkles className="absolute right-8 top-8 h-4 w-4 text-rose-300/70 animate-pulse" />
          <Sparkles className="absolute left-10 top-[52%] h-3 w-3 text-amber-300/80 animate-pulse" style={{ animationDelay: "0.8s" }} />

          <div className="absolute inset-x-0 top-0 h-[52vh] overflow-hidden">
            <img src="https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=1200&q=90" alt="Professional beauty model with premium salon makeup" className="h-full w-full object-cover object-[50%_18%] home-hero-portrait" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-rose-100/10 to-[#fff7fa]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fff7fa] via-[#fff7fa]/46 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#fff7fa] to-transparent" />
          </div>

          <HeroBadge className="left-4 top-[18vh]" delay={0.1}><div className="flex items-center gap-2"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><div><p className="text-[11px] font-black text-gray-950">4.9 Rating</p><p className="text-[9px] font-semibold text-gray-500">500+ happy clients</p></div></div></HeroBadge>
          <HeroBadge className="right-3 top-[28vh]" delay={0.7}><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-rose-500" /><div><p className="text-[11px] font-black text-gray-950">Hygienic & Safe</p><p className="text-[9px] font-semibold text-gray-500">Verified salon</p></div></div></HeroBadge>
          <HeroBadge className="left-7 top-[39vh]" delay={1.1}><div className="flex items-center gap-2"><Gift className="h-4 w-4 text-rose-500" /><div><p className="text-[11px] font-black text-gray-950">Glow Points</p><p className="text-[9px] font-semibold text-gray-500">Rewards every visit</p></div></div></HeroBadge>

          <div className="relative z-10 flex min-h-[92vh] flex-col justify-end px-5 pb-5 pt-[45vh]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-rose-600 shadow-[0_12px_32px_rgba(190,24,93,.10)] backdrop-blur-xl"><span className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,.8)]" />Gayatri Beauty Studio</div>
              <div><h1 className="font-display text-[3.45rem] font-black leading-[0.86] tracking-[-0.08em] text-gray-950">Your Beauty.<br /><span className="text-gradient-rose">Our Expertise.</span><br />Timeless You.</h1><p className="mt-4 max-w-[21rem] text-[13px] font-medium leading-5 text-gray-600">Book your favorite salon services in a few taps. Earn Glow Points, unlock rewards, and look beautiful.</p></div>
              <div className="grid grid-cols-[1fr_auto] gap-3"><Link to={bookLink} className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-5 text-sm font-black text-white shadow-[0_18px_42px_rgba(244,63,94,.34)] transition duration-300 active:scale-[.98]">Book Appointment <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></Link><Link to="/gallery" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/80 bg-white/70 px-4 text-xs font-black text-gray-900 shadow-[0_14px_36px_rgba(190,24,93,.10)] backdrop-blur-xl transition active:scale-[.98]"><Image className="h-4 w-4 text-rose-500" /> View Our Work</Link></div>
              <div className="grid grid-cols-3 gap-2">{[{value:"5+",label:"Years"},{value:"500+",label:"Clients"},{value:"Verified",label:"Salon"}].map((stat) => (<div key={stat.label} className="rounded-2xl border border-white/75 bg-white/60 p-3 text-center shadow-[0_12px_30px_rgba(190,24,93,.08)] backdrop-blur-xl"><p className="font-display text-lg font-black text-gray-950">{stat.value}</p><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-gray-500">{stat.label}</p></div>))}</div>
              <div className="grid grid-cols-5 gap-2">{[{ icon: Calendar, title: "Booking" }, { icon: Scissors, title: "Services" }, { icon: Gift, title: "Offers" }, { icon: Trophy, title: "Points" }, { icon: Image, title: "Gallery" }, { icon: Heart, title: "Favorites" }, { icon: MapPin, title: "Nearby" }, { icon: History, title: "History" }, { icon: CreditCard, title: "Pay" }, { icon: User, title: "Profile" }].map((feat) => (<div key={feat.title} className="rounded-2xl border border-white/75 bg-white/65 p-2.5 text-center shadow-[0_10px_28px_rgba(190,24,93,.07)] backdrop-blur-xl transition hover:-translate-y-0.5"><feat.icon className="mx-auto mb-1 h-4 w-4 text-rose-500" /><p className="text-[9px] font-black text-gray-800">{feat.title}</p></div>))}</div>
              <div className="grid grid-cols-3 gap-3">{[{ title: "Hair", img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=500&q=80" }, { title: "Skin", img: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&q=80" }, { title: "Bridal", img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80" }].map((service) => (<Link to="/services" key={service.title} className="group relative h-24 overflow-hidden rounded-3xl shadow-[0_16px_36px_rgba(190,24,93,.16)]"><img src={service.img} alt={`${service.title} service`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-gray-950/55 via-transparent to-transparent" /><p className="absolute bottom-3 left-3 font-display text-lg font-black text-white">{service.title}</p></Link>))}</div>
            </div>
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