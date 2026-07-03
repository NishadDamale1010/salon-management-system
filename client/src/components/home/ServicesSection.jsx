import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export default function ServicesSection({ services = [], bookLink, isAuthenticated }) {
  
  // Show actual individual popular services instead of grouping by category
  const popularServices = services.slice(0, 6);

  const displayServices = popularServices.length > 0 ? popularServices : [
    { name: "Signature Hair Care", duration: 60, price: 999, image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800" },
    { name: "Glow Facial", duration: 45, price: 1499, image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800" },
    { name: "Bridal Makeup", duration: 120, price: 4999, image: "https://images.unsplash.com/photo-1512496015851-a9089df53e96?auto=format&fit=crop&q=80&w=800" },
  ];

  return (
    <section className="py-6 px-4 relative bg-white rounded-t-[2.5rem] mt-4 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-xl font-display font-black text-gray-900">
          Our Popular Services
        </h2>
        <Link to="/services" className="text-[11px] font-bold text-rose-500 flex items-center hover:text-rose-600 transition-colors">
          View All Services <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>
      
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-5 scrollbar-hide">
        {displayServices.map((svc, i) => (
          <Link
            key={i}
            to={isAuthenticated ? "/book" : bookLink}
            className="snap-center w-44 shrink-0 group block bg-white rounded-3xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(244,63,94,0.15)] transition-all"
          >
            <div className="relative h-36 w-full">
               <img 
                 src={svc.image || svc.imageUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"} 
                 alt={svc.name} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                 onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"; }}
               />
               {/* Overlapping Pink Icon */}
               <div className="absolute -bottom-4 left-4 w-9 h-9 bg-rose-500 rounded-full flex items-center justify-center shadow-lg border-[2.5px] border-white group-hover:bg-rose-600 transition-colors">
                  <Sparkles className="w-4 h-4 text-white" />
               </div>
            </div>
            <div className="pt-6 pb-5 px-4 bg-white">
               <h3 className="font-bold text-gray-900 text-sm truncate mb-0.5">{svc.name}</h3>
               <p className="text-[11px] text-gray-500 font-medium">{svc.duration} min</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
