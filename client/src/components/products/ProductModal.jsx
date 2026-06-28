import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Check, Info, ShieldCheck, Truck, Droplets } from "lucide-react";
import { formatCurrency } from "../../utils";
import { Badge } from "../ui/Badge";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { orderService } from "../../services";

export default function ProductModal({ product, isOpen, onClose }) {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isReserving, setIsReserving] = useState(false);
  
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  if (!isOpen || !product) return null;

  const images = product.gallery?.length > 0 ? product.gallery : [product.imageUrl || product.image];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-[var(--color-surface)] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-[var(--color-border)] z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-rose-500)] hover:border-[var(--color-rose-500)]/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Image Gallery */}
          <div className="w-full md:w-1/2 bg-gray-50/5 p-8 flex flex-col border-r border-[var(--color-border)]">
            <div className="relative flex-1 rounded-2xl bg-white/5 flex items-center justify-center p-8 mb-6 overflow-hidden group">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-contain max-h-[400px] drop-shadow-2xl mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge variant="rose" className="text-sm font-bold px-3 py-1">
                    {product.discount}% OFF
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${activeImage === idx ? 'border-[var(--color-rose-500)] shadow-md' : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'}`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover bg-white" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="w-full md:w-1/2 p-8 overflow-y-auto custom-scrollbar">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-rose-400)]">
                  {product.brand}
                </span>
                <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]"></span>
                <span className="text-xs text-[var(--color-text-muted)]">{product.category}</span>
              </div>
              
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] leading-tight mb-4">
                {product.name}
              </h2>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-sm text-[var(--color-text-primary)]">{product.rating || "4.8"}</span>
                </div>
                <span className="text-sm text-[var(--color-text-muted)] underline decoration-dashed underline-offset-4 cursor-pointer hover:text-[var(--color-rose-400)] transition-colors">
                  {product.reviewCount || 120} Reviews
                </span>
              </div>


            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[var(--color-text-muted)]" /> About this product
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {product.description}
                </p>
              </div>

              {product.benefits && (
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" /> Key Benefits
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {product.benefits}
                  </p>
                </div>
              )}

              {product.ingredients && (
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-400" /> Ingredients
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {product.ingredients}
                  </p>
                </div>
              )}

              {/* Badges / Guarantees */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-card)] p-2.5 rounded-xl border border-[var(--color-border)]">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Authentic Product
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-card)] p-2.5 rounded-xl border border-[var(--color-border)]">
                  <Truck className="w-4 h-4 text-[var(--color-rose-400)]" /> Used in Salon
                </div>
              </div>
            </div>

            {/* Sticky Action Bar for mobile / bottom of scroll */}
            <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex gap-4">
              <button 
                onClick={async () => {
                  if (!user) {
                    toast.error("Please login to reserve products");
                    navigate("/login");
                    return;
                  }
                  
                  try {
                    setIsReserving(true);
                    await orderService.create({ productId: product._id, quantity });
                    toast.success("Product reserved successfully! You can pick it up at the salon.");
                    onClose();
                  } catch (error) {
                    toast.error(error?.response?.data?.message || "Failed to reserve product");
                  } finally {
                    setIsReserving(false);
                  }
                }}
                disabled={isReserving || product.stockQuantity < 1}
                className="flex-1 py-4 bg-gradient-to-r from-[var(--color-rose-500)] to-[var(--color-rose-600)] hover:from-[var(--color-rose-400)] hover:to-[var(--color-rose-500)] text-white font-bold rounded-2xl transition-all shadow-[0_4px_14px_rgba(244,63,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isReserving ? "Reserving..." : product.stockQuantity < 1 ? "Out of Stock" : "Reserve for Pickup"}
              </button>
              
              <div className="flex bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-14 text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors flex items-center justify-center"
                >-</button>
                <div className="w-12 h-14 flex items-center justify-center font-bold text-[var(--color-text-primary)] border-x border-[var(--color-border)]">
                  {quantity}
                </div>
                <button 
                  onClick={() => setQuantity(Math.min(product.stockQuantity || 1, quantity + 1))}
                  className="w-12 h-14 text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors flex items-center justify-center"
                >+</button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
