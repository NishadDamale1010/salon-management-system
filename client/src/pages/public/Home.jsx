import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles, Calendar, Star, Gift,
  ArrowRight, Video, Camera,
  Clock, ShieldCheck, CheckCircle, Smartphone
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { serviceService, inventoryService, cmsService } from "../../services";
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
  const { data: galleryData } = useQuery({ queryKey: QUERY_KEYS.GALLERY, queryFn: cmsService.getGallery });
  const { data: awardsData } = useQuery({ queryKey: QUERY_KEYS.AWARDS, queryFn: cmsService.getAwards });

  return (
    <div className="min-h-screen bg-white pb-20 relative overflow-x-hidden max-w-md mx-auto shadow-2xl md:max-w-6xl md:shadow-none">

      <main className="px-4 space-y-8 pt-2">

        {/* ════════════════════════════════════════════════════
            PREMIUM HERO EXACT MATCH
        ════════════════════════════════════════════════════ */}
        <section className={`relative w-[calc(100%+2rem)] -ml-4 -mt-2 min-h-[600px] sm:min-h-[700px] overflow-hidden home-hero-enter ${mounted ? "home-hero-visible" : ""}`}>

          {/* Background Image Setup */}
          <div className="absolute top-0 right-0 w-full sm:w-[85%] h-full z-0">
            <img
              src="/images/hero.png"
              alt="Model"
              className="w-full h-full object-cover object-top sm:object-right-top rounded-bl-[4rem] sm:rounded-bl-[6rem]"
            />
            {/* Gradient mask to blend into the white background on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent sm:via-white/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent opacity-80" />
          </div>

          {/* Hero Content Wrapper */}
          <div className="relative z-10 w-full h-full flex flex-col justify-center px-6 sm:px-12 pt-20 pb-24">

            <div className="max-w-[280px] sm:max-w-md">
              {/* Main Headline */}
              <h1 className="font-display text-[2.75rem] sm:text-6xl leading-[1.05] font-black text-gray-900 mb-6 tracking-tight">
                Your Beauty.<br />
                Our Expertise.<br />
                <span className="text-rose-500">Timeless You.</span>
                {/* Decorative Line */}
                <div className="w-24 sm:w-32 h-[3px] bg-rose-200 mt-4 rounded-full relative">
                  <div className="w-2 h-2 bg-rose-500 rounded-full absolute -top-[2px] left-1/2 -translate-x-1/2 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
                </div>
              </h1>

              {/* Subtitle */}
              <p className="text-gray-700 text-xs sm:text-sm font-medium mb-8 leading-relaxed pr-4">
                Book your favorite salon services in just a few taps. Earn Glow Points & unlock perks.
              </p>

              {/* CTAs */}
              <div className="flex items-center gap-4 sm:gap-6 mb-12">
                <Link to={bookLink} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-500 text-white font-bold rounded-full shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:bg-rose-600 hover:shadow-[0_8px_24px_rgba(244,63,94,0.4)] transition-all text-xs sm:text-sm">
                  Book Appointment <ArrowRight className="w-4 h-4" />
                </Link>

                <Link to="/gallery" className="flex flex-col items-center gap-1.5 group">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.06)] text-rose-500 group-hover:scale-105 transition-transform">
                    <div className="w-3 h-3 border-y-8 border-y-transparent border-l-[12px] border-l-rose-500 ml-1" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-800">Gallery</span>
                </Link>
              </div>

            </div>

            {/* Right Side Badges (Absolute positioned to float over the image) */}
            <div className="absolute right-4 top-24 sm:top-32 flex flex-col gap-4 sm:gap-6 items-end">
              {/* Badge 1 */}



              {/* Badge 2 */}
              
            </div>
          </div>
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
            GALLERY SCROLLER
        ════════════════════════════════════════════════════ */}
        <section className="py-4 mt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-black text-gray-900">Our Gallery</h2>
            <Link to="/gallery" className="text-[11px] font-bold text-rose-500 flex items-center hover:text-rose-600 transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide">
            {galleryData?.data?.slice(0, 8).map((img, i) => (
              <Link key={i} to="/gallery" className="snap-center w-40 h-40 shrink-0 rounded-[1.5rem] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-gray-100 group relative block">
                <img src={img.image} alt={img.title || "Gallery"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
            {!galleryData?.data?.length && [1, 2, 3, 4].map(i => (
              <div key={i} className="snap-center w-40 h-40 shrink-0 rounded-[1.5rem] bg-gray-50 animate-pulse border border-gray-100" />
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            AWARDS SCROLLER
        ════════════════════════════════════════════════════ */}
        <section className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-black text-gray-900">Awards & Recognition</h2>
            <Link to="/awards" className="text-[11px] font-bold text-rose-500 flex items-center hover:text-rose-600 transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide">
            {awardsData?.data?.slice(0, 5).map((award, i) => (
              <Link key={i} to="/awards" className="snap-center w-64 shrink-0 rounded-3xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-gray-100 bg-white group block">
                <div className="w-full h-40 bg-gray-100 overflow-hidden relative">
                  <img src={award.image} alt={award.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm text-rose-500"><Star className="w-4 h-4 fill-rose-500" /></div>
                </div>
                <div className="p-4 bg-white">
                  <h3 className="font-bold text-gray-900 text-sm truncate mb-1">{award.title}</h3>
                  <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{award.description}</p>
                </div>
              </Link>
            ))}
            {!awardsData?.data?.length && [1, 2, 3].map(i => (
              <div key={i} className="snap-center w-64 h-56 shrink-0 rounded-3xl bg-gray-50 animate-pulse border border-gray-100" />
            ))}
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
            CHAMPION BOARD
        ════════════════════════════════════════════════════ */}
        <section className="py-4">
          <LandingChampionBoard />
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