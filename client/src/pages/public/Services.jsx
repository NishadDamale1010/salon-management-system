import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { serviceService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { SkeletonCard } from "../../components/ui/Skeleton";

export default function Services() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.SERVICES,
    queryFn: serviceService.getAll,
  });
  const services = data?.data || [];

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[var(--color-rose-400)] text-sm font-semibold tracking-widest uppercase mb-3">What We Offer</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4">Our <span className="text-gradient-rose">Services</span></motion.h1>
          <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">Premium beauty treatments crafted to bring out your best self</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : services.map((svc, i) => (
              <motion.div key={svc._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-rose-500)]/40 hover:-translate-y-1 transition-all group"
              >
                {svc.image ? <img src={svc.image} alt={svc.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-48 bg-gradient-to-br from-[var(--color-rose-900)]/50 to-purple-900/30 flex items-center justify-center"><Sparkles className="w-10 h-10 text-[var(--color-rose-400)]/30" /></div>}
                <div className="p-5">
                  <h3 className="font-display font-semibold text-[var(--color-text-primary)] text-lg mb-1">{svc.name}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mb-3 line-clamp-2">{svc.description}</p>
                  <div className="flex items-center justify-end mb-4">
                    <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1"><Clock className="w-3 h-3" />{svc.duration} min</span>
                  </div>
                  <Link to="/register" className="w-full py-2.5 -white text-sm font-medium rounded-xl transition-all text-center block">Book Now</Link>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}
