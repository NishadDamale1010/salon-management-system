import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package } from "lucide-react";
import { inventoryService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import ProductCard from "../../components/products/ProductCard";
import ProductModal from "../../components/products/ProductModal";
import CartSidebar from "../../components/products/CartSidebar";
import { useCartStore } from "../../store/cartStore";
import { toast } from "sonner";

const CATEGORIES = ["All", "Hair Care", "Skin Care", "Makeup", "Body Care", "Facial", "Bridal"];
const SORTS = [
  { id: "default", label: "Most Popular" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
];

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const addItem = useCartStore((s) => s.addItem);

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.PRODUCTS,
    queryFn: () => inventoryService.getProducts(),
  });

  const products = data?.data || [];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedSort === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (selectedSort === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (selectedSort === "newest") result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (selectedSort === "rating") result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

    return result;
  }, [products, searchQuery, selectedCategory, selectedSort]);

  const handleAddToCart = (product, quantity = 1) => {
    if ((product.stockQuantity ?? 0) < 1) {
      toast.error("This product is out of stock");
      return;
    }
    addItem(product, quantity);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">Shop Products</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">Browse products and reserve for salon pickup</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] focus:border-[var(--color-rose-500)] outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2.5 px-3 bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="py-2.5 px-3 bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <ProductCard
                      product={product}
                      onViewDetails={setSelectedProduct}
                      onAddToCart={handleAddToCart}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-16 bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl">
              <Package className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3 opacity-50" />
              <p className="text-[var(--color-text-primary)] font-medium">No products found</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                className="mt-4 px-4 py-2 text-sm bg-[var(--color-rose-500)] text-white rounded-xl"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        <CartSidebar />
      </div>

      <ProductModal
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
