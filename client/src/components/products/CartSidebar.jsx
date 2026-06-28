import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Trash2, Minus, Plus, Clock, CheckCircle, Package } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { orderService } from "../../services";
import { formatCurrency, formatDate } from "../../utils";
import { Badge } from "../ui/Badge";
import { toast } from "sonner";

export default function CartSidebar() {
  const queryClient = useQueryClient();
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCartStore();
  const [activeTab, setActiveTab] = useState("cart");

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: orderService.getMyOrders,
  });
  const orders = ordersData?.data || [];

  const { mutate: checkout, isPending } = useMutation({
    mutationFn: async () => {
      for (const item of items) {
        await orderService.create({ productId: item.product._id, quantity: item.quantity });
      }
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      setActiveTab("reserved");
      toast.success("Products reserved! Pick them up at the salon.");
    },
    onError: (err) => toast.error(err.message || "Failed to reserve products"),
  });

  const cartTotal = getTotal();
  const cartCount = getItemCount();

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 lg:sticky lg:top-4 lg:self-start">
      <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]">
        <div className="flex border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab("cart")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "cart" ? "text-[var(--color-rose-500)] border-b-2 border-[var(--color-rose-500)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"}`}
          >
            Cart {cartCount > 0 && `(${cartCount})`}
          </button>
          <button
            onClick={() => setActiveTab("reserved")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "reserved" ? "text-[var(--color-rose-500)] border-b-2 border-[var(--color-rose-500)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"}`}
          >
            Reserved
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === "cart" ? (
            items.length === 0 ? (
              <div className="text-center py-10">
                <ShoppingBag className="w-10 h-10 mx-auto text-[var(--color-text-muted)] mb-3 opacity-40" />
                <p className="text-sm text-[var(--color-text-muted)]">Your cart is empty</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Add products to reserve for pickup</p>
              </div>
            ) : (
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.product._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-3 p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                  >
                    {item.product.imageUrl || item.product.image ? (
                      <img
                        src={item.product.imageUrl || item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-[var(--color-surface-3)] flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-[var(--color-text-muted)]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-[var(--color-rose-400)] font-semibold mt-0.5">{formatCurrency(item.product.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="w-6 h-6 rounded-md border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product.stockQuantity || 99)}
                          className="w-6 h-6 rounded-md border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.product._id)}
                          className="ml-auto p-1 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )
          ) : ordersLoading ? (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-8">Loading...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-10">
              <Clock className="w-10 h-10 mx-auto text-[var(--color-text-muted)] mb-3 opacity-40" />
              <p className="text-sm text-[var(--color-text-muted)]">No reserved products yet</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--color-text-muted)]">{formatDate(order.createdAt)}</p>
                  <Badge variant={order.status === "Completed" ? "success" : order.status === "Cancelled" ? "error" : "warning"}>
                    {order.status === "Pending" && <Clock className="w-3 h-3 mr-1 inline" />}
                    {order.status === "Completed" && <CheckCircle className="w-3 h-3 mr-1 inline" />}
                    {order.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {order.product?.imageUrl ? (
                    <img src={order.product.imageUrl} alt={order.product.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-3)] flex items-center justify-center">
                      <Package className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-1">{order.product?.name || "Product"}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Qty: {order.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {activeTab === "cart" && items.length > 0 && (
          <div className="p-4 border-t border-[var(--color-border)] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-text-muted)]">Total</span>
              <span className="text-lg font-bold text-[var(--color-rose-400)]">{formatCurrency(cartTotal)}</span>
            </div>
            <button
              onClick={() => checkout()}
              disabled={isPending}
              className="w-full py-3 bg-gradient-to-r from-[var(--color-rose-500)] to-[var(--color-rose-600)] text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Reserve for Pickup
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
