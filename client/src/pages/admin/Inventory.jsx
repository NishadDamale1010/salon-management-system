import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { inventoryService, aiService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { toast } from "sonner";
import { Sparkles, Trash2 } from "lucide-react";

export default function Inventory() {
  const qc = useQueryClient();
  const [txModal, setTxModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [parsedProducts, setParsedProducts] = useState(null);
  const emptyProductForm = { name: "", sku: "", brand: "", category: "", description: "", size: "", keyIngredients: "", benefits: "", unit: "", stockQuantity: 0, lowStockThreshold: 5, imageUrl: "" };
  const [form, setForm] = useState(emptyProductForm);
  const [tx, setTx] = useState({ type: "Restock", quantity: 1, reason: "" });

  const { data, isLoading } = useQuery({ queryKey: QUERY_KEYS.INVENTORY, queryFn: inventoryService.getProducts });
  const products = data?.data || [];

  const normalizeProductForm = (data) => ({
    ...data,
    stockQuantity: Number(data.stockQuantity),
    lowStockThreshold: Number(data.lowStockThreshold),
    keyIngredients: data.keyIngredients ? (typeof data.keyIngredients === 'string' ? data.keyIngredients.split(",").map(item => item.trim()).filter(Boolean) : data.keyIngredients) : [],
    benefits: data.benefits ? (typeof data.benefits === 'string' ? data.benefits.split(",").map(item => item.trim()).filter(Boolean) : data.benefits) : [],
  });

  const { mutate: create } = useMutation({ mutationFn: (data) => inventoryService.createProduct(normalizeProductForm(data)), onSuccess: () => { toast.success("Product created!"); qc.invalidateQueries({ queryKey: QUERY_KEYS.INVENTORY }); setCreateModal(false); }, onError: err => toast.error(err.message) });
  const { mutate: update } = useMutation({ mutationFn: ({ id, data }) => inventoryService.updateProduct(id, normalizeProductForm(data)), onSuccess: () => { toast.success("Product updated!"); qc.invalidateQueries({ queryKey: QUERY_KEYS.INVENTORY }); setCreateModal(false); setEditId(null); }, onError: err => toast.error(err.message) });
  const { mutate: logTx } = useMutation({ mutationFn: ({ id, data }) => inventoryService.logTransaction(id, data), onSuccess: () => { toast.success("Stock updated!"); qc.invalidateQueries({ queryKey: QUERY_KEYS.INVENTORY }); setTxModal(null); }, onError: err => toast.error(err.message) });

  const updateParsedProduct = (index, field, value) => {
    const updated = [...parsedProducts];
    updated[index][field] = value;
    setParsedProducts(updated);
  };

  const { mutate: parseAI, isPending: isParsing } = useMutation({
    mutationFn: () => aiService.parseProducts(bulkText),
    onSuccess: (res) => {
      setParsedProducts(res.data);
      toast.success("AI parsed products successfully!");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "AI failed to parse text"),
  });

  const { mutate: saveBulk, isPending: isSavingBulk } = useMutation({
    mutationFn: () => inventoryService.createBulkProducts(parsedProducts),
    onSuccess: (res) => {
      toast.success(res.message || "Bulk products added!");
      qc.invalidateQueries({ queryKey: QUERY_KEYS.INVENTORY });
      setBulkModal(false);
      setBulkText("");
      setParsedProducts(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to save bulk products"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">Inventory</h1><p className="text-[var(--color-text-muted)] text-sm">{products.length} products</p></div>
        <div className="flex items-center gap-3">
          <button onClick={() => setBulkModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-surface-card)] border border-[var(--color-rose-300)] text-[var(--color-rose-600)] text-sm font-bold rounded-xl transition-all hover:bg-[var(--color-rose-50)]">
            <Sparkles className="w-4 h-4" /> AI Bulk Entry
          </button>
          <button onClick={() => { setForm(emptyProductForm); setEditId(null); setCreateModal(true); }} className="flex items-center gap-2 px-5 py-2.5 -white text-sm font-medium rounded-xl transition-all">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? <div className="text-center py-10 text-[var(--color-text-muted)]">Loading...</div> :
          products.map((p, i) => {
            const isLow = p.stockQuantity <= p.lowStockThreshold;
            const pct = Math.min(100, (p.stockQuantity / (p.lowStockThreshold * 4)) * 100);
            return (
              <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5"
              >
                <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                  <div className="flex gap-4">
                    {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-xl border border-[var(--color-border)]" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[var(--color-text-primary)]">{p.name}</h3>
                        {isLow && <Badge variant="error">Low Stock!</Badge>}
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)]">SKU: {p.sku} · {p.brand || "Salon Product"} · {p.category}{p.size ? ` · ${p.size}` : ""}</p>
                      {p.description && <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-3xl">{p.description}</p>}
                      {p.keyIngredients?.length > 0 && <p className="text-xs text-[var(--color-text-muted)] mt-2">Key ingredients: {p.keyIngredients.join(", ")}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-2">
                      <p className="text-xl font-bold text-[var(--color-text-primary)]">{p.stockQuantity}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{p.unit}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => { setTxModal(p); setTx({ type: "Restock", quantity: 1, reason: "" }); }} className="px-3 py-1.5 bg-[var(--color-rose-600)]/10 border border-[var(--color-rose-500)]/30 text-[var(--color-rose-400)] text-xs rounded-lg hover:bg-[var(--color-rose-600)]/20 transition-all font-medium">
                        Stock
                      </button>
                      <button onClick={() => { 
                        setForm({ ...emptyProductForm, ...p, keyIngredients: p.keyIngredients?.join(", ") || "", benefits: p.benefits?.join(", ") || "" }); 
                        setEditId(p._id); 
                        setCreateModal(true); 
                      }} className="px-3 py-1.5 bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs rounded-lg hover:bg-[var(--color-surface-4)] transition-all font-medium">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-[var(--color-surface-3)] rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${isLow ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Threshold: {p.lowStockThreshold} {p.unit}</p>
              </motion.div>
            );
          })}
      </div>

      <Modal open={!!txModal} onClose={() => setTxModal(null)} title={`Update Stock — ${txModal?.name}`}>
        <div className="space-y-4">
          <div className="flex gap-2">
            {["Restock", "Usage"].map(t => (
              <button key={t} onClick={() => setTx(tx => ({ ...tx, type: t }))}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${tx.type === t ? (t === "Restock" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400") : "border-[var(--color-border)] text-[var(--color-text-muted)]"}`}
              >{t}</button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Quantity</label>
            <input type="number" min={1} value={tx.quantity} onChange={e => setTx(t => ({ ...t, quantity: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-rose-500)] transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Reason (Optional)</label>
            <input value={tx.reason} onChange={e => setTx(t => ({ ...t, reason: e.target.value }))} placeholder="e.g. Monthly restock"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] transition-all text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setTxModal(null)} className="flex-1 py-2.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl">Cancel</button>
            <button onClick={() => logTx({ id: txModal._id, data: tx })} className="flex-1 py-2.5 -white font-medium rounded-xl transition-all">Apply</button>
          </div>
        </div>
      </Modal>

      <Modal open={createModal} onClose={() => { setCreateModal(false); setEditId(null); }} title={editId ? "Edit Product" : "Add Product"}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {[
            { key: "name", label: "Product Name", placeholder: "Shampoo Premium" },
            { key: "sku", label: "SKU", placeholder: "SHMP-001" },
            { key: "brand", label: "Brand", placeholder: "SSCP Herbals" },
            { key: "category", label: "Category", placeholder: "Hair Care" },
            { key: "imageUrl", label: "Image URL", placeholder: "https://example.com/image.jpg" },
            { key: "description", label: "Description", placeholder: "Short product description" },
            { key: "size", label: "Size", placeholder: "200 ml" },
            { key: "keyIngredients", label: "Key Ingredients", placeholder: "Aloe Vera, Neem, Tea Tree" },
            { key: "benefits", label: "Benefits", placeholder: "Paraben free, pH balanced" },
            { key: "unit", label: "Unit", placeholder: "bottles" },
            { key: "stockQuantity", label: "Initial Stock", type: "number", placeholder: "20" },
            { key: "lowStockThreshold", label: "Low Stock Alert At", type: "number", placeholder: "5" },
          ].map(({ key, label, type = "text", placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{label}</label>
              <input value={form[key] || ""} type={type} onChange={e => setForm(f => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))} placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] transition-all text-sm"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-[var(--color-surface-card)]">
            <button onClick={() => { setCreateModal(false); setEditId(null); }} className="flex-1 py-2.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl">Cancel</button>
            <button onClick={() => editId ? update({ id: editId, data: form }) : create(form)} className="flex-1 py-2.5 -white font-medium rounded-xl transition-all">{editId ? "Save Changes" : "Create"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={bulkModal} onClose={() => { setBulkModal(false); setParsedProducts(null); setBulkText(""); }} title="AI Bulk Product Entry">
        <div className="space-y-4">
          {!parsedProducts ? (
            <>
              <p className="text-sm text-[var(--color-text-muted)]">
                Paste your product list below (e.g. from an invoice or notes). Our AI will extract the details automatically.
              </p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="E.g. 5 bottles of L'Oreal shampoo for 500rs each, 10 tubes of Nivea face wash 200rs..."
                className="w-full h-40 px-4 py-3 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] transition-all text-sm resize-none"
              />
              <div className="flex gap-3">
                <button onClick={() => setBulkModal(false)} className="flex-1 py-2.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl">Cancel</button>
                <button onClick={() => parseAI()} disabled={isParsing || !bulkText} className="flex-1 py-2.5 -white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isParsing ? "Extracting..." : <><Sparkles className="w-4 h-4" /> Parse Products</>}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-emerald-600 font-semibold mb-2">
                Successfully parsed {parsedProducts.length} products! Review below:
              </p>
              <div className="max-h-80 overflow-y-auto space-y-3 bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)] p-3">
                {parsedProducts.map((p, i) => (
                  <div key={i} className="flex flex-col text-sm border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-[var(--color-text-primary)]">{p.name}</span>
                        <div className="text-xs text-[var(--color-text-muted)]">Brand: {p.brand} | Cat: {p.category} | SKU: {p.sku}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold">₹{p.price}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{p.stockQuantity} {p.unit}</div>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Image URL (optional)"
                      value={p.imageUrl || ""}
                      onChange={(e) => updateParsedProduct(i, 'imageUrl', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] text-xs transition-all"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setParsedProducts(null)} className="flex-1 py-2.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl">Edit Text</button>
                <button onClick={() => saveBulk()} disabled={isSavingBulk} className="flex-1 py-2.5 -white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSavingBulk ? "Saving..." : "Confirm & Save"}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
