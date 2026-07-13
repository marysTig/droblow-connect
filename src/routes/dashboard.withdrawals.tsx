import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/shared";
import { WITHDRAWALS, formatDZD } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownToLine } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/withdrawals")({ component: WithdrawalsPage });

const tone: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

function WithdrawalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Withdrawals" subtitle="Request payouts and track their status."
        action={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-brand text-brand-foreground shadow-brand"><ArrowDownToLine className="mr-2 h-4 w-4" /> New request</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Request withdrawal</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div><Label>Amount (DZD)</Label><Input type="number" defaultValue={20000} className="mt-1.5 h-11" /></div>
                <div>
                  <Label>Payout method</Label>
                  <Select defaultValue="ccp"><SelectTrigger className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ccp">CCP</SelectItem>
                      <SelectItem value="baridimob">BaridiMob</SelectItem>
                      <SelectItem value="bank">Bank transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Account number</Label><Input className="mt-1.5 h-11" placeholder="00799999 0016 66" /></div>
              </div>
              <DialogFooter>
                <Button className="gradient-brand text-brand-foreground shadow-brand" onClick={() => toast.success("Withdrawal request submitted")}>Submit request</Button>
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
              {WITHDRAWALS.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-mono text-xs">{w.id}</TableCell>
                  <TableCell className="font-semibold">{formatDZD(w.amount)}</TableCell>
                  <TableCell>{w.method}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(w.requestedAt).toLocaleDateString()}</TableCell>
                  <TableCell><Badge variant="outline" className={`capitalize ${tone[w.status]}`}>{w.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
