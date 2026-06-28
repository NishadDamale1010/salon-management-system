import { motion } from "framer-motion";
import { Star, ShoppingBag, Eye, Plus } from "lucide-react";

import { Badge } from "../ui/Badge";
import { formatCurrency } from "../../utils";
import ProductImage from "./ProductImage";

export default function ProductCard({ product, onViewDetails, onAddToCart }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(225,29,72,0.15)] hover:border-[var(--color-rose-500)]/40 flex flex-col h-full"
    >
      {/* Image Container - takes up top ~60% */}
      <div className="relative h-56 w-full overflow-hidden bg-gray-50/5 p-4 flex items-center justify-center">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-rose-500)]/0 to-[var(--color-rose-500)]/0 group-hover:from-[var(--color-rose-500)]/5 transition-all duration-300 z-0"></div>
        
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="rose" className="font-bold">
              {product.discount}% OFF
            </Badge>
          </div>
        )}
        <button className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[var(--color-text-muted)] hover:text-rose-500 hover:bg-white transition-all opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 duration-300">
          <Star className="w-4 h-4" />
        </button>

        <ProductImage
          product={product}
          className="w-full h-full object-contain relative z-10 drop-shadow-xl mix-blend-multiply"
        />

        {/* Quick actions on hover */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
          <button 
            onClick={() => onViewDetails(product)}
            className="px-4 py-2 bg-white text-gray-900 text-xs font-semibold rounded-full shadow-lg hover:bg-gray-100 flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" /> Quick View
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--color-rose-400)] bg-[var(--color-rose-500)]/10 px-2 py-0.5 rounded-full">
            {product.category}
          </span>
          <div className="flex items-center gap-0.5 text-yellow-400">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-medium text-[var(--color-text-primary)] ml-1">{product.rating || "5.0"}</span>
          </div>
        </div>

        <h3 className="font-display font-semibold text-[var(--color-text-primary)] text-sm line-clamp-2 leading-tight flex-1">
          {product.name}
        </h3>
        
        <p className="text-xs text-[var(--color-text-muted)] mt-1.5 mb-3">
          by <span className="font-medium text-[var(--color-text-primary)]">{product.brand}</span>
        </p>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-[var(--color-rose-400)]">{formatCurrency(product.price)}</span>
            {(product.stockQuantity ?? 0) < 1 && (
              <span className="text-[10px] text-red-400 font-medium">Out of stock</span>
            )}
          </div>

          <div className="flex gap-2">
            {onAddToCart && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                disabled={(product.stockQuantity ?? 0) < 1}
                className="flex-1 py-2.5 bg-[var(--color-rose-500)] text-white font-semibold rounded-xl text-sm transition-all hover:bg-[var(--color-rose-600)] disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            )}
            <button
              onClick={() => onViewDetails(product)}
              className={`${onAddToCart ? "flex-1" : "w-full"} py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold rounded-xl text-sm transition-all hover:border-[var(--color-rose-500)]/40 flex items-center justify-center gap-1.5`}
            >
              <Eye className="w-3.5 h-3.5" /> View
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
