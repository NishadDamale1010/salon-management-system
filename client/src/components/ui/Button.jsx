import { cn } from "../../utils";
import { Loader2 } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-rose-500)] disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "btn-primary shadow-lg hover:-translate-y-0.5",
    outline: "btn-outline hover:-translate-y-0.5",
    ghost: "text-[var(--color-text-secondary)] hover:text-[var(--color-rose-500)] hover:bg-[var(--color-rose-500)]/5",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm h-8",
    md: "px-5 py-2.5 text-sm h-10",
    lg: "px-8 py-3.5 text-base h-12",
    xl: "px-10 py-4 text-lg h-14",
    icon: "w-10 h-10 p-0",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
