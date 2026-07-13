import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, StatCard, StatusBadge } from "@/components/dashboard/shared";
import { Wallet, Clock, TrendingUp, Package, ArrowRight } from "lucide-react";
import { ORDERS, EARNINGS_CHART, formatDZD } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/dashboard/")({ component: DashboardHome });

function DashboardHome() {
  const recent = ORDERS.slice(0, 6);
  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome back, Amine 👋"
        subtitle="Here's what's happening with your affiliate account today."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Available balance" value={formatDZD(84500)} delta="+12.4%" icon={Wallet} tone="brand" />
        <StatCard label="Pending balance" value={formatDZD(32900)} delta="+8.1%" icon={Clock} tone="warning" />
        <StatCard label="Total earnings" value={formatDZD(546200)} delta="+18.4%" icon={TrendingUp} tone="success" />
        <StatCard label="Delivered orders" value="128" delta="+22" icon={Package} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <ChartCard title="Monthly earnings" subtitle="Last 7 months" className="lg:col-span-3">
          <ChartContainer config={{ earnings: { label: "Earnings", color: "var(--brand-glow)" } }} className="h-[280px] w-full">
            <AreaChart data={EARNINGS_CHART} margin={{ left: 0, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="earn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-glow)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--brand-glow)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" opacity={0.4} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `${v / 1000}k`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="earnings" stroke="var(--brand-glow)" fill="url(#earn)" strokeWidth={2.5} />
            </AreaChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Delivered orders" subtitle="Volume per month" className="lg:col-span-2">
          <ChartContainer config={{ orders: { label: "Orders", color: "var(--navy)" } }} className="h-[280px] w-full">
            <BarChart data={EARNINGS_CHART} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" opacity={0.4} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="orders" fill="var(--navy)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </ChartCard>
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="font-semibold text-lg">Latest orders</h2>
            <p className="text-sm text-muted-foreground">Your most recent affiliate orders.</p>
          </div>
          <Button asChild variant="ghost" size="sm"><Link to="/dashboard/orders">View all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Wilaya</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id}</TableCell>
                  <TableCell className="font-medium">{o.productName}</TableCell>
                  <TableCell className="text-muted-foreground">{o.customerName}</TableCell>
                  <TableCell className="text-muted-foreground">{o.wilaya}</TableCell>
                  <TableCell className="font-semibold text-success">{formatDZD(o.commission)}</TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border bg-card p-5 ${className}`}>
      <div className="mb-4"><h2 className="font-semibold">{title}</h2><p className="text-sm text-muted-foreground">{subtitle}</p></div>
      {children}
    </div>
  );
}
