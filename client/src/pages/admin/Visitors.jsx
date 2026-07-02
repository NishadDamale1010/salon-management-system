import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { visitorService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { StatCard } from "../../components/ui/Card";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Eye, Users, Clock, MousePointer, TrendingUp, Globe, Monitor, Smartphone } from "lucide-react";
import { formatDuration } from "../../utils";
import { Link } from "react-router-dom";

const CHART_COLORS = ["#ff2d6b", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

export default function Visitors() {
  const [filter, setFilter] = useState("all");
  
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({ 
    queryKey: ["visitorAnalytics", filter], 
    queryFn: () => visitorService.getAnalytics({ registered: filter === "all" ? undefined : filter === "registered" }) 
  });
  
  const { data: visitorsData, isLoading: visitorsLoading } = useQuery({ 
    queryKey: ["visitorsList", filter], 
    queryFn: () => visitorService.getVisitorsList({ registered: filter === "all" ? undefined : filter === "registered" }) 
  });

  const { data: funnelData } = useQuery({
    queryKey: ["registrationFunnel"],
    queryFn: visitorService.getRegistrationFunnel,
  });

  const analytics = analyticsData?.data || {};
  const visitors = visitorsData?.data?.visitors || [];
  const funnel = funnelData?.data || {};

  const stats = [
    { icon: Eye, label: "Today's Visitors", value: analytics.todayVisitors || 0, color: "rose" },
    { icon: Users, label: "This Week", value: analytics.weekVisitors || 0, color: "gold" },
    { icon: Clock, label: "This Month", value: analytics.monthVisitors || 0, color: "blue" },
    { icon: TrendingUp, label: "Active Now", value: analytics.activeVisitors || 0, color: "emerald" },
    { icon: Users, label: "Returning", value: analytics.returningVisitors || 0, color: "purple" },
    { icon: Eye, label: "Registered", value: analytics.registeredVisitors || 0, color: "cyan" },
    { icon: Eye, label: "Anonymous", value: analytics.anonymousVisitors || 0, color: "orange" },
    { icon: TrendingUp, label: "Conversion Rate", value: `${analytics.conversionRate?.toFixed(1) || 0}%`, color: "pink" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl md:text-3xl font-bold text-[var(--color-text-primary)]">Anonymous Visitors</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Track anonymous visitor behavior and conversion</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "all" 
                ? "bg-[var(--color-rose-500)] text-white" 
                : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
            }`}
          >
            All Visitors
          </button>
          <button
            onClick={() => setFilter("registered")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "registered" 
                ? "bg-[var(--color-rose-500)] text-white" 
                : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
            }`}
          >
            Registered
          </button>
          <button
            onClick={() => setFilter("anonymous")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "anonymous" 
                ? "bg-[var(--color-rose-500)] text-white" 
                : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
            }`}
          >
            Anonymous
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsLoading ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />) : stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitors Per Day */}
        <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Visitors Per Day (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.visitorsPerDay || []}>
              <defs>
                <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff2d6b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff2d6b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="_id" tick={{ fill: "#6b5f82", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b5f82", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1e1930", border: "1px solid #2d2547", borderRadius: 12, color: "#f8f4ff" }} />
              <Area type="monotone" dataKey="count" stroke="#ff2d6b" strokeWidth={2} fill="url(#visitorGrad)" name="Total Visitors" />
              <Area type="monotone" dataKey="registered" stroke="#8b5cf6" strokeWidth={2} fill="none" name="Registered" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Sources */}
        <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Traffic Sources</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.trafficSources || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#6b5f82", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="_id" type="category" tick={{ fill: "#a89bc2", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={{ background: "#1e1930", border: "1px solid #2d2547", borderRadius: 12, color: "#f8f4ff" }} />
              <Bar dataKey="count" fill="#ff2d6b" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Types */}
        <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Device Types</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={analytics.devices || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
                {(analytics.devices || []).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1e1930", border: "1px solid #2d2547", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {(analytics.devices || []).map((item, i) => (
              <div key={item._id} className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {item._id}: {item.count}
              </div>
            ))}
          </div>
        </div>

        {/* Browsers */}
        <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Browsers</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={analytics.browsers || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="_id" tick={{ fill: "#6b5f82", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b5f82", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1e1930", border: "1px solid #2d2547", borderRadius: 12 }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Countries */}
        <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Top Countries</h2>
          <div className="space-y-2">
            {(analytics.countries || []).slice(0, 5).map((country, i) => (
              <div key={country._id} className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-2)]">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[var(--color-rose-400)]" />
                  <span className="text-sm text-[var(--color-text-primary)]">{country._id}</span>
                </div>
                <span className="text-sm font-medium text-[var(--color-text-muted)]">{country.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Registration Funnel */}
      <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Registration Funnel</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: "Website Visit", value: funnel.websiteVisit, icon: Eye },
            { label: "Viewed Services", value: funnel.viewedServices, icon: MousePointer },
            { label: "Viewed Rewards", value: funnel.viewedRewards, icon: TrendingUp },
            { label: "Clicked Register", value: funnel.registerClicked, icon: MousePointer },
            { label: "Opened Form", value: funnel.registerOpened, icon: Users },
            { label: "Registered", value: funnel.registered, icon: Users },
          ].map((step, i) => {
            const prevValue = i === 0 ? funnel.websiteVisit : [funnel.websiteVisit, funnel.viewedServices, funnel.viewedRewards, funnel.registerClicked, funnel.registerOpened][i - 1];
            const conversionRate = prevValue > 0 ? ((step.value / prevValue) * 100).toFixed(1) : 0;
            return (
              <div key={step.label} className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[var(--color-rose-400)] to-[var(--color-rose-600)] flex items-center justify-center mb-2">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{step.value || 0}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">{step.label}</p>
                {i > 0 && <p className="text-xs text-[var(--color-rose-400)] mt-1">{conversionRate}%</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Visitors Table */}
      <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Recent Visitors</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                <th className="pb-3 px-2">Visitor ID</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Registered</th>
                <th className="pb-3 px-2">Visits</th>
                <th className="pb-3 px-2">Time Spent</th>
                <th className="pb-3 px-2">Current Page</th>
                <th className="pb-3 px-2">Device</th>
                <th className="pb-3 px-2">Country</th>
                <th className="pb-3 px-2">Last Seen</th>
                <th className="pb-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {visitorsLoading ? (
                <tr><td colSpan={10} className="py-8 text-center text-[var(--color-text-muted)]">Loading...</td></tr>
              ) : visitors.length === 0 ? (
                <tr><td colSpan={10} className="py-8 text-center text-[var(--color-text-muted)]">No visitors found</td></tr>
              ) : (
                visitors.map((visitor) => (
                  <tr key={visitor._id} className="text-sm">
                    <td className="py-3 px-2 font-mono text-xs text-[var(--color-rose-400)]">{visitor.visitorId}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        visitor.registered ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"
                      }`}>
                        {visitor.registered ? "Registered" : "Anonymous"}
                      </span>
                    </td>
                    <td className="py-3 px-2">{visitor.registered ? "✓" : "✗"}</td>
                    <td className="py-3 px-2">{visitor.visitCount}</td>
                    <td className="py-3 px-2">{formatDuration(visitor.totalTimeSpent)}</td>
                    <td className="py-3 px-2 text-[var(--color-text-muted)]">{visitor.currentPage || "-"}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        {visitor.device === "Mobile" ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                        <span className="text-xs">{visitor.device || "-"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">{visitor.country || "-"}</td>
                    <td className="py-3 px-2 text-[var(--color-text-muted)] text-xs">
                      {new Date(visitor.lastVisit).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2">
                      <Link
                        to={`/admin/visitors/${visitor.visitorId}`}
                        className="text-[var(--color-rose-400)] hover:text-[var(--color-rose-300)] text-xs font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
