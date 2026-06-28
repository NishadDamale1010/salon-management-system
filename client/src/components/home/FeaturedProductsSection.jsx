import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import ProductImage from "../products/ProductImage";

export default function FeaturedProductsSection({ products = [] }) {
  if (!products.length) return null;

  const featured = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const score = (p) =>
          (p.isFeatured ? 2 : 0) +
          (p.imageUrl ? 1 : 0) +
          (p.image ? 0.5 : 0);
        return score(b) - score(a);
      })
      .slice(0, 4);
  }, [products]);

  return (
    <section className="py-12 relative">
      <div className="text-center mb-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[var(--color-rose-500)] text-sm font-bold tracking-[0.2em] uppercase mb-4"
        >Our Store</motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl font-bold text-[var(--color-text-primary)]"
        >
          Premium <span className="text-rose-500">Products</span>
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map((p, i) => (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -10 }}
            className="group rounded-3xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 hover:border-[var(--color-rose-400)] hover:shadow-[0_20px_40px_-15px_rgba(255,105,180,0.15)] transition-all overflow-hidden relative flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-rose-500)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative w-full h-48 mb-5 bg-[var(--color-surface)] rounded-2xl overflow-hidden flex items-center justify-center p-2">
              <ProductImage
                product={p}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 mix-blend-multiply"
                containerClassName="w-full h-full"
              />
              {p.discount > 0 && (
                <div className="absolute top-2 right-2 bg-[var(--color-rose-500)] text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                  {p.discount}% OFF
                </div>
              )}
            </div>

            <div className="relative z-10 flex flex-col flex-1">
              <p className="text-[10px] font-bold text-[var(--color-rose-500)] uppercase tracking-wider mb-1">{p.brand || "Salon Product"}</p>
              <h3 className="font-display font-bold text-[var(--color-text-primary)] text-lg mb-2 line-clamp-2 leading-tight">{p.name}</h3>
              <p className="text-xs text-[var(--color-text-muted)] mb-4 line-clamp-2 flex-1">{p.description}</p>
              
              <div className="flex items-center justify-end pt-4 border-t border-[var(--color-border)]">
                <Link
                  to="/products"
                  className="w-10 h-10 rounded-full bg-[var(--color-rose-500)] text-white flex items-center justify-center hover:scale-110 hover:shadow-lg transition-transform"
                >
                  <ShoppingBag className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="text-center mt-12"
      >
        <Link to="/products" className="inline-flex items-center gap-2 text-[var(--color-rose-500)] hover:text-[var(--color-rose-400)] font-bold text-base transition-colors group">
          Shop All Products
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </section>
  );
}
