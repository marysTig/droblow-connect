import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { PageHeader, StatCard } from "@/components/dashboard/shared";
import { Wallet, Clock, CheckCircle2, ArrowDownToLine } from "lucide-react";
import { formatDZD, useOrders, useWithdrawals } from "@/lib/queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/earnings")({ component: EarningsPage });

function EarningsPage() {
  const { user } = useAuth();
  const { data: orders = [], isLoading: ordersLoading } = useOrders(user?.id);
  const { data: withdrawals = [] } = useWithdrawals(user?.id);

  const delivered = orders.filter((o) => o.status === "delivered");
  const pending = orders.filter((o) => o.status === "pending" || o.status === "confirmed" || o.status === "shipped");

  const availableBalance = delivered.reduce((sum, o) => sum + o.commission, 0);
  const pendingCommission = pending.reduce((sum, o) => sum + o.commission, 0);
  const paid = withdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + w.amount, 0);

  const history = [...delivered.slice(0, 6), ...pending.slice(0, 4)];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Earnings"
        subtitle="Track your commissions and request withdrawals."
        action={<Button className="gradient-brand text-brand-foreground shadow-brand"><ArrowDownToLine className="mr-2 h-4 w-4" /> Withdraw</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Available balance" value={formatDZD(availableBalance)} icon={Wallet} tone="brand" />
        <StatCard label="Pending commission" value={formatDZD(pendingCommission)} icon={Clock} tone="warning" />
        <StatCard label="Paid" value={formatDZD(paid)} icon={CheckCircle2} tone="success" />
        <StatCard label="Withdraw requests" value={withdrawals.length.toString()} icon={ArrowDownToLine} />
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="p-5"><h2 className="font-semibold text-lg" dir="auto">Commission history</h2><p className="text-sm text-muted-foreground">All commissions from delivered and pending orders.</p></div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersLoading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground animate-pulse">Loading earnings...</TableCell></TableRow>
              ) : history.length === 0 ? (
                 <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No commissions yet.</TableCell></TableRow>
              ) : history.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono text-xs">{o.id}</TableCell>
                  <TableCell className="font-medium">{o.product_name}</TableCell>
                  <TableCell className="font-semibold text-success">+ {formatDZD(o.commission)}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium ${o.status === "delivered" ? "text-success" : "text-warning"}`}>
                      {o.status === "delivered" ? "Unlocked" : "Pending"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
