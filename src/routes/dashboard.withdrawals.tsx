import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/shared";
import { formatDZD, useWithdrawals, useCreateWithdrawal } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ArrowDownToLine } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/withdrawals")({ component: WithdrawalsPage });

const tone: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

function WithdrawalsPage() {
  const { data: withdrawals = [], isLoading } = useWithdrawals();
  const createWithdrawal = useCreateWithdrawal();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("20000");
  const [method, setMethod] = useState("CCP");
  const [accountNumber, setAccountNumber] = useState("");

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) return toast.error("Enter a valid amount");
    createWithdrawal.mutate(
      {
        id: `WD-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: Number(amount),
        method,
        account_number: accountNumber,
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
        title="Withdrawals"
        subtitle="Request payouts and track their status."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-brand text-brand-foreground shadow-brand">
                <ArrowDownToLine className="mr-2 h-4 w-4" /> New request
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
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </div>
                <div>
                  <Label>Payout method</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="mt-1.5 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CCP">CCP</SelectItem>
                      <SelectItem value="BaridiMob">BaridiMob</SelectItem>
                      <SelectItem value="Bank transfer">Bank transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Account number</Label>
                  <Input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="mt-1.5 h-11"
                    placeholder="00799999 0016 66"
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

      <div className="rounded-2xl border bg-card overflow-hidden">
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
              {isLoading ? (
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
      </div>
    </div>
  );
}
