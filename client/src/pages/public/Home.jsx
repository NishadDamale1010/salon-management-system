import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles, Calendar, Star, Trophy, ShieldCheck,
  Gift, ShoppingBag, Tag, Users, Activity, Crown,
  ArrowRight, Video, Instagram, MessageCircle
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { SALON_WHATSAPP, SALON_INSTAGRAM } from "../../constants";

const QuickLink = ({ icon: Icon, label, subtext, to }) => (
  <Link to={to} className="flex flex-col items-center p-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] rounded-3xl transition-all min-w-[100px] text-center border border-[var(--color-border)] hover:border-[var(--color-rose-300)] hover:shadow-sm">
    <div className="w-12 h-12 bg-rose-50 text-[var(--color-rose-500)] rounded-full flex items-center justify-center mb-3">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-0.5">{label}</h3>
    <span className="text-[10px] text-[var(--color-text-muted)] leading-tight">{subtext}</span>
  </Link>
);

const FeatureCard = ({ image, title, subtext, icon: Icon }) => (
  <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:shadow-md transition-all">
    <div className="h-32 bg-gray-100 relative overflow-hidden group">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    </div>
    <div className="p-4 flex items-start gap-3">
      <div className="text-[var(--color-rose-500)] mt-0.5">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-semibold text-[var(--color-text-primary)] text-sm">{title}</h4>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{subtext}</p>
      </div>
    </div>
  </div>
);

