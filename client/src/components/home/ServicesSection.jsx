import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export default function ServicesSection({ services = [], bookLink, isAuthenticated }) {
  
  // Group services by category for display (similar to dashboard)
  const categoryData = services.reduce((acc, svc) => {
    if (!acc[svc.category]) {
      acc[svc.category] = {
        name: svc.category,
        count: 0,
        img: svc.image || svc.imageUrl || null,
        icon: Sparkles
      };
    }
    acc[svc.category].count += 1;
    if (!acc[svc.category].img && (svc.image || svc.imageUrl)) {
      acc[svc.category].img = svc.image || svc.imageUrl;
    }
    return acc;
  }, {});

  const serviceCategories = Object.values(categoryData).length > 0 
    ? Object.values(categoryData) 
    : [
        { name: "Hair Care", count: 12, img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800", icon: Sparkles },
        { name: "Skin Care", count: 15, img: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800", icon: Sparkles },
        { name: "Makeup", count: 10, img: "https://images.unsplash.com/photo-1512496015851-a9089df53e96?auto=format&fit=crop&q=80&w=800", icon: Sparkles },
        { name: "Nails", count: 8, img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80&w=800", icon: Sparkles },
        { name: "Massage & Spa", count: 6, img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800", icon: Sparkles }
      ];

  return (
    <section className="py-4 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold text-gray-900">
          Our Popular Services
        </h2>
        <Link to="/services" className="text-[10px] font-bold text-rose-500 flex items-center">
          View All Services <ArrowRight className="w-3 h-3 ml-0.5" />
        </Link>
      </div>
      
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide">
        {serviceCategories.map((cat, i) => (
          <Link
            key={i}
            to={isAuthenticated ? "/book" : bookLink}
            className="snap-center w-36 shrink-0 group block"
          >
            <div className="relative mb-3">
              <div className="w-full h-44 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                 <img 
                   src={cat.img} 
                   alt={cat.name} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                   onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"; }}
                 />
              </div>
              {/* Overlapping Pink Icon */}
              <div className="absolute -bottom-3 left-3 w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                 <cat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="px-1 mt-4">
               <h3 className="font-bold text-gray-900 text-sm">{cat.name}</h3>
               <p className="text-[10px] text-gray-500 font-medium">{cat.count} Services</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
