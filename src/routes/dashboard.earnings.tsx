import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/dashboard/shared";
import { Wallet, Clock, CheckCircle2, ArrowDownToLine } from "lucide-react";
import { ORDERS, formatDZD } from "@/lib/demo-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/earnings")({ component: EarningsPage });

function EarningsPage() {
  const delivered = ORDERS.filter((o) => o.status === "delivered");
  const pending = ORDERS.filter((o) => o.status === "pending" || o.status === "confirmed" || o.status === "shipped");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Earnings"
        subtitle="Track your commissions and request withdrawals."
        action={<Button className="gradient-brand text-brand-foreground shadow-brand"><ArrowDownToLine className="mr-2 h-4 w-4" /> Withdraw</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Available balance" value={formatDZD(84500)} icon={Wallet} tone="brand" />
        <StatCard label="Pending commission" value={formatDZD(32900)} icon={Clock} tone="warning" />
        <StatCard label="Paid" value={formatDZD(428800)} icon={CheckCircle2} tone="success" />
        <StatCard label="Withdraw requests" value="3" icon={ArrowDownToLine} />
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="p-5"><h2 className="font-semibold text-lg">Commission history</h2><p className="text-sm text-muted-foreground">All commissions from delivered and pending orders.</p></div>
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
              {[...delivered.slice(0, 6), ...pending.slice(0, 4)].map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono text-xs">{o.id}</TableCell>
                  <TableCell className="font-medium">{o.productName}</TableCell>
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
