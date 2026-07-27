import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { PageHeader, StatCard, ProductNameDisplay } from "@/components/dashboard/shared";
import { Wallet, Clock, CheckCircle2, ArrowDownToLine } from "lucide-react";
import { formatDZD, useOrders, useWithdrawals, useCreateWithdrawal, useAffiliateProfile } from "@/lib/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/dashboard/earnings")({ component: EarningsPage });

const tone: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

function EarningsPage() {
  const { user } = useAuth();
  const { data: orders = [], isLoading: ordersLoading } = useOrders(user?.id);
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useWithdrawals(user?.id);
  const createWithdrawal = useCreateWithdrawal();

  const { data: profile } = useAffiliateProfile(user?.id);

  const [open, setOpen] = useState(false);
  // Don't need local state for method and account number since they come from profile
  // But wait, the form should use profile.payout_method and profile.account_number.

  const delivered = orders.filter((o) => o.status === "delivered");
  const pending = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed" || o.status === "shipped",
  );

  const totalCommission = delivered.reduce((sum, o) => sum + o.commission, 0);
  const totalWithdrawn = withdrawals
    .filter((w) => w.status !== "rejected")
    .reduce((sum, w) => sum + w.amount, 0);
  const availableBalance = totalCommission - totalWithdrawn;
  
  const pendingCommission = pending.reduce((sum, o) => sum + o.commission, 0);
  const paid = withdrawals
    .filter((w) => w.status === "approved")
    .reduce((sum, w) => sum + w.amount, 0);

  const history = [...delivered, ...pending]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20);

  const handleSubmit = () => {
    const reqAmount = availableBalance;
    if (!reqAmount || reqAmount <= 0) return toast.error("Invalid amount");
    if (!profile?.payout_method || !profile?.account_number) {
      return toast.error("Please set your payout method and account number in your profile first");
    }

    createWithdrawal.mutate(
      {
        id: `WD-${Math.floor(10000 + Math.random() * 90000)}`,
        affiliate_id: user?.id,
        amount: reqAmount,
        method: profile.payout_method as any,
        account_number: profile.account_number,
        status: "pending",
        requested_at: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          toast.success("Withdrawal request submitted");
          setOpen(false);
        },
        onError: (err) => {
          toast.error("Failed to submit request: " + err.message);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Earnings & Withdrawals"
        subtitle="Track your commissions and request payouts."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-brand text-brand-foreground shadow-brand">
                <ArrowDownToLine className="mr-2 h-4 w-4" /> Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request withdrawal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label>Amount (DZD)</Label>
                  <Input
                    type="number"
                    value={availableBalance}
                    disabled
                    className="mt-1.5 h-11 bg-muted/50 text-muted-foreground"
                  />
                </div>
                <div>
                  <Label>Payout method</Label>
                  <Select value={profile?.payout_method || "CCP"} disabled>
                    <SelectTrigger className="mt-1.5 h-11 bg-muted/50 text-muted-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CCP">CCP</SelectItem>
                      <SelectItem value="BaridiMob">BaridiMob</SelectItem>
                      <SelectItem value="Bank transfer">Bank transfer</SelectItem>
                      <SelectItem value="Flixy">Flixy</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Configure in your profile</p>
                </div>
                <div>
                  <Label>Account number</Label>
                  <Input
                    value={profile?.account_number || ""}
                    disabled
                    className="mt-1.5 h-11 bg-muted/50 text-muted-foreground"
                    placeholder={!profile?.account_number ? "Not set in profile" : ""}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={createWithdrawal.isPending}
                  className="gradient-brand text-brand-foreground shadow-brand"
                  onClick={handleSubmit}
                >
                  {createWithdrawal.isPending ? "Submitting..." : "Submit request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Available balance"
          value={formatDZD(availableBalance)}
          icon={Wallet}
          tone="brand"
        />
        <StatCard
          label="Pending commission"
          value={formatDZD(pendingCommission)}
          icon={Clock}
          tone="warning"
        />
        <StatCard label="Paid" value={formatDZD(paid)} icon={CheckCircle2} tone="success" />
        <StatCard
          label="Withdraw requests"
          value={withdrawals.length.toString()}
          icon={ArrowDownToLine}
        />
      </div>

      <div className="rounded-2xl border bg-card">
        <Tabs defaultValue="commissions" className="w-full">
          <div className="p-5 border-b flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-semibold text-lg" dir="auto">
                History
              </h2>
              <p className="text-sm text-muted-foreground">
                All your commissions and withdrawals.
              </p>
            </div>
            <TabsList>
              <TabsTrigger value="commissions">Commissions</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="commissions" className="m-0">
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
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground animate-pulse"
                      >
                        Loading earnings...
                      </TableCell>
                    </TableRow>
                  ) : history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No commissions yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(o.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{o.id}</TableCell>
                        <TableCell className="font-medium"><ProductNameDisplay name={o.product_name} /></TableCell>
                        <TableCell className="font-semibold text-success">
                          + {formatDZD(o.commission)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs font-medium ${o.status === "delivered" ? "text-success" : "text-warning"}`}
                          >
                            {o.status === "delivered" ? "Unlocked" : "Pending"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="withdrawals" className="m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawalsLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground animate-pulse"
                      >
                        Loading withdrawals...
                      </TableCell>
                    </TableRow>
                  ) : withdrawals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No withdrawals requested yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    withdrawals.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="font-mono text-xs">{w.id}</TableCell>
                        <TableCell className="font-semibold">{formatDZD(w.amount)}</TableCell>
                        <TableCell>{w.method}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(w.requested_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`capitalize ${tone[w.status]}`}>
                            {w.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
