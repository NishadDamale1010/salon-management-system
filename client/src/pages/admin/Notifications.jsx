import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../../services";
import api from "../../services/api"; // Added direct api call for broadcast
import { QUERY_KEYS } from "../../constants/queryKeys";
import { timeAgo } from "../../utils";
import { Bell, Trash2, CheckCheck, Send } from "lucide-react";
import { toast } from "sonner";

export default function AdminNotifications() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: QUERY_KEYS.NOTIFICATIONS, queryFn: notificationService.getAll });
  const notifications = data?.data || [];
  const { mutate: markAll } = useMutation({ mutationFn: notificationService.markAllAsRead, onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS }) });
  const { mutate: del } = useMutation({ mutationFn: notificationService.delete, onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS }) });

  // Broadcast state
  const [broadcast, setBroadcast] = useState({ audience: "all", title: "", body: "", route: "/" });
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = async (e) => {
      e.preventDefault();
      setIsSending(true);
      try {
          const res = await api.post("/notifications/broadcast", broadcast);
          toast.success(res.message);
          setBroadcast({ audience: "all", title: "", body: "", route: "/" });
      } catch (error) {
          toast.error(error.message || "Failed to send broadcast");
      } finally {
          setIsSending(false);
      }
  };

  return (
    <div className="space-y-8">
      {/* Broadcast Section */}
      <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-400" /> Broadcast Notification
          </h2>
          <form onSubmit={handleBroadcast} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Audience</label>
                      <select 
                          value={broadcast.audience}
                          onChange={(e) => setBroadcast({ ...broadcast, audience: e.target.value })}
                          className="w-full bg-[var(--color-surface-background)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm text-[var(--color-text-primary)]"
                      >
                          <option value="all">All Customers</option>
                          <option value="high_points">Customers with &gt; 100 Glow Points</option>
                          <option value="inactive">Inactive Customers (30 days)</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Route / Link</label>
                      <input 
                          type="text" 
                          value={broadcast.route}
                          onChange={(e) => setBroadcast({ ...broadcast, route: e.target.value })}
                          placeholder="/offers"
                          className="w-full bg-[var(--color-surface-background)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm text-[var(--color-text-primary)]"
                      />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Title</label>
                  <input 
                      type="text" 
                      required
                      value={broadcast.title}
                      onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                      placeholder="Special Offer!"
                      className="w-full bg-[var(--color-surface-background)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm text-[var(--color-text-primary)]"
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Message Body</label>
                  <textarea 
                      required
                      value={broadcast.body}
                      onChange={(e) => setBroadcast({ ...broadcast, body: e.target.value })}
                      placeholder="Hey gorgeous! We have a new facial treatment available..."
                      rows={3}
                      className="w-full bg-[var(--color-surface-background)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm text-[var(--color-text-primary)] resize-none"
                  ></textarea>
              </div>
              <button 
                  type="submit" 
                  disabled={isSending}
                  className="w-full md:w-auto px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
              >
                  {isSending ? "Sending..." : "Send Broadcast Now"}
              </button>
          </form>
      </div>

      {/* Existing Admin Notifications Log */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)]">System Notifications</h2>
          <button onClick={() => markAll()} className="flex items-center gap-2 text-sm text-[var(--color-rose-400)] hover:underline"><CheckCheck className="w-4 h-4" /> Mark all read</button>
        </div>
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n._id} className={`flex gap-3 p-4 rounded-2xl border ${n.isRead ? "bg-[var(--color-surface-card)] border-[var(--color-border)]" : "bg-[var(--color-rose-500)]/5 border-[var(--color-rose-500)]/20"}`}>
              <Bell className={`w-5 h-5 flex-shrink-0 mt-0.5 ${n.isRead ? "text-[var(--color-text-muted)]" : "text-[var(--color-rose-400)]"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{n.title}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{n.body || n.message}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              <button onClick={() => del(n._id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          {!isLoading && notifications.length === 0 && <div className="text-center py-10 text-[var(--color-text-muted)]">No notifications</div>}
        </div>
      </div>
    </div>
  );
}
