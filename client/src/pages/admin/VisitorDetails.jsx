import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { visitorService } from "../../services";
import { ArrowLeft, Eye, Clock, MousePointer, Users, Globe, Monitor, Smartphone, Check, X } from "lucide-react";
import { formatDuration, timeAgo } from "../../utils";
import { Skeleton, SkeletonCard } from "../../components/ui/Skeleton";

export default function VisitorDetails() {
  const { id } = useParams();
  
  const { data: visitorData, isLoading } = useQuery({
    queryKey: ["visitorDetails", id],
    queryFn: () => visitorService.getVisitorDetails(id),
  });

  const visitor = visitorData?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="w-48 h-6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-text-muted)]">Visitor not found</p>
        <Link to="/admin/visitors" className="text-[var(--color-rose-400)] hover:underline mt-2 inline-block">
          Back to Visitors
        </Link>
      </div>
    );
  }

  const getEventIcon = (type) => {
    switch (type) {
      case "page_view": return Eye;
      case "scroll": return MousePointer;
      case "button_click": return MousePointer;
      case "register_click": return Users;
      case "register_open": return Users;
      case "register_complete": return Check;
      case "exit": return X;
      default: return Clock;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case "page_view": return "text-blue-400";
      case "scroll": return "text-purple-400";
      case "button_click": return "text-green-400";
      case "register_click": return "text-orange-400";
      case "register_open": return "text-yellow-400";
      case "register_complete": return "text-emerald-400";
      case "exit": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getEventLabel = (event) => {
    switch (event.type) {
      case "page_view": return `Visited ${event.page}`;
      case "scroll": return `Scrolled to ${event.data?.scrollPercentage || 0}%`;
      case "button_click": return `Clicked ${event.data?.buttonName || "button"}`;
      case "register_click": return "Clicked Register";
      case "register_open": return "Opened Registration Form";
      case "register_complete": return "Completed Registration";
      case "exit": return `Exited from ${event.page}`;
      default: return event.type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/visitors" className="p-2 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] transition-colors">
          <ArrowLeft className="w-5 h-5 text-[var(--color-text-primary)]" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">Visitor Details</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1 font-mono">{visitor.visitorId}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
          visitor.registered 
            ? "bg-green-500/10 text-green-500 border border-green-500/20" 
            : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
        }`}>
          {visitor.registered ? "Registered User" : "Anonymous Visitor"}
        </span>
        {visitor.registered && visitor.userId && (
          <Link to={`/admin/customers/${visitor.userId}`} className="text-sm text-[var(--color-rose-400)] hover:underline">
            View Customer Profile →
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-rose-500)]/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-[var(--color-rose-500)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Total Visits</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{visitor.visitCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-purple-500)]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[var(--color-purple-500)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Time on Site</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{formatDuration(visitor.totalTimeSpent)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-blue-500)]/10 flex items-center justify-center">
              <MousePointer className="w-5 h-5 text-[var(--color-blue-500)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Pages Viewed</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{visitor.visitedPages?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-emerald-500)]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--color-emerald-500)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Avg Scroll</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{visitor.averageScrollPercentage?.toFixed(0) || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Device & Location Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Device Information</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">Device</span>
              <div className="flex items-center gap-2">
                {visitor.device === "Mobile" ? <Smartphone className="w-4 h-4 text-[var(--color-rose-400)]" /> : <Monitor className="w-4 h-4 text-[var(--color-rose-400)]" />}
                <span className="text-sm text-[var(--color-text-primary)]">{visitor.device || "Unknown"}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">Browser</span>
              <span className="text-sm text-[var(--color-text-primary)]">{visitor.browser || "Unknown"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">OS</span>
              <span className="text-sm text-[var(--color-text-primary)]">{visitor.os || "Unknown"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">Screen Resolution</span>
              <span className="text-sm text-[var(--color-text-primary)]">{visitor.screenResolution || "Unknown"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">Language</span>
              <span className="text-sm text-[var(--color-text-primary)]">{visitor.language || "Unknown"}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Location & Source</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">Country</span>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[var(--color-rose-400)]" />
                <span className="text-sm text-[var(--color-text-primary)]">{visitor.country || "Unknown"}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">City</span>
              <span className="text-sm text-[var(--color-text-primary)]">{visitor.city || "Unknown"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">Traffic Source</span>
              <span className="text-sm text-[var(--color-text-primary)]">{visitor.trafficSource || "Direct"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">Referrer</span>
              <span className="text-sm text-[var(--color-text-primary)] truncate max-w-[200px]">{visitor.referrer || "None"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">First Visit</span>
              <span className="text-sm text-[var(--color-text-primary)]">{new Date(visitor.firstVisit).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">Last Visit</span>
              <span className="text-sm text-[var(--color-text-primary)]">{timeAgo(visitor.lastVisit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Funnel Status */}
      <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Registration Journey</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Clicked Register", done: visitor.registerClicked },
            { label: "Opened Form", done: visitor.registerOpened },
            { label: "Completed", done: visitor.registered },
          ].map((step) => (
            <div key={step.label} className={`p-3 rounded-lg text-center ${
              step.done ? "bg-green-500/10 border border-green-500/20" : "bg-[var(--color-surface-2)]"
            }`}>
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${
                step.done ? "bg-green-500" : "bg-gray-500"
              }`}>
                {step.done ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
              </div>
              <p className="text-xs text-[var(--color-text-primary)]">{step.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Visited Pages */}
      <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Visited Pages</h2>
        <div className="flex flex-wrap gap-2">
          {visitor.visitedPages?.map((page, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-[var(--color-surface-2)] text-sm text-[var(--color-text-primary)]">
              {page}
            </span>
          ))}
        </div>
      </div>

      {/* Button Clicks */}
      {visitor.buttonClicks && Object.keys(visitor.buttonClicks).length > 0 && (
        <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Button Clicks</h2>
          <div className="space-y-2">
            {Object.entries(visitor.buttonClicks).map(([button, count]) => (
              <div key={button} className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-2)]">
                <span className="text-sm text-[var(--color-text-primary)]">{button}</span>
                <span className="text-sm font-medium text-[var(--color-rose-400)]">{count} clicks</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Activity Timeline</h2>
        <div className="space-y-4">
          {visitor.events?.length > 0 ? (
            visitor.events.slice().reverse().map((event, i) => {
              const EventIcon = getEventIcon(event.type);
              return (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getEventColor(event.type)} bg-opacity-10`}>
                    <EventIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text-primary)]">{getEventLabel(event)}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-[var(--color-text-muted)] py-8">No events recorded</p>
          )}
        </div>
      </div>
    </div>
  );
}
