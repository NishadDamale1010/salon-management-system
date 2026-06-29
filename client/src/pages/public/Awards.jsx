import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { cmsService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";

export default function Awards() {
  const { data, isLoading } = useQuery({ queryKey: QUERY_KEYS.AWARDS, queryFn: cmsService.getAwards });
  const awards = data?.data || [];
  return (
    <div className="min-h-screen bg-[var(--color-surface)] pt-8 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl font-bold text-[var(--color-text-primary)] mb-4">Our <span className="text-gradient-gold">Awards & Certificates</span></motion.h1>
          <p className="text-[var(--color-text-muted)]">Recognitions of our excellence and commitment to quality</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-60 rounded-2xl skeleton" />) :
            awards.map((award, i) => {
              return (
                <motion.div key={award._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl overflow-hidden bg-[var(--color-surface-card)] border border-[var(--color-border)]"
                >
                  {award.image && (
                    <div className="overflow-hidden rounded-t-2xl">
                      <img src={award.image} alt={award.title} className="w-full h-auto" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-display font-bold text-[var(--color-text-primary)] text-xl mb-2">{award.title}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{award.description}</p>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
