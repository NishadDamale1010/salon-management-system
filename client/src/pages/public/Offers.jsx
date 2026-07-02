import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { cmsService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";

export default function Offers() {
  const { data, isLoading } = useQuery({ queryKey: QUERY_KEYS.OFFERS, queryFn: cmsService.getOffers });
  const offers = data?.data || [];
  return (
    <div className="min-h-screen bg-[var(--color-surface)] pt-8 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4">Special <span className="text-gradient-gold">Offers</span></motion.h1>
          <p className="text-[var(--color-text-muted)]">Limited-time deals you don't want to miss</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {isLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-60 rounded-2xl skeleton" />) :
            offers.map((offer, i) => {
              const daysLeft = Math.max(0, Math.ceil((new Date(offer.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
              return (
                <motion.div key={offer._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl overflow-hidden bg-[var(--color-surface-card)] border border-[var(--color-border)]"
                >
                  {offer.bannerImage && <img src={offer.bannerImage} alt={offer.title} className="w-full h-44 object-cover" />}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 rounded-full font-bold text-sm">{offer.discountText}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">Expires in {daysLeft} days</span>
                    </div>
                    <h3 className="font-display font-bold text-[var(--color-text-primary)] text-xl mb-2">{offer.title}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{offer.description}</p>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