const ServiceCard = ({ image, title, price, to }) => (
  <Link to={to} className="group bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col min-w-[160px]">
    <div className="h-32 bg-gray-100 overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    </div>
    <div className="p-4 flex flex-col justify-between flex-grow">
      <div>
        <h4 className="font-semibold text-[var(--color-text-primary)] text-sm">{title}</h4>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">Starting at <span className="font-semibold text-[var(--color-rose-500)]">₹{price}</span></p>
      </div>
      <div className="w-8 h-8 rounded-full bg-[var(--color-rose-500)] text-white flex items-center justify-center mt-3 self-end group-hover:bg-[var(--color-rose-600)] transition-colors">
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  </Link>
);

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const bookLink = isAuthenticated ? (user?.role === "admin" ? "/admin" : "/customer") : "/register";

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
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-500 text-white flex items-center justify-center"><Instagram className="w-4 h-4"/></div>
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

        {/* WELCOME GIFT BANNER */}
        <section className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-200/50 rounded-full blur-3xl" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 relative">
              <Gift className="w-full h-full text-[var(--color-rose-500)]" />
              <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-display font-bold text-[var(--color-text-primary)] mb-1">Welcome Gift Just For You!</h3>
              <p className="text-[var(--color-text-muted)] text-sm md:text-base">
                Get <span className="font-bold text-[var(--color-rose-600)]">200 Glow Points</span> on your first booking<br className="hidden md:block" /> and unlock exclusive rewards.
              </p>
            </div>
          </div>
          <Link to={bookLink} className="w-full md:w-auto px-6 py-3 bg-[var(--color-rose-500)] hover:bg-[var(--color-rose-600)] text-white font-semibold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap z-10">
            Claim Now <Sparkles className="w-4 h-4" />
          </Link>
        </section>

        {/* WHY CHOOSE US & GLOW CHALLENGE */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-display font-bold text-xl">
              Why Choose Gayatri Beauty Studio? <Sparkles className="w-4 h-4 text-rose-500" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FeatureCard 
                icon={Users} title="Expert Stylists" subtext="Certified & Experienced"
                image="https://images.unsplash.com/photo-1521590832167-7bfc17484d20?q=80&w=300&auto=format&fit=crop"
              />
              <FeatureCard 
                icon={ShoppingBag} title="Premium Products" subtext="Top Quality Brands"
                image="https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=300&auto=format&fit=crop"
              />
              <FeatureCard 
                icon={Sparkles} title="Personalized Care" subtext="Just For You"
                image="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=300&auto=format&fit=crop"
              />
              <FeatureCard 
                icon={ShieldCheck} title="Hygienic & Safe" subtext="Your Safety First"
                image="https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=300&auto=format&fit=crop"
              />
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-gray-900 text-white flex flex-col justify-end p-6 h-[320px] lg:h-auto mt-4 lg:mt-0">
            <img src="https://images.unsplash.com/photo-1600269408643-d34e6284f181?q=80&w=500&auto=format&fit=crop" alt="Challenge" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2a0845]/90 to-transparent" />
            
            <div className="relative z-10">
              <h3 className="font-display text-2xl font-bold mb-1">Glow Challenge</h3>
              <div className="inline-block px-2 py-1 bg-white/20 backdrop-blur text-xs font-medium rounded mb-3 border border-white/20">
                May Edition
              </div>
              <p className="text-sm text-gray-200 mb-4 max-w-[200px]">Post your best look and win exciting prizes!</p>
              
              <Link to="/feed" className="inline-block px-5 py-2 bg-[var(--color-rose-500)] hover:bg-[var(--color-rose-600)] text-white font-medium rounded-xl text-sm mb-4 transition-colors shadow-lg">
                Join Now
              </Link>
              
              {/* Countdown (Static visually) */}
              <div className="flex items-center gap-2 text-center">
                <div className="bg-white/10 backdrop-blur rounded p-1.5 w-10 border border-white/10"><div className="font-bold text-lg leading-tight">05</div><div className="text-[8px] uppercase tracking-wider opacity-70">Days</div></div>
                <div className="text-rose-300 font-bold">:</div>
                <div className="bg-white/10 backdrop-blur rounded p-1.5 w-10 border border-white/10"><div className="font-bold text-lg leading-tight">12</div><div className="text-[8px] uppercase tracking-wider opacity-70">Hours</div></div>
                <div className="text-rose-300 font-bold">:</div>
                <div className="bg-white/10 backdrop-blur rounded p-1.5 w-10 border border-white/10"><div className="font-bold text-lg leading-tight">35</div><div className="text-[8px] uppercase tracking-wider opacity-70">Min</div></div>
                <div className="text-rose-300 font-bold">:</div>
                <div className="bg-white/10 backdrop-blur rounded p-1.5 w-10 border border-white/10"><div className="font-bold text-lg leading-tight">42</div><div className="text-[8px] uppercase tracking-wider opacity-70">Sec</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* POPULAR SERVICES */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-[var(--color-text-primary)] flex items-center gap-2">Popular Services <Sparkles className="w-4 h-4 text-rose-500" /></h2>
            <Link to="/services" className="text-sm font-medium text-[var(--color-rose-500)] flex items-center gap-1 hover:underline">
              View All Services <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide">
            <ServiceCard title="Hair Styling" price="499" image="https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=300&auto=format&fit=crop" to="/services" />
            <ServiceCard title="Facial" price="999" image="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=300&auto=format&fit=crop" to="/services" />
            <ServiceCard title="Nail Art" price="699" image="https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=300&auto=format&fit=crop" to="/services" />
            <ServiceCard title="Makeup" price="1499" image="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=300&auto=format&fit=crop" to="/services" />
            <ServiceCard title="Spa & Wellness" price="799" image="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=300&auto=format&fit=crop" to="/services" />
          </div>
        </section>

        {/* BOTTOM PROMO BANNERS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-center">
            <div className="relative z-10 w-2/3">
              <h3 className="text-rose-600 font-display font-bold text-lg mb-1">Refer & Earn</h3>
              <p className="text-sm text-rose-800 mb-3 leading-snug">Invite your friends and earn 100 Glow Points!</p>
              <Link to={isAuthenticated ? "/customer/rewards" : "/register"} className="inline-block px-4 py-1.5 bg-white text-rose-600 text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-shadow">Refer Now</Link>
            </div>
            <img src="https://cdn3d.iconscout.com/3d/premium/thumb/women-taking-selfie-4437035-3684801.png" alt="Refer" className="absolute -right-6 bottom-0 w-36 h-36 object-contain drop-shadow-xl" />
          </div>
        </section>
        
      </main>
    </div>
  );
}
