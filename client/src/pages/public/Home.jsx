import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles, ArrowRight, MessageCircle, Star, CheckCircle,
  ChevronDown, Clock, Award, Users, Shield, Plus, Minus, Camera, Package, ShoppingBag, Music
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cmsService, serviceService, inventoryService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { SALON_NAME, SALON_TAGLINE, SALON_WHATSAPP, SALON_INSTAGRAM } from "../../constants";
import { formatCurrency } from "../../utils";
import AIConsultant from "../../components/ai/AIConsultant";
import SocialProofPopup from "../../components/ui/SocialProofPopup";

// ==================== NUMBER COUNTER ====================
function CountUp({ end, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let startTimestamp = null;
    const target = parseInt(end.replace(/[^0-9]/g, ''));
    if (isNaN(target)) { setCount(end); return; }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    window.requestAnimationFrame(step);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ==================== HERO ====================
function HeroSection({ settings }) {
  const hero = settings?.hero || {};
  const [currentBg, setCurrentBg] = useState(0);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 400]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  
  // Magical background images
  const backgrounds = [
    "/images/hero-1.jpg",
    "/images/hero-2.jpg",
    "/images/hero-3.jpg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [backgrounds.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white perspective-[1000px]">
      
      {/* Full-Screen Background Slider with Parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ y: y1 }}>
        <AnimatePresence>
          <motion.img
            key={currentBg}
            src={backgrounds[currentBg]}
            alt="Hero Background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover object-top sm:object-center"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </AnimatePresence>
        
        {/* Softened Overlays to make images clearly visible while keeping it bright */}
        <div className="absolute inset-0 bg-white/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7)_0%,transparent_60%)]" />
      </motion.div>

      {/* Floating Sparkles & Orbs (Reduced blur & opacity for clarity) */}
      <motion.div style={{ y: y2 }} className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[var(--color-rose-300)]/15 rounded-full blur-[100px] animate-float pointer-events-none z-0" />
      <motion.div style={{ y: y2 }} className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-300/15 rounded-full blur-[90px] animate-float pointer-events-none z-0" style={{ animationDelay: "2s" }} />

      {/* Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20 flex flex-col items-center"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/80 border border-[var(--color-rose-200)] text-[var(--color-rose-600)] text-sm font-bold tracking-widest uppercase mb-10 backdrop-blur-md shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-[var(--color-rose-500)]" />
          Award-Winning Beauty Studio
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1.2, ease: "easeOut" }}
          className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-[var(--color-text-primary)] mb-6 leading-[1.1] tracking-tight drop-shadow-[0_4px_12px_rgba(255,255,255,0.8)]"
        >
          {hero.title ? (
            <span dangerouslySetInnerHTML={{ __html: hero.title }} className="text-[var(--color-text-primary)]" />
          ) : (
            <>
              Beauty That{" "}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-rose-500)] to-[var(--color-rose-400)] drop-shadow-[0_0_20px_rgba(255,105,180,0.2)]">
                Glows
                <motion.span 
                  animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-6 -right-10 text-[var(--color-rose-400)] opacity-60"
                >
                  <Sparkles className="w-10 h-10" />
                </motion.span>
              </span>
              <br />From Within
            </>
          )}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
          className="text-[var(--color-text-secondary)] text-lg sm:text-2xl mb-14 max-w-3xl mx-auto drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] font-semibold tracking-wide leading-relaxed"
        >
          {hero.subtitle ? (
            <span dangerouslySetInnerHTML={{ __html: hero.subtitle }} />
          ) : (
            SALON_TAGLINE
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto"
        >
          <Link
            to="/register"
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-[var(--color-rose-500)] to-[var(--color-rose-400)] text-white font-bold rounded-2xl text-lg transition-all hover:shadow-[0_0_40px_rgba(255,105,180,0.4)] hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10">{hero.primaryButtonText || "Book Your Session"}</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href={SALON_INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white border border-[var(--color-rose-200)] text-[var(--color-rose-600)] font-bold rounded-2xl text-lg transition-all hover:bg-[var(--color-rose-50)] hover:border-[var(--color-rose-300)] hover:-translate-y-1 hover:shadow-xl backdrop-blur-xl"
          >
            <Camera className="w-5 h-5 text-[var(--color-rose-500)]" />
            Explore Gallery
          </a>
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
      >
        <ChevronDown className="w-10 h-10 text-[var(--color-rose-300)] animate-bounce" />
      </motion.div>
      
      {/* Wave divider - Fixed SVG Shape */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 text-[var(--color-surface)]">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="relative block w-full h-[60px] md:h-[120px]">
          <path fill="currentColor" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
}

// ==================== STATS ====================
function StatsSection() {
  const promises = [
    { icon: Sparkles, value: "Premium", label: "Quality Products" },
    { icon: Award, value: "Expert", label: "Stylists & Artists" },
    { icon: Shield, value: "100%", label: "Hygienic Space" },
    { icon: Sparkles, value: "Relaxing", label: "Salon Vibe" },
  ];
  return (
    <section className="py-20 relative bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-2)] border-y border-[var(--color-border)] overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-[var(--color-rose-500)]/30 to-transparent" />
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {promises.map((promise, i) => (
            <motion.div
              key={promise.label}
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center group"
            >
              <div className="w-16 h-16 rounded-3xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:-translate-y-2 group-hover:border-[var(--color-rose-400)] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                <promise.icon className="w-8 h-8 text-[var(--color-rose-500)] group-hover:scale-110 transition-transform" />
              </div>
              <p className="font-display text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)]">
                {promise.value}
              </p>
              <p className="text-sm font-semibold text-[var(--color-text-muted)] mt-2 uppercase tracking-widest">{promise.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== SERVICES ====================
function ServicesSection({ services = [] }) {
  return (
    <section className="py-24 px-4 max-w-7xl mx-auto relative">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[var(--color-rose-500)] text-sm font-bold tracking-[0.2em] uppercase mb-4"
        >Our Magic</motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text-primary)]"
        >
          Premium Beauty <span className="text-gradient-rose">Treatments</span>
        </motion.h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(services.length ? services.slice(0, 8) : Array.from({ length: 4 })).map((svc, i) => (
          <motion.div
            key={svc?._id || i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -10 }}
            className="group rounded-3xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 hover:border-[var(--color-rose-500)]/40 hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.15)] transition-all cursor-pointer overflow-hidden relative"
          >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-rose-500)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {svc?.image ? (
              <div className="overflow-hidden rounded-2xl mb-5">
                <img src={svc.image} alt={svc.name} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
            ) : (
              <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-[var(--color-rose-900)]/30 to-purple-900/20 mb-5 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                <Sparkles className="w-10 h-10 text-[var(--color-rose-400)]/40" />
              </div>
            )}
            
            <div className="relative z-10">
              <h3 className="font-display font-bold text-[var(--color-text-primary)] text-lg mb-2">{svc?.name || "Loading..."}</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">{svc?.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                <span className="text-[var(--color-rose-500)] font-bold text-lg">{svc ? formatCurrency(svc.price) : "—"}</span>
                <span className="text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1 bg-[var(--color-surface-2)] px-2 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" /> {svc?.duration} min
                </span>
              </div>
              
              <Link
                to="/register"
                className="mt-4 w-full py-2.5 bg-[var(--color-surface-2)] text-[var(--color-text-primary)] font-bold rounded-xl transition-all text-center block group-hover:bg-gradient-to-r group-hover:from-[var(--color-rose-500)] group-hover:to-purple-600 group-hover:text-white group-hover:shadow-md"
              >
                Book Now
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="text-center mt-12"
      >
        <Link to="/services" className="inline-flex items-center gap-2 text-[var(--color-rose-500)] hover:text-[var(--color-rose-400)] font-bold text-base transition-colors group">
          View All Services 
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </section>
  );
}

// ==================== FEATURED PRODUCTS ====================
function FeaturedProductsSection({ products = [] }) {
  if (!products.length) return null;
  
  // Show top 4 products
  const featured = products.slice(0, 4);

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto relative">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[var(--color-rose-500)] text-sm font-bold tracking-[0.2em] uppercase mb-4"
        >Our Store</motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text-primary)]"
        >
          Premium <span className="text-gradient-rose">Products</span>
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map((p, i) => (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -10 }}
            className="group rounded-3xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 hover:border-[var(--color-rose-400)] hover:shadow-[0_20px_40px_-15px_rgba(255,105,180,0.15)] transition-all overflow-hidden relative flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-rose-500)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative w-full h-48 mb-5 bg-[var(--color-surface)] rounded-2xl overflow-hidden flex items-center justify-center p-2">
              {p.image || p.imageUrl ? (
                <img src={p.image || p.imageUrl} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 mix-blend-multiply dark:mix-blend-normal" />
              ) : (
                <Package className="w-12 h-12 text-[var(--color-rose-300)]" />
              )}
              {p.discount > 0 && (
                <div className="absolute top-2 right-2 bg-[var(--color-rose-500)] text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                  {p.discount}% OFF
                </div>
              )}
            </div>

            <div className="relative z-10 flex flex-col flex-1">
              <p className="text-[10px] font-bold text-[var(--color-rose-500)] uppercase tracking-wider mb-1">{p.brand || "Salon Product"}</p>
              <h3 className="font-display font-bold text-[var(--color-text-primary)] text-lg mb-2 line-clamp-2 leading-tight">{p.name}</h3>
              <p className="text-xs text-[var(--color-text-muted)] mb-4 line-clamp-2 flex-1">{p.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                <div className="flex flex-col">
                  {p.originalPrice && (
                    <span className="text-[10px] text-[var(--color-text-muted)] line-through">{formatCurrency(p.originalPrice)}</span>
                  )}
                  <span className="text-[var(--color-rose-600)] font-black text-lg">{formatCurrency(p.price)}</span>
                </div>
                <Link
                  to="/products"
                  className="w-10 h-10 rounded-full bg-[var(--color-rose-500)] text-white flex items-center justify-center hover:scale-110 hover:shadow-lg transition-transform"
                >
                  <ShoppingBag className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="text-center mt-12"
      >
        <Link to="/products" className="inline-flex items-center gap-2 text-[var(--color-rose-500)] hover:text-[var(--color-rose-400)] font-bold text-base transition-colors group">
          Shop All Products
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </section>
  );
}

// ==================== WHY CHOOSE US ====================
function WhyUsSection() {
  const reasons = [
    { icon: Award, title: "Certified Professionals", desc: "All our staff are trained and certified beauty experts." },
    { icon: Shield, title: "Premium Products Only", desc: "We use only top-quality, skin-safe beauty products." },
    { icon: Sparkles, title: "Relaxing Vibe", desc: "A calm, luxurious environment designed for your ultimate comfort." },
    { icon: Star, title: "Loyalty Rewards", desc: "Earn Glow Points on every visit and redeem for free services." },
  ];
  return (
    <section className="py-24 bg-[var(--color-surface-2)] relative overflow-hidden">
      {/* Decorative SVG Blob */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none text-[var(--color-rose-500)]">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full animate-spin-slow">
          <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.6,-46.3C91.4,-33.5,98,-18.1,98.1,-2.7C98.2,12.7,91.8,28.2,82,41C72.2,53.8,59,63.9,44.8,71.7C30.6,79.5,15.3,85,-0.6,86.1C-16.5,87.2,-33,83.9,-47.5,76.2C-62,68.5,-74.5,56.4,-83.4,42.1C-92.3,27.8,-97.6,11.3,-96.2,-4.7C-94.8,-20.7,-86.7,-36.2,-75.7,-48.6C-64.7,-61,-50.8,-70.3,-36.4,-77.3C-22,-84.3,-7.1,-89,7.6,-88.4C22.3,-87.8,44.7,-76.4,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <p className="text-[var(--color-rose-500)] text-sm font-bold tracking-[0.2em] uppercase mb-4">Why Us</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text-primary)]">Why Choose <span className="text-gradient-rose">{SALON_NAME}?</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 60 }}
              viewport={{ once: true, margin: "-50px" }}
              className="flex gap-5 p-6 rounded-3xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-sm hover:shadow-lg transition-all group hover:-translate-y-1 hover:border-[var(--color-rose-400)]/30"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-rose-500)]/10 to-[var(--color-rose-500)]/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform group-hover:rotate-6">
                <r.icon className="w-7 h-7 text-[var(--color-rose-500)]" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-2">{r.title}</h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">{r.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== GALLERY PREVIEW ====================
function GallerySection({ gallery = [] }) {
  const items = gallery.length ? gallery.slice(0, 9) : [];
  return (
    <section className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[var(--color-rose-500)] text-sm font-bold tracking-[0.2em] uppercase mb-4"
        >Our Work</motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text-primary)]"
        >
          Beauty <span className="text-gradient-rose">Gallery</span>
        </motion.h2>
      </div>
      {items.length > 0 ? (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: (i % 4) * 0.1, type: "spring" }}
              viewport={{ once: true, margin: "-50px" }}
              className="break-inside-avoid rounded-3xl overflow-hidden group cursor-pointer relative shadow-sm hover:shadow-xl hover:z-10 transition-all"
            >
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
              <img
                src={item.image}
                alt={item.title}
                className="w-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-3xl skeleton" />
          ))}
        </div>
      )}
      <motion.div 
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="text-center mt-12"
      >
        <Link to="/gallery" className="inline-flex items-center gap-2 text-[var(--color-rose-500)] hover:text-[var(--color-rose-400)] font-bold text-base transition-colors group">
          View Full Gallery <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </section>
  );
}

