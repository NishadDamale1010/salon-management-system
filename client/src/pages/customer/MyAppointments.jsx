import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { appointmentService, notificationService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { formatDate, formatPriceOrTbd, isPriceSet } from "../../utils";
import { Badge } from "../../components/ui/Badge";
import { SkeletonTable } from "../../components/ui/Skeleton";
import ReviewModal from "../../components/reviews/ReviewModal";

export default function MyAppointments() {
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: QUERY_KEYS.MY_APPOINTMENTS, queryFn: appointmentService.getMyAppointments });
  const appointments = data?.data || [];

  const statusBadge = {
    Pending: "warning", Confirmed: "success", Completed: "info", Cancelled: "error",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="p-2 rounded-xl hover:bg-[var(--color-rose-500)]/5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">My Appointments</h1>
          <p className="text-[var(--color-text-muted)] text-sm">All your booking history</p>
        </div>
      </div>
      <div className="flex justify-end">
        <Link to="/book" className="inline-flex items-center gap-2 px-5 py-2.5 -white text-sm font-medium rounded-xl transition-all">
          <Calendar className="w-4 h-4" /> Book New
        </Link>
      </div>
      {isLoading ? <SkeletonTable rows={5} /> : (
        <div className="space-y-3">
          {appointments.length === 0 && (
            <div className="text-center py-16 text-[var(--color-text-muted)]">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No appointments yet</p>
              <Link to="/book" className="mt-2 inline-block text-[var(--color-rose-400)] hover:underline text-sm">Book your first appointment</Link>
            </div>
          )}
          {appointments.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to={`/appointments/${a._id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-rose-500)]/30 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-rose-500)]/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-[var(--color-rose-400)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">{a.services?.map(s => s.serviceName).join(" + ")}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                      <span>{formatDate(a.appointmentDate)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.appointmentTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                  {isPriceSet(a.totalAmount) && (
                    <span className="font-semibold text-[var(--color-rose-400)]">{formatPriceOrTbd(a.totalAmount)}</span>
                  )}
                  {a.status === "Completed" && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedAppointmentId(a._id);
                        setReviewModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-medium bg-[var(--color-rose-500)]/10 text-[var(--color-rose-500)] rounded-lg hover:bg-[var(--color-rose-500)] hover:text-white transition-colors flex items-center gap-1"
                    >
                      Leave Review
                    </button>
                  )}
                  <Badge variant={statusBadge[a.status]}>{a.status}</Badge>
                  <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {selectedAppointmentId && (
        <ReviewModal
          open={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setTimeout(() => setSelectedAppointmentId(null), 300); // clear after animation
          }}
          appointmentId={selectedAppointmentId}
        />
      )}
    </div>
  );
}
