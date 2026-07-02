import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Calendar, Gift, Minus, Plus } from "lucide-react";
import { adminService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { formatDate, formatCurrency, getInitials, getMembershipColor } from "../../utils";
import { Badge } from "../../components/ui/Badge";
import { useState } from "react";
import { toast } from "sonner";

export default function CustomerDetails() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: QUERY_KEYS.CUSTOMER(id), queryFn: () => adminService.getCustomer(id) });
  const customer = data?.data;

  const [pointsInput, setPointsInput] = useState({ action: "add", points: 0, reason: "" });
  const { mutate: managePoints } = useMutation({
    mutationFn: () => adminService.manageGlowPoints(id, pointsInput),
    onSuccess: () => { toast.success("Points updated!"); qc.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER(id) }); },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <div className="text-center py-20 text-[var(--color-text-muted)]">Loading...</div>;
  if (!customer) return <div className="text-center py-20 text-[var(--color-text-muted)]">Customer not found</div>;

  const u = customer.customer;
  const appointments = customer.appointments || [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/customers" className="p-2 rounded-xl hover:bg-[var(--color-rose-500)]/5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">Customer Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-rose-600)] to-purple-700 flex items-center justify-center text-[var(--color-text-primary)] text-2xl font-bold mx-auto mb-3">
            {getInitials(u.firstName, u.lastName)}
          </div>
          <h2 className="font-display font-bold text-[var(--color-text-primary)] text-lg">{u.firstName} {u.lastName}</h2>
          <p className="text-sm text-[var(--color-text-muted)]">{u.email}</p>
          <p className="text-xs mt-1" style={{ color: getMembershipColor(u.membership) }}>{u.membership} Member</p>
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] grid grid-cols-2 gap-3">
            <div className="text-center"><p className="font-display text-2xl font-bold text-gradient-rose">{u.glowPoints}</p><p className="text-xs text-[var(--color-text-muted)]">Points</p></div>
            <div className="text-center"><p className="font-display text-2xl font-bold text-[var(--color-text-primary)]">{u.lifetimeGlowPoints}</p><p className="text-xs text-[var(--color-text-muted)]">Lifetime</p></div>
          </div>
        </div>

        {/* Glow Points Manager */}
        <div className="md:col-span-2 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-6 space-y-4">
          <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-400" /> Manage Glow Points</h3>
          <div className="flex gap-2">
            {["add", "deduct"].map(action => (
              <button key={action} onClick={() => setPointsInput(p => ({ ...p, action }))}
                className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all border ${pointsInput.action === action ? (action === "add" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400") : "border-[var(--color-border)] text-[var(--color-text-muted)]"}`}
              >{action === "add" ? "Add Points" : "Deduct Points"}</button>
            ))}
          </div>
          <input type="number" placeholder="Points amount" value={pointsInput.points} onChange={e => setPointsInput(p => ({ ...p, points: Number(e.target.value) }))}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] transition-all text-sm"
          />
          <input type="text" placeholder="Reason (optional)" value={pointsInput.reason} onChange={e => setPointsInput(p => ({ ...p, reason: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] transition-all text-sm"
          />
          <button onClick={() => managePoints()} className="w-full py-2.5 -white text-sm font-medium rounded-xl transition-all">Apply</button>
        </div>
      </div>

      {/* Appointments */}
      <div>
        <h3 className="font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-[var(--color-rose-400)]" /> Appointment History</h3>
        <div className="space-y-2">
          {appointments.slice(0, 8).map(a => (
            <div key={a._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)]">
              <div>
                <p className="text-sm text-[var(--color-text-primary)]">{a.services?.map(s => s.serviceName).join(" + ")}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{formatDate(a.appointmentDate)} · {a.appointmentTime}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[var(--color-rose-400)]">{formatCurrency(a.totalAmount)}</span>
                <Badge variant={a.status === "Completed" ? "info" : a.status === "Confirmed" ? "success" : a.status === "Cancelled" ? "error" : "warning"}>{a.status}</Badge>
              </div>
            </div>
          ))}
          {appointments.length === 0 && <p className="text-[var(--color-text-muted)] text-sm">No appointments</p>}
        </div>
      </div>
    </div>
  );
}
