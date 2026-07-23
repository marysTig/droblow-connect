import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { PageHeader, StatCard, StatusBadge } from "@/components/dashboard/shared";
import { Wallet, Clock, TrendingUp, Package, ArrowRight } from "lucide-react";
import { useOrders, useEarningsChart, formatDZD } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/")({ component: DashboardHome });

function DashboardHome() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data: orders = [], isLoading: ordersLoading } = useOrders(user?.id);
  const { data: earningsChart = [] } = useEarningsChart(user?.id);

  const delivered = orders.filter((o) => o.status === "delivered");
  const availableBalance = delivered.reduce((sum, o) => sum + o.commission, 0);
  const pendingBalance = orders
    .filter((o) => o.status === "pending" || o.status === "confirmed" || o.status === "shipped")
    .reduce((sum, o) => sum + o.commission, 0);
  const totalEarnings = orders.reduce((sum, o) => sum + o.commission, 0);

  const recent = orders.slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader title={t("dash_welcome")} subtitle={t("dash_welcome_sub")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t("dash_available_balance")}
          value={formatDZD(availableBalance)}
          icon={Wallet}
          tone="brand"
        />
        <StatCard
          label={t("dash_pending_balance")}
          value={formatDZD(pendingBalance)}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label={t("dash_total_earnings")}
          value={formatDZD(totalEarnings)}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label={t("dash_delivered_orders")}
          value={delivered.length.toString()}
          icon={Package}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <ChartCard
          title={t("dash_monthly_earnings")}
          subtitle={t("dash_last_7_months")}
          className="lg:col-span-3"
        >
          {earningsChart.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              {t("dash_no_data")}
            </div>
          ) : (
            <ChartContainer
              config={{ earnings: { label: "Earnings", color: "var(--brand-glow)" } }}
              className="h-[280px] w-full"
            >
              <AreaChart data={earningsChart} margin={{ left: 0, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="earn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-glow)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--brand-glow)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" opacity={0.4} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="var(--brand-glow)"
                  fill="url(#earn)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </ChartCard>

        <ChartCard
          title={t("dash_delivered_volume")}
          subtitle={t("dash_volume_month")}
          className="lg:col-span-2"
        >
          {earningsChart.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              {t("dash_no_data")}
            </div>
          ) : (
            <ChartContainer
              config={{ orders: { label: "Orders", color: "var(--navy)" } }}
              className="h-[280px] w-full"
            >
              <BarChart data={earningsChart} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="4 4" opacity={0.4} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="orders" fill="var(--navy)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </ChartCard>
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="font-semibold text-lg" dir="auto">
              {t("dash_latest_orders")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("dash_latest_orders_sub")}</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/orders">
              {t("dash_view_all")} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("th_order")}</TableHead>
                <TableHead>{t("th_product")}</TableHead>
                <TableHead>{t("th_customer")}</TableHead>
                <TableHead>{t("th_wilaya")}</TableHead>
                <TableHead>{t("th_commission")}</TableHead>
                <TableHead>{t("th_status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground animate-pulse"
                  >
                    {t("dash_loading")}
                  </TableCell>
                </TableRow>
              ) : recent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {t("dash_no_orders")}
                  </TableCell>
                </TableRow>
              ) : (
                recent.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell className="font-medium">{o.product_name}</TableCell>
                    <TableCell className="text-muted-foreground">{o.customer_name}</TableCell>
                    <TableCell className="text-muted-foreground">{o.wilaya}</TableCell>
                    <TableCell className="font-semibold text-success">
                      {formatDZD(o.commission)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border bg-card p-5 ${className}`}>
      <div className="mb-4">
        <h2 className="font-semibold" dir="auto">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
