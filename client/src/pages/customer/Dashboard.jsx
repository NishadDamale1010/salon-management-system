import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Calendar, User, Gift, Tag, Image as ImageIcon, MessageCircle, Phone, Sparkles, ShoppingBag, Plus } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { authService, serviceService, inventoryService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { cn } from "../../utils";
import ChampionBanner from "../../components/Leaderboard/ChampionBanner";
import ProductModal from "../../components/products/ProductModal";
import LaunchModal from "../../components/ui/LaunchModal";
import DailyTipModal from "../../components/ui/DailyTipModal";

const ACTION_ICONS = [
  { id: 1, label: "Book Appointment", icon: Calendar, to: "/book", bg: "bg-rose-50", color: "text-rose-500" },
  { id: 2, label: "My Appointments", icon: Calendar, to: "/appointments", bg: "bg-rose-50", color: "text-rose-500" },
  { id: 3, label: "My Profile", icon: User, to: "/profile", bg: "bg-rose-50", color: "text-rose-500" },
  { id: 4, label: "Glow Points", icon: Sparkles, to: "/rewards", bg: "bg-rose-50", color: "text-rose-500" },
  { id: 5, label: "Refer & Earn", icon: Gift, to: "/refer", bg: "bg-rose-50", color: "text-rose-500" },
  { id: 6, label: "Products", icon: ShoppingBag, to: "/products", bg: "bg-rose-50", color: "text-rose-500" },
  { id: 7, label: "Offers", icon: Tag, to: "/offers", bg: "bg-rose-50", color: "text-rose-500" },
  { id: 8, label: "Gallery", icon: ImageIcon, to: "/gallery", bg: "bg-rose-50", color: "text-rose-500" },
  { id: 9, label: "Reviews", icon: MessageCircle, to: "/reviews", bg: "bg-rose-50", color: "text-rose-500" },
  { id: 10, label: "Contact Us", icon: Phone, to: "/contact", bg: "bg-rose-50", color: "text-rose-500" },
];

export default function CustomerDashboard() {
  const user = useAuthStore((s) => s.user);
  
  // Queries
  const { data: leaderboardData } = useQuery({ queryKey: ["LEADERBOARD"], queryFn: authService.getLeaderboard });
  const { data: servicesData } = useQuery({ queryKey: QUERY_KEYS.SERVICES, queryFn: serviceService.getAll });
  const { data: productsData } = useQuery({ queryKey: QUERY_KEYS.PRODUCTS, queryFn: inventoryService.getProducts });
  
  const leaderboard = leaderboardData?.data?.lifetime || [];
  const services = servicesData?.data || [];
  const products = productsData?.data || [];
  
  const activeServices = services.filter(s => s.isActive);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Group services by category for display
  const categoryData = activeServices.reduce((acc, svc) => {
    if (!acc[svc.category]) {
      acc[svc.category] = {
        name: svc.category,
        count: 0,
        // Use the first available image from a service in this category, or a fallback if none exist
        img: svc.image || svc.imageUrl || null,
        icon: Sparkles
      };
    }
    acc[svc.category].count += 1;
    // If we didn't have an image yet, but this service has one, use it
    if (!acc[svc.category].img && (svc.image || svc.imageUrl)) {
      acc[svc.category].img = svc.image || svc.imageUrl;
    }
    return acc;
  }, {});

  // Convert the grouped data into an array. If there are no services, use some defaults to match the design.
  const serviceCategories = Object.values(categoryData).length > 0 
    ? Object.values(categoryData) 
    : [
        { name: "Hair", count: 12, img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800", icon: Sparkles },
        { name: "Skin", count: 15, img: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800", icon: Sparkles },
        { name: "Makeup", count: 10, img: "https://images.unsplash.com/photo-1512496015851-a9089df53e96?auto=format&fit=crop&q=80&w=800", icon: Sparkles },
        { name: "Nails", count: 8, img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80&w=800", icon: Sparkles }
      ];

  // For products, it already uses your actual products if they exist in the database.
  // The placeholders are only a fallback if the database returns 0 products.
  const dummyProducts = products.length > 0 ? products : [
    { _id: 1, name: "Glow Serum", price: 899, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800" },
    { _id: 2, name: "Hair Repair Mask", price: 750, image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800" },
    { _id: 3, name: "Sunscreen SPF 50", price: 699, image: "https://images.unsplash.com/photo-1556228720-192a6af4e865?auto=format&fit=crop&q=80&w=800" },
    { _id: 4, name: "Face Cleanser", price: 499, image: "https://images.unsplash.com/photo-1571781926291-c477eb30c451?auto=format&fit=crop&q=80&w=800" },
  ];

  return (
    <div className="space-y-6 pb-6 w-full max-w-md mx-auto overflow-x-hidden">
      <LaunchModal />
      <DailyTipModal />

      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl overflow-hidden bg-rose-50 h-[180px] sm:h-[200px]">
        {/* Background Decorative Pattern / Image */}
        <div className="absolute top-0 right-0 bottom-0 left-0">
          <img src="/images/welcome-model.png" className="w-full h-full object-cover object-right opacity-90" alt="" onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80"; }} />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
        </div>

        <div className="relative z-10 p-5 flex flex-col justify-center h-full max-w-[65%]">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-1 leading-tight">
            Good Morning, {user?.firstName} 💖
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">You're looking lovely today! ✨</p>
          
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-1.5 bg-white shadow-sm rounded-full px-3 py-1.5 border border-rose-100">
              <span className="text-rose-500 text-lg leading-none">💎</span>
              <span className="font-bold text-sm text-gray-800">{user?.glowPoints || 840}</span>
              <span className="text-[10px] text-gray-500 font-medium ml-0.5">Glow Points</span>
            </div>
          </div>
          
          <Link to="/rewards" className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-rose-500 font-medium px-3 py-1 rounded-full border border-rose-200 w-fit hover:bg-rose-50 bg-white/50 backdrop-blur-sm">
            View Progress <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>

      {/* Champion Banner */}
      <ChampionBanner user={user} leaderboard={leaderboard} />

      {/* Quick Action Grid */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-5 gap-y-6 gap-x-2">
          {ACTION_ICONS.map((action) => (
            <Link key={action.id} to={action.to} className="flex flex-col items-center gap-2 group">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 border border-rose-100", action.bg)}>
                <action.icon className={cn("w-5 h-5", action.color)} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] text-center font-medium text-gray-700 leading-tight">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Our Services Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 pt-4">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="font-display text-lg font-bold text-gray-900">Our Services</h2>
          <Link to="/book" className="flex items-center text-xs font-semibold text-rose-500 hover:text-rose-600">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-1 -mx-4 sm:mx-0 sm:px-0 scroll-pl-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {/* Add a tiny spacer for initial scroll padding on mobile */}
          <div className="w-1 shrink-0 sm:hidden"></div>
          {serviceCategories.map((cat, i) => (
            <Link key={i} to={`/book?category=${cat.name}`} className="snap-center flex-shrink-0 w-32 relative block">
              <div className="w-full h-36 rounded-2xl overflow-hidden relative shadow-sm border border-gray-100">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <cat.icon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 text-sm mt-2">{cat.name}</h3>
              <p className="text-xs text-gray-500 font-medium">{cat.count} Services</p>
            </Link>
          ))}
          <div className="w-1 shrink-0 sm:hidden"></div>
        </div>
      </motion.div>

      {/* Featured Products Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="font-display text-lg font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="flex items-center text-xs font-semibold text-rose-500 hover:text-rose-600">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-1 -mx-4 sm:mx-0 sm:px-0 scroll-pl-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="w-1 shrink-0 sm:hidden"></div>
          {dummyProducts.map((prod, i) => (
            <div key={i} className="snap-center flex-shrink-0 w-32 bg-rose-50/50 rounded-2xl p-3 border border-rose-100 relative group cursor-pointer" onClick={() => setSelectedProduct(prod)}>
              <div className="w-full h-24 mb-3 rounded-xl overflow-hidden flex items-center justify-center mix-blend-multiply bg-white">
                <img 
                  src={prod.image || prod.imageUrl || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800"} 
                  alt={prod.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800"; }}
                />
              </div>
              <h3 className="font-bold text-gray-900 text-[11px] leading-tight line-clamp-2 pr-6">{prod.name}</h3>
              
              <button 
                className="absolute bottom-3 right-3 w-7 h-7 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-sm transition-transform active:scale-95"
                onClick={(e) => { e.stopPropagation(); /* Add to cart */ }}
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>
          ))}
          <div className="w-1 shrink-0 sm:hidden"></div>
        </div>
      </motion.div>

      <ProductModal isOpen={!!selectedProduct} product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
