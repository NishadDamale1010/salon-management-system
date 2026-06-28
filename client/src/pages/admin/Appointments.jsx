import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, X, ChevronDown, CreditCard, Image as ImageIcon } from "lucide-react";
import { appointmentService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { formatDate, formatCurrency, getInitials } from "../../utils";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { toast } from "sonner";

const COLUMNS = ["Pending", "Confirmed", "Completed", "Cancelled"];
const BADGE_VARIANTS = { Pending: "warning", Confirmed: "success", Completed: "info", Cancelled: "error" };

export default function Appointments() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [suggestion, setSuggestion] = useState("");
  const [actionType, setActionType] = useState("");
  const [activeTab, setActiveTab] = useState("kanban"); // "kanban" | "payments"
  const [viewImage, setViewImage] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: QUERY_KEYS.ALL_APPOINTMENTS, queryFn: appointmentService.getAll });
  const appointments = data?.data || [];

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: ({ id, data }) => appointmentService.updateStatus(id, data),
    onSuccess: () => {
      toast.success("Appointment updated!");
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ALL_APPOINTMENTS });
      setSelected(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleAction = (appt, action) => { setSelected(appt); setActionType(action); setSuggestion(""); };

  const byStatus = (status) => appointments.filter(a => a.status === status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">Appointment Management</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Manage all bookings and verify payments</p>
        </div>
        <div className="flex bg-[var(--color-surface-2)] p-1 rounded-xl border border-[var(--color-border)] self-start">
          <button
            onClick={() => setActiveTab("kanban")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "kanban" ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"}`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "payments" ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"}`}
          >
            Payment Verifications
            {appointments.filter(a => a.paymentStatus === "Verification Pending").length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[var(--color-rose-500)] text-white flex items-center justify-center text-[10px]">
                {appointments.filter(a => a.paymentStatus === "Verification Pending").length}
              </span>
            )}
          </button>
        </div>
      </div>

      {isLoading ? <div className="text-center py-16 text-[var(--color-text-muted)]">Loading...</div> : (
        <>
          {activeTab === "kanban" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {COLUMNS.map(col => (
                <div key={col} className="rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant={BADGE_VARIANTS[col]}>{col}</Badge>
                    <span className="ml-auto text-xs text-[var(--color-text-muted)]">{byStatus(col).length}</span>
                  </div>
                  <div className="space-y-3">
                    {byStatus(col).map(a => (
                      <div key={a._id} className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-rose-600)] to-purple-700 text-[var(--color-text-primary)] flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {getInitials(a.customer?.firstName, a.customer?.lastName)}
                          </div>
                          <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{a.customer?.firstName} {a.customer?.lastName}</span>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">
                          {a.services?.map(s => s.isCustom ? `${s.serviceName} (Custom)` : s.serviceName).join(", ")}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">{formatDate(a.appointmentDate)} · {a.appointmentTime}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-[var(--color-rose-400)]">{formatCurrency(a.totalAmount)}</p>
                          {a.paymentMethod && <span className="text-[10px] bg-[var(--color-surface-3)] px-2 py-0.5 rounded-full text-[var(--color-text-muted)] border border-[var(--color-border)]">{a.paymentMethod}</span>}
                        </div>
                        {col === "Pending" && (
                          <div className="flex gap-1.5 pt-1">
                            {a.paymentStatus === "Verification Pending" ? (
                              <button onClick={() => setActiveTab("payments")} className="w-full py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs rounded-lg hover:bg-yellow-500/20 transition-all">
                                Verification Required
                              </button>
                            ) : (
                              <>
                                <button onClick={() => handleAction(a, "Confirmed")} className="flex-1 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1">
                                  <Check className="w-3 h-3" /> Confirm
                                </button>
                                <button onClick={() => handleAction(a, "Cancelled")} className="flex-1 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg hover:bg-red-500/20 transition-all flex items-center justify-center gap-1">
                                  <X className="w-3 h-3" /> Reject
                                </button>
                              </>
                            )}
                          </div>
                        )}
                        {col === "Confirmed" && (
                          <button onClick={() => handleAction(a, "Completed")} className="w-full py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs rounded-lg hover:bg-blue-500/20 transition-all">
                            Mark Completed
                          </button>
                        )}
                      </div>
                    ))}
                    {byStatus(col).length === 0 && <div className="text-center py-6 text-xs text-[var(--color-text-muted)]">No appointments</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments.filter(a => a.paymentStatus === "Verification Pending").length === 0 ? (
                <div className="col-span-full text-center py-16 text-[var(--color-text-muted)] rounded-2xl border border-dashed border-[var(--color-border)]">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No payments pending verification.</p>
                </div>
              ) : appointments.filter(a => a.paymentStatus === "Verification Pending").map(a => (
                <div key={a._id} className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-rose-600)] to-purple-700 text-[var(--color-text-primary)] flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {getInitials(a.customer?.firstName, a.customer?.lastName)}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">{a.customer?.firstName} {a.customer?.lastName}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{a.customer?.phone}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Date & Time</span>
                      <span className="text-[var(--color-text-primary)] text-right">{formatDate(a.appointmentDate)}<br/>{a.appointmentTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Method</span>
                      <span className="text-[var(--color-text-primary)] font-medium">{a.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Transaction ID</span>
                      <span className="text-[var(--color-text-primary)] font-mono bg-[var(--color-surface-card)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">{a.transactionId || "N/A"}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[var(--color-border)]">
                      <span className="text-[var(--color-text-primary)] font-medium">Amount to Verify</span>
                      <span className="text-[var(--color-rose-400)] font-bold">{formatCurrency(a.totalAmount)}</span>
                    </div>
                  </div>

                  {a.paymentScreenshot && (
                    <button onClick={() => setViewImage(a.paymentScreenshot)} className="w-full py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl flex items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-rose-500)]/30 transition-all">
                      <ImageIcon className="w-4 h-4" /> View Screenshot
                    </button>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => updateStatus({ id: a._id, data: { paymentStatus: "Paid", status: "Confirmed" } })}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Check className="w-4 h-4" /> Verify
                    </button>
                    <button
                      onClick={() => updateStatus({ id: a._id, data: { paymentStatus: "Rejected", status: "Payment Failed" } })}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`${actionType === "Cancelled" ? "Reject" : actionType} Appointment`}>
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              {actionType === "Cancelled" ? "Reject" : actionType} appointment for <span className="text-[var(--color-text-primary)]">{selected.customer?.firstName}</span>?
            </p>
            {actionType === "Cancelled" && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Suggested Reschedule Time (Optional)</label>
                <input value={suggestion} onChange={e => setSuggestion(e.target.value)} placeholder="e.g. Tomorrow between 2PM - 5PM"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] transition-all text-sm"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl hover:text-[var(--color-text-primary)] transition-colors">Cancel</button>
              <button
                onClick={() => updateStatus({ id: selected._id, data: { status: actionType, suggestedTimeFrame: suggestion || undefined } })}
                disabled={isPending}
                className={`flex-1 py-2.5 text-[var(--color-text-primary)] font-medium rounded-xl transition-all disabled:opacity-50 ${actionType === "Cancelled" ? "bg-red-600 hover:bg-red-500" : actionType === "Completed" ? "bg-blue-600 hover:bg-blue-500" : "bg-emerald-600 hover:bg-emerald-500"}`}
              >
                {isPending ? "..." : "Confirm"}
              </button>
            </div>
          </div>
        )}
      </Modal>
      <Modal open={!!viewImage} onClose={() => setViewImage(null)} title="Payment Screenshot">
        {viewImage && (
          <div className="flex justify-center">
            <img src={viewImage} alt="Payment Screenshot" className="max-w-full max-h-[70vh] rounded-xl object-contain border border-[var(--color-border)]" />
          </div>
        )}
      </Modal>
    </div>
  );
}
