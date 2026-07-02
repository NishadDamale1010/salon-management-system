import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { cmsService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { GALLERY_CATEGORIES } from "../../constants";

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { data, isLoading } = useQuery({ queryKey: QUERY_KEYS.GALLERY, queryFn: cmsService.getGallery });
  const gallery = data?.data || [];
  const filtered = activeCategory === "All" ? gallery : gallery.filter(g => g.category === activeCategory);

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4">Our <span className="text-gradient-rose">Gallery</span></motion.h1>
          <p className="text-[var(--color-text-muted)]">Our finest beauty transformations</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {["All", ...GALLERY_CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? "bg-[var(--color-rose-600)] text-white" : "bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"}`}
            >{cat}</button>
          ))}
        </div>
        {isLoading ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="break-inside-avoid aspect-square rounded-2xl skeleton mb-4" />)}</div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((item, i) => (
              <motion.div key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer mb-4">
                <img src={item.image} alt={item.title} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </motion.div>
            ))}
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20 text-[var(--color-text-muted)]">No images found for this category</div>
        )}
      </div>
    </div>
  );
}
