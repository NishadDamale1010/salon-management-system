import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, Calendar, Shield, Gift, ArrowRight, Heart, 
  MapPin, Clock, CheckCircle, Camera, Zap, Star, Phone, Mail
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useQuery } from "@tanstack/react-query";
import { serviceService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";

/* ─── Scroll reveal hook ─── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { 
        if (entry.isIntersecting) { 
          setVisible(true); 
          obs.disconnect(); 
        } 
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

export default function GayatriPremiumHome() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const bookLink = isAuthenticated
    ? (user?.role === "admin" ? "/admin" : "/customer")
    : "/register";

  const { data: servicesData } = useQuery({
    queryKey: QUERY_KEYS.SERVICES,
    queryFn: serviceService.getAll,
  });

  const [featuresRef, featuresVis] = useScrollReveal();
  const [servicesRef, servicesVis] = useScrollReveal();
  const [ctaRef, ctaVis] = useScrollReveal();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden max-w-md mx-auto md:max-w-4xl">
      
      {/* ════════════════════════════════════════════════════
          HERO SECTION - Full width, edge-to-edge
      ════════════════════════════════════════════════════ */}
      <section className="relative w-screen left-1/2 -translate-x-1/2 -mb-20 md:-mb-32">
        
        {/* Hero Background Image with Gradient Overlay */}
        <div className="relative h-[480px] md:h-[600px] overflow-hidden">
          
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src="/hero-girl.png" 
              alt="Gayatri Beauty Studio" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Premium Gradient Overlay - White → Blush → Rose → Transparent */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-rose-50 to-transparent opacity-85" />
          
          {/* Additional gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-white/40" />

          {/* Decorative gradient blob (subtle) */}
          <div className="absolute -bottom-32 -right-20 w-64 h-64 bg-gradient-radial from-rose-100 to-transparent opacity-40 blur-3xl" />
        </div>

        {/* Hero Content - Overlaid on image */}
        <div className={`absolute inset-0 flex flex-col justify-end pb-8 px-5 md:pb-12 md:px-12 transform transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          
          {/* Studio Badge */}
          <div className="inline-flex items-center gap-2 w-fit mb-4 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/60 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 animate-pulse" />
            <span className="text-xs font-semibold text-gray-900 tracking-wide">Gayatri Beauty Studio</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight leading-[1.1] mb-3 text-gray-900">
            Your Beauty.
            <br />
            Our <span className="bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent">Expertise</span>.
            <br />
            Timeless <span className="bg-gradient-to-r from-rose-400 to-rose-500 bg-clip-text text-transparent">You.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-700 text-sm md:text-base font-medium max-w-sm mb-6 leading-relaxed">
            Book premium salon services instantly. Earn Glow Points with every visit.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              to={bookLink}
              className="flex items-center justify-center gap-2 px-6 py-3 md:py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl hover:from-rose-600 hover:to-rose-700 active:scale-95 transition-all text-sm md:text-base"
            >
              Book Appointment
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link
              to="#gallery"
              className="flex items-center justify-center gap-2 px-6 py-3 md:py-3.5 bg-white/90 backdrop-blur-md text-gray-900 font-bold rounded-xl md:rounded-2xl border border-white/60 shadow-md hover:bg-white hover:border-white/80 transition-all text-sm md:text-base"
            >
              <Camera className="w-4 h-4" />
              View Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="px-5 md:px-12 space-y-12 pt-4 md:pt-8">

        {/* ════════════════════════════════════════════════════
            PREMIUM FEATURES - Glass cards with real actions
        ════════════════════════════════════════════════════ */}
        <section ref={featuresRef} className={`transition-all duration-700 ${
          featuresVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-black text-gray-900 mb-1">
              Everything You Need
            </h2>
            <p className="text-gray-600 text-sm font-medium">
              Premium salon experience at your fingertips
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: Calendar, label: "Easy Booking", desc: "Reserve instantly" },
              { icon: Sparkles, label: "Premium Services", desc: "Expert beauticians" },
              { icon: Gift, label: "Earn Rewards", desc: "Glow Points" },
              { icon: Shield, label: "Hygienic", desc: "Safety certified" },
              { icon: Heart, label: "Save Favorites", desc: "Quick access" },
              { icon: Zap, label: "Real-time Updates", desc: "Track appointments" },
            ].map((feat, i) => (
              <div
                key={i}
                className="group relative p-4 md:p-5 rounded-2xl bg-white border border-rose-100 hover:border-rose-200 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Glass overlay on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex flex-col items-start gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100">
                    <feat.icon className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm md:text-base text-gray-900">{feat.label}</p>
                    <p className="text-xs text-gray-500 font-medium">{feat.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            SERVICES SHOWCASE - Real services, no fake count
        ════════════════════════════════════════════════════ */}
        <section ref={servicesRef} className={`transition-all duration-700 ${
          servicesVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-black text-gray-900">
                Our Services
              </h2>
              <p className="text-gray-600 text-sm font-medium mt-1">
                Tailored for your needs
              </p>
            </div>
            <Link to="#services" className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1">
              View All
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Services Cards - Dynamically populated */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(servicesData?.data || []).slice(0, 4).map((service) => (
              <div
                key={service.id}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 hover:border-rose-200 p-5 md:p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Decorative gradient blob */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-rose-200/50 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  {/* Service Icon */}
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white mb-3 shadow-md group-hover:shadow-lg transition-shadow">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  
                  {/* Service Name */}
                  <h3 className="font-display font-bold text-lg md:text-xl text-gray-900 mb-1">
                    {service.name}
                  </h3>
                  
                  {/* Service Description */}
                  <p className="text-gray-600 text-sm font-medium line-clamp-2">
                    {service.description || "Premium salon service"}
                  </p>
                  
                  {/* CTA hint */}
                  <div className="mt-4 flex items-center gap-2 text-rose-600 font-semibold text-xs group-hover:translate-x-1 transition-transform">
                    Book Now
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            WHY CHOOSE US - Trust indicators without fake stats
        ════════════════════════════════════════════════════ */}
        <section className="py-4">
          <h2 className="font-display text-2xl md:text-3xl font-black text-gray-900 mb-6">
            Why Gayatri?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: Shield,
                title: "Safety First",
                desc: "Hygienic equipment & certified standards"
              },
              {
                icon: Star,
                title: "Expert Team",
                desc: "Trained & certified beauty professionals"
              },
              {
                icon: Zap,
                title: "Quick Service",
                desc: "Efficient bookings & timely appointments"
              },
              {
                icon: Gift,
                title: "Rewards Program",
                desc: "Earn points on every booking"
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-white to-rose-50/50 border border-rose-100 hover:border-rose-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex-shrink-0">
                    <item.icon className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            GLOW POINTS PREVIEW
        ════════════════════════════════════════════════════ */}
        <section className="py-4">
          <div className="relative rounded-3xl overflow-hidden">
            
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-rose-400 to-pink-400" />
            
            {/* Decorative blobs */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            
            {/* Content */}
            <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-display text-2xl md:text-3xl font-black text-white mb-2">
                  Glow Points
                </h3>
                <p className="text-white/90 text-sm md:text-base font-medium mb-4">
                  Earn points on every appointment and redeem exclusive benefits.
                </p>
                <Link
                  to={bookLink}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-rose-600 font-bold rounded-full hover:bg-rose-50 transition-colors text-sm"
                >
                  Start Earning
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              {/* Illustration */}
              <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
                  <Gift className="w-20 h-20 md:w-28 md:h-28 text-white drop-shadow-lg relative z-10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            CONTACT SECTION
        ════════════════════════════════════════════════════ */}
        <section ref={ctaRef} className={`py-4 transition-all duration-700 ${
          ctaVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          
          <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-10 text-white">
            
            <h2 className="font-display text-2xl md:text-3xl font-black mb-2">
              Questions?
            </h2>
            <p className="text-gray-300 text-sm mb-6 font-medium">
              Reach out to our team anytime
            </p>

            <div className="space-y-3 mb-6">
              <a
                href="tel:+919876543210"
                className="flex items-center gap-3 p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
              >
                <Phone className="w-5 h-5 flex-shrink-0 text-rose-400" />
                <span className="font-semibold text-sm">+91 XXXXX XXXXX</span>
              </a>
              
              <a
                href="mailto:hello@gayatri.com"
                className="flex items-center gap-3 p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
              >
                <Mail className="w-5 h-5 flex-shrink-0 text-rose-400" />
                <span className="font-semibold text-sm">hello@gayatristudio.com</span>
              </a>
              
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/10">
                <MapPin className="w-5 h-5 flex-shrink-0 text-rose-400" />
                <div>
                  <p className="font-semibold text-sm">Shivajinagar, Pune</p>
                  <p className="text-xs text-gray-300 mt-0.5">Open 10 AM - 8 PM</p>
                </div>
              </div>
            </div>

            <Link
              to={bookLink}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all"
            >
              Book Your Appointment
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            FOOTER CTA
        ════════════════════════════════════════════════════ */}
        <div className="py-8 text-center space-y-3">
          <p className="text-gray-500 text-xs font-medium">
            Made with ✨ by the Gayatri team
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="#" className="text-gray-400 hover:text-gray-600 text-xs font-semibold">Privacy</a>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <a href="#" className="text-gray-400 hover:text-gray-600 text-xs font-semibold">Terms</a>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <a href="#" className="text-gray-400 hover:text-gray-600 text-xs font-semibold">Contact</a>
          </div>
        </div>

      </div>
    </div>
  );
}
