import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary" dir="auto">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, delta, icon: Icon, tone = "default" }: {
  label: string; value: string; delta?: string; icon: LucideIcon; tone?: "default" | "brand" | "success" | "warning";
}) {
  const tones: Record<string, string> = {
    default: "bg-muted text-primary",
    brand: "gradient-brand text-brand-foreground",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };
  const positive = delta && !delta.startsWith("-");
  return (
    <div className="rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-bold text-primary">{value}</div>
        </div>
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {delta && (
        <div className={cn("mt-3 inline-flex items-center gap-1 text-xs font-medium", positive ? "text-success" : "text-destructive")}>
          {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {delta} <span className="text-muted-foreground font-normal">vs last month</span>
        </div>
      )}
    </div>
  );
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  shipped: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
  delivered: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={cn("capitalize font-medium", STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}
