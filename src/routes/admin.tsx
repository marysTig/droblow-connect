import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard, StatusBadge } from "@/components/dashboard/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ORDERS, PRODUCTS, AFFILIATES, WITHDRAWALS, STATS, EARNINGS_CHART, formatDZD, type OrderStatus } from "@/lib/demo-data";
import { Package, ShoppingBag, Users, Wallet, ArrowLeft, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({ component: AdminPanel });

function AdminPanel() {
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <Badge variant="outline" className="border-navy/30 text-primary font-semibold">Admin</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/dashboard"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to affiliate</Link></Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8 space-y-6">
        <PageHeader title="Admin Panel" subtitle="Manage products, orders, affiliates and withdrawals." />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active affiliates" value={STATS.activeAffiliates.toLocaleString()} icon={Users} tone="brand" />
          <StatCard label="Products" value={STATS.products.toString()} icon={Package} />
          <StatCard label="Orders delivered" value={STATS.ordersDelivered.toLocaleString()} icon={ShoppingBag} tone="success" />
          <StatCard label="Commissions paid" value={formatDZD(STATS.commissionsPaid)} icon={Wallet} tone="warning" />
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="bg-card border p-1 h-11 flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="font-semibold">Platform activity</h2>
              <p className="text-sm text-muted-foreground">Orders delivered per month.</p>
              <ChartContainer config={{ orders: { label: "Orders" } }} className="h-[320px] w-full mt-4">
                <AreaChart data={EARNINGS_CHART}>
                  <defs>
                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-glow)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--brand-glow)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" opacity={0.4} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="orders" stroke="var(--brand-glow)" fill="url(#ag)" strokeWidth={2.5} />
                </AreaChart>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-4">
            <div className="rounded-2xl border bg-card">
              <div className="p-5 flex items-center justify-between">
                <h2 className="font-semibold">Products</h2>
                <Button className="gradient-brand text-brand-foreground shadow-brand" onClick={() => toast.info("Product form")}><Plus className="mr-1.5 h-4 w-4" /> Add product</Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Min price</TableHead><TableHead>Commission</TableHead><TableHead>Stock</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {PRODUCTS.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell><div className="flex items-center gap-3"><img src={p.image} className="h-10 w-10 rounded-lg object-cover" alt="" /><span className="font-medium">{p.name}</span></div></TableCell>
                        <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                        <TableCell>{formatDZD(p.minPrice)}</TableCell>
                        <TableCell className="text-success font-semibold">{formatDZD(p.commission)}</TableCell>
                        <TableCell>{p.stock}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <div className="rounded-2xl border bg-card">
              <div className="p-5"><h2 className="font-semibold">All orders</h2></div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Order</TableHead><TableHead>Product</TableHead><TableHead>Customer</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {ORDERS.slice(0, 10).map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">{o.id}</TableCell>
                        <TableCell>{o.productName}</TableCell>
                        <TableCell>{o.customerName}</TableCell>
                        <TableCell className="font-semibold">{formatDZD(o.sellingPrice * o.quantity)}</TableCell>
                        <TableCell><StatusBadge status={o.status} /></TableCell>
                        <TableCell>
                          <Select defaultValue={o.status}>
                            <SelectTrigger className="h-8 w-[130px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(["pending", "confirmed", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((s) =>
                                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="affiliates" className="mt-4">
            <div className="rounded-2xl border bg-card overflow-hidden">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Affiliate</TableHead><TableHead>Email</TableHead><TableHead>Orders</TableHead><TableHead>Earnings</TableHead><TableHead>Joined</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {AFFILIATES.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell><div className="font-medium">{a.name}</div><div className="text-xs text-muted-foreground font-mono">{a.id}</div></TableCell>
                      <TableCell className="text-muted-foreground">{a.email}</TableCell>
                      <TableCell>{a.orders}</TableCell>
                      <TableCell className="font-semibold">{formatDZD(a.earnings)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(a.joined).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant="outline" className={a.status === "active" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}>{a.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-4">
            <div className="rounded-2xl border bg-card overflow-hidden">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Request</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Requested</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {WITHDRAWALS.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-mono text-xs">{w.id}</TableCell>
                      <TableCell className="font-semibold">{formatDZD(w.amount)}</TableCell>
                      <TableCell>{w.method}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(w.requestedAt).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{w.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" className="text-success" onClick={() => toast.success("Approved")}><Check className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => toast.error("Rejected")}><X className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border bg-card p-6">
                <div className="text-sm text-muted-foreground">Avg order value</div>
                <div className="mt-2 text-3xl font-bold text-gradient-brand">{formatDZD(4820)}</div>
              </div>
              <div className="rounded-2xl border bg-card p-6">
                <div className="text-sm text-muted-foreground">Delivery success rate</div>
                <div className="mt-2 text-3xl font-bold text-gradient-brand">92.4%</div>
              </div>
              <div className="rounded-2xl border bg-card p-6">
                <div className="text-sm text-muted-foreground">Top wilaya</div>
                <div className="mt-2 text-3xl font-bold text-primary">Alger</div>
              </div>
              <div className="rounded-2xl border bg-card p-6">
                <div className="text-sm text-muted-foreground">Top affiliate</div>
                <div className="mt-2 text-3xl font-bold text-primary">Yacine M.</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