// ==================== OFFERS ====================
function OffersSection({ offers = [] }) {
  if (!offers.length) return null;
  return (
    <section className="py-24 bg-[var(--color-surface-2)] relative border-y border-[var(--color-border)] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/5 via-[var(--color-surface-2)] to-[var(--color-surface-2)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-yellow-500 text-sm font-bold tracking-[0.2em] uppercase mb-4"
          >Special Deals</motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text-primary)]"
          >
            Current <span className="text-gradient-gold">Offers</span>
          </motion.h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer, i) => {
            const daysLeft = Math.max(0, Math.ceil((new Date(offer.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
            return (
              <motion.div
                key={offer._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: "spring" }}
                viewport={{ once: true, margin: "-50px" }}
                className="rounded-[2rem] overflow-hidden bg-[var(--color-surface-card)] border-2 border-yellow-500/20 hover:border-yellow-400 shadow-lg hover:shadow-[0_0_30px_rgba(250,204,21,0.2)] transition-all hover:-translate-y-2 group relative"
              >
                {offer.bannerImage && (
                  <div className="relative overflow-hidden">
                    <img src={offer.bannerImage} alt={offer.title} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <span className="px-4 py-1.5 bg-yellow-400 text-yellow-950 rounded-full text-sm font-black uppercase tracking-wider shadow-lg">
                        {offer.discountText}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    <span>Limited Time</span>
                    <span className={daysLeft <= 3 ? "text-red-500 animate-pulse" : "text-emerald-500"}>{daysLeft} days left</span>
                  </div>
                  <h3 className="font-display font-bold text-[var(--color-text-primary)] text-xl mb-2">{offer.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">{offer.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ==================== TESTIMONIALS ====================
function TestimonialsSection({ testimonials = [] }) {
  const [idx, setIdx] = useState(0);
  const items = testimonials.length ? testimonials : [];
  useEffect(() => {
    if (!items.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);
  
  if (!items.length) return null;
  const t = items[idx];
  
  return (
    <section className="py-24 px-4 max-w-5xl mx-auto overflow-hidden">
      <div className="text-center mb-16">
        <motion.p
           initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
           className="text-[var(--color-rose-500)] text-sm font-bold tracking-[0.2em] uppercase mb-4"
        >Reviews</motion.p>
        <motion.h2
           initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
           className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text-primary)]"
        >
          What Clients <span className="text-gradient-rose">Say</span>
        </motion.h2>
      </div>
      
      <div className="relative px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "anticipate" }}
            className="glass border border-[var(--color-border)] rounded-[3rem] p-8 md:p-14 text-center shadow-2xl relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl text-[var(--color-rose-500)]/20 font-serif">"</div>
            <div className="flex justify-center gap-1.5 mb-8">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
              ))}
            </div>
            <p className="text-[var(--color-text-primary)] text-xl md:text-3xl font-display font-medium leading-relaxed mb-10">
              {t.review}
            </p>
            <div className="flex flex-col items-center justify-center gap-3">
              {t.customerImage ? (
                <img src={t.customerImage} alt={t.customerName} className="w-16 h-16 rounded-full object-cover border-4 border-[var(--color-rose-500)]/30 shadow-lg" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-rose-500)] to-purple-600 flex items-center justify-center text-white font-display text-2xl font-bold shadow-lg border-4 border-white dark:border-gray-800">
                  {t.customerName[0]}
                </div>
              )}
              <span className="font-bold text-lg text-[var(--color-text-primary)]">{t.customerName}</span>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="flex justify-center gap-3 mt-10">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${i === idx ? "w-10 bg-[var(--color-rose-500)]" : "w-2.5 bg-[var(--color-border)] hover:bg-[var(--color-rose-300)]"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== FAQ ====================
function FAQSection({ faqs = [] }) {
  const [open, setOpen] = useState(null);
  if (!faqs.length) return null;
  return (
    <section className="py-24 bg-[var(--color-surface-2)] border-y border-[var(--color-border)]">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-[var(--color-rose-500)] text-sm font-bold tracking-[0.2em] uppercase mb-4"
          >FAQs</motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text-primary)]"
          >
            Frequently Asked <span className="text-gradient-rose">Questions</span>
          </motion.h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`rounded-2xl bg-[var(--color-surface-card)] border transition-colors ${open === faq._id ? 'border-[var(--color-rose-400)] shadow-md' : 'border-[var(--color-border)] hover:border-[var(--color-rose-200)]'}`}
            >
              <button
                onClick={() => setOpen(open === faq._id ? null : faq._id)}
                className="flex items-center justify-between w-full p-6 text-left"
              >
                <span className={`font-bold text-lg transition-colors ${open === faq._id ? 'text-[var(--color-rose-500)]' : 'text-[var(--color-text-primary)]'}`}>{faq.question}</span>
                {open === faq._id ? (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-rose-500)]/10 flex items-center justify-center flex-shrink-0">
                    <Minus className="w-4 h-4 text-[var(--color-rose-500)]" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4 text-[var(--color-text-muted)]" />
                  </div>
                )}
              </button>
              <AnimatePresence>
                {open === faq._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 pt-0 text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)] mt-2 pt-4">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== TROPHIES ====================
function TrophyCard({ src, index }) {
  const [error, setError] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
      whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group relative rounded-3xl overflow-hidden aspect-[3/4] border-4 border-yellow-500/20 hover:border-yellow-400 shadow-lg hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-black/40 z-10 pointer-events-none" />
      {!error ? (
        <img
          src={src}
          alt={`Trophy ${index + 1}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-yellow-900/30 to-[var(--color-surface-2)] flex flex-col items-center justify-center">
          <span className="text-4xl">🏆</span>
          <span className="text-xs text-yellow-500/50 mt-2 font-bold uppercase">Add {src.split("/").pop()}</span>
        </div>
      )}
    </motion.div>
  );
}

function TrophiesSection() {
  const trophies = [
    "/images/trophy-1.jpg",
    "/images/trophy-2.jpg",
    "/images/trophy-3.jpg",
    "/images/trophy-4.jpg",
  ];

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto bg-[var(--color-surface)]">
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-yellow-500 text-sm font-bold tracking-[0.2em] uppercase mb-4"
        >Our Achievements</motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-display text-4xl md:text-5xl font-bold text-[var(--color-text-primary)]"
        >
          Hall of <span className="text-gradient-gold">Trophies</span>
        </motion.h2>
        <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto mt-4">
          Celebrating excellence and beauty. Here are some of our proudest moments and awards.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {trophies.map((src, i) => (
          <TrophyCard key={i} src={src} index={i} />
        ))}
      </div>
    </section>
  );
}

// ==================== CALL TO ACTION ====================
function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden bg-[var(--color-rose-50)]">
      <div className="absolute inset-0 z-0">
        <img
          src="/images/gallery-2.jpg"
          alt="CTA Background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-white/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-rose-50)] via-white/70 to-white/90" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-rose-400)] to-[var(--color-rose-500)] mb-8 shadow-[0_0_50px_rgba(255,105,180,0.4)]"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="font-display text-5xl md:text-7xl font-black text-[var(--color-text-primary)] mb-6 leading-tight drop-shadow-sm"
        >
          Ready to experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-rose-500)] to-[var(--color-rose-400)]">Magic?</span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-[var(--color-text-secondary)] text-xl max-w-2xl mx-auto mb-12"
        >
          Book your session today and step into a world of premium beauty and relaxation.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/register"
            className="group relative inline-flex items-center justify-center gap-3 px-12 py-6 bg-[var(--color-rose-500)] text-white font-black rounded-full text-xl transition-all hover:shadow-[0_0_40px_rgba(255,105,180,0.4)] hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-rose-400)] to-[var(--color-rose-600)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 group-hover:text-white transition-colors duration-500">Book Appointment</span>
            <ArrowRight className="w-6 h-6 relative z-10 group-hover:text-white group-hover:translate-x-2 transition-all duration-500" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ==================== MUSIC PLAYER ====================
function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    // Attempt to autoplay
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setIsPlaying(true);
      }).catch(error => {
        // Autoplay was prevented by the browser. 
        // User needs to click the button to start.
        console.log("Autoplay prevented:", error);
        setIsPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
      onClick={togglePlay}
      className={`fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
        isPlaying ? "bg-[var(--color-rose-500)] text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse" : "bg-white/80 text-[var(--color-rose-500)] backdrop-blur-md border border-[var(--color-rose-200)] hover:bg-[var(--color-rose-50)]"
      }`}
      aria-label="Toggle Background Music"
    >
      <Music className={`w-6 h-6 ${isPlaying ? 'animate-bounce' : ''}`} />
    </motion.button>
  );
}

// ==================== MAIN HOME ====================
export default function Home() {
  const { data: settingsRes } = useQuery({
    queryKey: QUERY_KEYS.SETTINGS,
    queryFn: cmsService.getSettings,
  });
  const { data: servicesRes } = useQuery({
    queryKey: QUERY_KEYS.SERVICES,
    queryFn: serviceService.getAll,
  });
  const { data: galleryRes } = useQuery({
    queryKey: QUERY_KEYS.GALLERY,
    queryFn: cmsService.getGallery,
  });
  const { data: offersRes } = useQuery({
    queryKey: QUERY_KEYS.OFFERS,
    queryFn: cmsService.getOffers,
  });
  const { data: testimonialRes } = useQuery({
    queryKey: QUERY_KEYS.TESTIMONIALS,
    queryFn: cmsService.getTestimonials,
  });
  const { data: faqRes } = useQuery({
    queryKey: QUERY_KEYS.FAQS,
    queryFn: cmsService.getFAQs,
  });
  // Fetch Products
  const { data: productsRes } = useQuery({
    queryKey: ["products"],
    queryFn: () => inventoryService.getProducts({}),
  });

  const settings = settingsRes?.data;
  const services = servicesRes?.data || [];
  const gallery = galleryRes?.data || [];
  const offers = offersRes?.data || [];
  const testimonials = testimonialRes?.data || [];
  const faqs = faqRes?.data || [];
  const products = productsRes?.data?.products || [];

  return (
    <div className="overflow-x-hidden">
      <HeroSection settings={settings} />
      <StatsSection />
      <ServicesSection services={services} />
      <FeaturedProductsSection products={products} />
      <WhyUsSection />
      <GallerySection gallery={gallery} />
      <OffersSection offers={offers} />
      <TestimonialsSection testimonials={testimonials} />
      <FAQSection faqs={faqs} />
      <TrophiesSection />
      <CTASection />
      
      <MusicPlayer />
      <SocialProofPopup />

      {/* WhatsApp Float Button */}
      <motion.a
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1, rotate: 10 }}
        href={`https://wa.me/${SALON_WHATSAPP}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-24 z-[60] w-16 h-16 bg-gradient-to-tr from-green-600 to-green-400 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(34,197,94,0.4)] transition-all"
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </motion.a>

      {/* Floating AI Beauty Consultant */}
      <AIConsultant />
    </div>
  );
}
