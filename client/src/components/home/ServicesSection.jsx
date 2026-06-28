import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Clock, ArrowRight } from "lucide-react";

export default function ServicesSection({ services = [], bookLink, isAuthenticated }) {
  return (
    <section className="py-12 relative">
      <div className="text-center mb-10">
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
          className="font-display text-4xl font-bold text-[var(--color-text-primary)]"
        >
          Premium Beauty <span className="text-rose-500">Treatments</span>
        </motion.h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {(services.length ? services.slice(0, 4) : Array.from({ length: 4 })).map((svc, i) => (
          <motion.div
            key={svc?._id || i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -10 }}
            className="group rounded-3xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 hover:border-[var(--color-rose-500)]/40 hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.15)] transition-all cursor-pointer overflow-hidden relative"
          >
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
              
              <div className="flex items-center justify-end pt-4 border-t border-[var(--color-border)]">
                <span className="text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1 bg-[var(--color-surface-2)] px-2 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" /> {svc?.duration} min
                </span>
              </div>
              
              <Link
                to={isAuthenticated && svc?._id ? `/book?service=${svc._id}` : bookLink}
                className="mt-4 w-full py-2.5 bg-[var(--color-surface-2)] text-[var(--color-text-primary)] font-bold rounded-xl transition-all text-center block group-hover:bg-gradient-to-r group-hover:from-[var(--color-rose-500)] group-hover:to-[var(--color-rose-600)] group-hover:text-white group-hover:shadow-md"
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
