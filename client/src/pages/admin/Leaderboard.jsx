import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { Sparkles, Crown } from "lucide-react";
import { getInitials, getMembershipColor } from "../../utils";
import { useState } from "react";

export default function AdminLeaderboard() {
  const [tab, setTab] = useState("monthly");
  const { data, isLoading } = useQuery({ queryKey: QUERY_KEYS.LEADERBOARD, queryFn: adminService.getLeaderboard });
  const leaderboard = data?.data;
  const list = tab === "monthly" ? (leaderboard?.monthly || []) : (leaderboard?.lifetime || []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">Leaderboard</h1></div>
      </div>
      <div className="flex gap-2 p-1 bg-[var(--color-surface-2)] rounded-xl w-fit">
        {["monthly", "lifetime"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"}`}>{t}</button>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--color-surface-2)]">
            <tr>{["Rank", "Customer", "Membership", "Points"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{h}</th>)}</tr>
          </thead>
          <tbody>
            {list.map((c, i) => (
              <tr key={c._id} className="border-t border-[var(--color-border)] bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-3)] transition-colors">
                <td className="px-4 py-3.5">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-500/20 text-yellow-400" : i === 1 ? "bg-slate-500/20 text-slate-300" : i === 2 ? "bg-amber-800/20 text-amber-600" : "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]"}`}>
                    {i < 3 ? <Crown className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-rose-600)] to-purple-700 flex items-center justify-center text-[var(--color-text-primary)] text-xs font-bold">{getInitials(c.firstName, c.lastName)}</div>
                    <span className="text-[var(--color-text-primary)] font-medium text-sm">{c.firstName} {c.lastName}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5"><span className="text-xs font-semibold" style={{ color: getMembershipColor(c.membership) }}>{c.membership}</span></td>
                <td className="px-4 py-3.5"><span className="flex items-center gap-1 text-yellow-400 font-bold"><Sparkles className="w-3.5 h-3.5" />{tab === "monthly" ? c.monthlyGlowPoints : c.lifetimeGlowPoints}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
