import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Clock, Sparkles } from "lucide-react";
import { serviceService, uploadService, aiService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { formatCurrency } from "../../utils";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { toast } from "sonner";

const emptyForm = { name: "", description: "", price: "", duration: "", category: "", isActive: true };

export default function Services() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | 'create' | service object
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const [bulkModal, setBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [parsedServices, setParsedServices] = useState(null);

  const { data } = useQuery({ queryKey: QUERY_KEYS.SERVICES, queryFn: serviceService.getAll });
  const services = data?.data || [];

  const { mutate: createSvc, isPending: creating } = useMutation({
    mutationFn: serviceService.create,
    onSuccess: () => { toast.success("Service created!"); qc.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES }); setModal(null); setForm(emptyForm); },
    onError: (err) => toast.error(err.message),
  });
  const { mutate: updateSvc, isPending: updating } = useMutation({
    mutationFn: ({ id, data }) => serviceService.update(id, data),
    onSuccess: () => { toast.success("Service updated!"); qc.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES }); setModal(null); },
    onError: (err) => toast.error(err.message),
  });
  const { mutate: deleteSvc } = useMutation({
    mutationFn: serviceService.delete,
    onSuccess: () => { toast.success("Service deleted!"); qc.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES }); },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: parseAI, isPending: isParsing } = useMutation({
    mutationFn: () => aiService.parseServices(bulkText),
    onSuccess: (res) => {
      setParsedServices(res.data);
      toast.success("AI parsed services successfully!");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "AI failed to parse text"),
  });

  const { mutate: saveBulk, isPending: isSavingBulk } = useMutation({
    mutationFn: () => serviceService.createBulkServices(parsedServices),
    onSuccess: (res) => {
      toast.success(res.message || "Bulk services added!");
      qc.invalidateQueries({ queryKey: QUERY_KEYS.SERVICES });
      setBulkModal(false);
      setBulkText("");
      setParsedServices(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to save bulk services"),
  });

  const openCreate = () => { setForm(emptyForm); setModal("create"); };
  const openEdit = (svc) => { setForm({ ...svc, price: svc.price, duration: svc.duration }); setModal(svc); };

  const handleImageUpload = async (e, isBulk = false, bulkIndex = null) => {
    const input = e.target;
    const files = input ? Array.from(input.files || []) : Array.from(e);
    if (!files.length) return;

    const imageFiles = files.filter(file => file.type.startsWith("image/"));
    if (!imageFiles.length) {
      toast.error("Only image files can be uploaded");
      return;
    }

    setUploading(true);
    try {
      const res = await uploadService.uploadImage(imageFiles[0]);
      const url = res.data.url;
      
      if (isBulk) {
        const updated = [...parsedServices];
        updated[bulkIndex].image = url;
        setParsedServices(updated);
      } else {
        setForm(f => ({ ...f, image: url }));
      }
      toast.success("Image uploaded!");
    } catch { toast.error("Image upload failed"); }
    finally { setUploading(false); if (input) input.value = ""; }
  };

  const handleSubmit = () => {
    const payload = { ...form, price: Number(form.price), duration: Number(form.duration) };
    if (modal === "create") createSvc(payload);
    else updateSvc({ id: modal._id, data: payload });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">Services</h1><p className="text-[var(--color-text-muted)] text-sm">{services.length} services</p></div>
        <div className="flex items-center gap-3">
          <button onClick={() => setBulkModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-surface-card)] border border-[var(--color-rose-300)] text-[var(--color-rose-600)] text-sm font-bold rounded-xl transition-all hover:bg-[var(--color-rose-50)]">
            <Sparkles className="w-4 h-4" /> AI Bulk Entry
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 -white text-sm font-medium rounded-xl transition-all">
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--color-surface-2)]">
            <tr>{["Service", "Category", "Price", "Duration", "Status", ""].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {services.map((svc, i) => (
              <motion.tr key={svc._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="border-t border-[var(--color-border)] bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-3)] transition-colors"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    {svc.image ? <img src={svc.image} alt={svc.name} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-3)] flex items-center justify-center"><Sparkles className="w-4 h-4 text-[var(--color-rose-400)]" /></div>}
                    <span className="font-medium text-[var(--color-text-primary)] text-sm">{svc.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-[var(--color-text-muted)]">{svc.category || "—"}</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-[var(--color-rose-400)]">{formatCurrency(svc.price)}</td>
                <td className="px-4 py-3.5 text-sm text-[var(--color-text-muted)] flex items-center gap-1"><Clock className="w-3 h-3" />{svc.duration}min</td>
                <td className="px-4 py-3.5"><Badge variant={svc.isActive ? "success" : "error"}>{svc.isActive ? "Active" : "Inactive"}</Badge></td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(svc)} className="p-1.5 rounded-lg hover:bg-[var(--color-rose-500)]/5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteSvc(svc._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "create" ? "Add Service" : "Edit Service"}>
        <div className="space-y-4">
          {[
            { key: "name", label: "Service Name", placeholder: "e.g. Hair Spa" },
            { key: "category", label: "Category", placeholder: "e.g. Hair" },
            { key: "price", label: "Price (₹)", type: "number", placeholder: "899" },
            { key: "duration", label: "Duration (minutes)", type: "number", placeholder: "60" },
          ].map(({ key, label, type = "text", placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{label}</label>
              <input value={form[key] || ""} type={type} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] transition-all text-sm"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Description</label>
            <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Service description..."
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] transition-all text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Image</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} className="text-sm text-[var(--color-text-muted)]" />
            {form.image && <img src={form.image} alt="" className="mt-2 w-24 h-16 object-cover rounded-lg" />}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl">Cancel</button>
            <button onClick={handleSubmit} disabled={creating || updating || uploading} className="flex-1 py-2.5 -white font-medium rounded-xl transition-all disabled:opacity-50">
              {creating || updating ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={bulkModal} onClose={() => { setBulkModal(false); setParsedServices(null); setBulkText(""); }} title="AI Bulk Service Entry">
        <div className="space-y-4">
          {!parsedServices ? (
            <>
              <p className="text-sm text-[var(--color-text-muted)]">
                Paste your service list below (e.g. from notes or menu). Our AI will extract the details automatically.
              </p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="E.g. Haircut 500 takes 30 mins, Basic Facial 1000 takes 60 mins..."
                className="w-full h-40 px-4 py-3 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] transition-all text-sm resize-none"
              />
              <div className="flex gap-3">
                <button onClick={() => setBulkModal(false)} className="flex-1 py-2.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl">Cancel</button>
                <button onClick={() => parseAI()} disabled={isParsing || !bulkText} className="flex-1 py-2.5 -white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isParsing ? "Extracting..." : <><Sparkles className="w-4 h-4" /> Parse Services</>}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-emerald-600 font-semibold mb-2">
                Successfully parsed {parsedServices.length} services! Review below:
              </p>
              <div className="max-h-80 overflow-y-auto space-y-3 bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)] p-3">
                {parsedServices.map((s, i) => (
                  <div key={i} className="flex flex-col text-sm border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-[var(--color-text-primary)]">{s.name}</span>
                        <div className="text-xs text-[var(--color-text-muted)]">Category: {s.category}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold">₹{s.price}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{s.duration} mins</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                       <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true, i)} className="text-xs text-[var(--color-text-muted)]" />
                       {s.image && <img src={s.image} alt="preview" className="w-8 h-8 rounded object-cover" />}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setParsedServices(null)} className="flex-1 py-2.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl">Edit Text</button>
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
