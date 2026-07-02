import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Check, X, Sparkles } from "lucide-react";
import { rewardService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { toast } from "sonner";

export default function Rewards() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", glowPointsRequired: "", discountAmount: "", minimumBill: "", isActive: true });


  const { data } = useQuery({ queryKey: QUERY_KEYS.REWARDS, queryFn: rewardService.getAll });
  const { data: redemptionsData } = useQuery({ queryKey: QUERY_KEYS.ALL_REDEMPTIONS, queryFn: rewardService.getAllRedemptions });
  const rewards = data?.data || [];
  const redemptions = redemptionsData?.data || [];

  const { mutate: create } = useMutation({ mutationFn: rewardService.create, onSuccess: () => { toast.success("Reward created!"); qc.invalidateQueries({ queryKey: QUERY_KEYS.REWARDS }); setModal(null); setForm({ title: "", description: "", glowPointsRequired: "", discountAmount: "", minimumBill: "", isActive: true }); }, onError: err => toast.error(err.message) });
  const { mutate: update } = useMutation({ mutationFn: ({ id, data }) => rewardService.update(id, data), onSuccess: () => { toast.success("Updated!"); qc.invalidateQueries({ queryKey: QUERY_KEYS.REWARDS }); setModal(null); }, onError: err => toast.error(err.message) });
  const { mutate: del } = useMutation({ mutationFn: rewardService.delete, onSuccess: () => { toast.success("Deleted!"); qc.invalidateQueries({ queryKey: QUERY_KEYS.REWARDS }); }, onError: err => toast.error(err.message) });
  const { mutate: updateRedemption } = useMutation({ mutationFn: ({ id, data }) => rewardService.updateRedemptionStatus(id, data), onSuccess: () => { toast.success("Redemption updated!"); qc.invalidateQueries({ queryKey: QUERY_KEYS.ALL_REDEMPTIONS }); setRedeemModal(null); }, onError: err => toast.error(err.message) });

  const handleSubmit = () => {
    const p = { ...form, glowPointsRequired: Number(form.glowPointsRequired), discountAmount: Number(form.discountAmount), minimumBill: Number(form.minimumBill) };
    if (modal === "create") create(p);
    else update({ id: modal._id, data: p });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">Rewards Management</h1></div>
        <button onClick={() => { setForm({ title: "", description: "", glowPointsRequired: "", discountAmount: "", minimumBill: "", isActive: true }); setModal("create"); }} className="flex items-center gap-2 px-5 py-2.5 -white text-sm font-medium rounded-xl transition-all">
          <Plus className="w-4 h-4" /> Add Reward
        </button>
      </div>

      {/* Rewards Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map(r => (
          <div key={r._id} className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-display font-semibold text-[var(--color-text-primary)]">{r.title}</h3>
              <div className="flex gap-1">
                <button onClick={() => { setForm({ ...r, glowPointsRequired: r.glowPointsRequired, discountAmount: r.discountAmount, minimumBill: r.minimumBill }); setModal(r); }} className="p-1.5 hover:bg-[var(--color-rose-500)]/5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => del(r._id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">{r.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm"><Sparkles className="w-3.5 h-3.5" />{r.glowPointsRequired} pts</div>
              <div className="flex items-center gap-2">
                <Badge variant="ghost">Discount: ₹{r.discountAmount}</Badge>
                <Badge variant={r.isActive ? "success" : "error"}>{r.isActive ? "Active" : "Off"}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Redemptions */}
      {redemptions.filter(r => r.status === "Pending").length > 0 && (
        <div>
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Pending Redemptions</h2>
          <div className="space-y-2">
            {redemptions.filter(r => r.status === "Pending").map(r => (
              <div key={r._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--color-surface-card)] border border-yellow-500/20">
                <div>
                  <p className="text-sm text-[var(--color-text-primary)] font-medium">{r.user?.firstName} {r.user?.lastName}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{r.reward?.title}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateRedemption({ id: r._id, data: { status: "Success" } })} className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"><Check className="w-4 h-4" /></button>
                  <button onClick={() => updateRedemption({ id: r._id, data: { status: "Rejected" } })} className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"><X className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "create" ? "Create Reward" : "Edit Reward"}>
        <div className="space-y-4">
          {[
            { key: "title", label: "Reward Title", placeholder: "Free Facial" },
            { key: "description", label: "Description", placeholder: "One free facial session" },
            { key: "glowPointsRequired", label: "Points Required", type: "number", placeholder: "500" },
            { key: "discountAmount", label: "Discount Amount (₹)", type: "number", placeholder: "100" },
            { key: "minimumBill", label: "Minimum Bill (₹)", type: "number", placeholder: "0" },
          ].map(({ key, label, type = "text", placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{label}</label>
              <input value={form[key] || ""} type={type} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] transition-all text-sm"
              />
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl">Cancel</button>
            <button onClick={handleSubmit} className="flex-1 py-2.5 -white font-medium rounded-xl transition-all">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
