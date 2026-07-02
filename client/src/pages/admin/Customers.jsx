import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { adminService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { formatDate, formatCurrency, getMembershipColor, getInitials } from "../../utils";
import { Badge } from "../../components/ui/Badge";
import { SkeletonTable } from "../../components/ui/Skeleton";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [membership, setMembership] = useState("");
  const { data, isLoading } = useQuery({ queryKey: QUERY_KEYS.CUSTOMERS, queryFn: () => adminService.getCustomers({ search, membership }) });
  const customers = data?.data?.customers || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">Customer Management</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">{customers.length} total customers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-rose-500)] transition-all text-sm"
          />
        </div>
        <select value={membership} onChange={e => setMembership(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-rose-500)] transition-all text-sm"
        >
          <option value="">All Memberships</option>
          {["Bronze", "Silver", "Gold", "Platinum"].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Table */}
      {isLoading ? <SkeletonTable rows={6} /> : (
        <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-surface-2)]">
              <tr>{["Customer", "Email", "Phone", "Points", "Membership", "Joined", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-t border-[var(--color-border)] bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-3)] transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-rose-600)] to-purple-700 flex items-center justify-center text-[var(--color-text-primary)] text-xs font-bold flex-shrink-0">
                        {getInitials(c.firstName, c.lastName)}
                      </div>
                      <span className="text-[var(--color-text-primary)] font-medium text-sm">{c.firstName} {c.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[var(--color-text-muted)]">{c.email}</td>
                  <td className="px-4 py-3.5 text-sm text-[var(--color-text-muted)]">{c.phone || "—"}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-yellow-400">{c.glowPoints || 0}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ color: getMembershipColor(c.membership), background: getMembershipColor(c.membership) + "15" }}>
                      {c.membership}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[var(--color-text-muted)]">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <Link to={`/admin/customers/${c._id}`} className="flex items-center gap-1.5 text-xs text-[var(--color-rose-400)] hover:underline">
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && <div className="text-center py-12 text-[var(--color-text-muted)]">No customers found</div>}
        </div>
      )}
    </div>
  );
}
