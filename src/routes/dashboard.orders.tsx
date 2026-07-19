import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { PageHeader, StatusBadge } from "@/components/dashboard/shared";
import { formatDZD, useOrders, useUpdateOrder, useDeleteOrder } from "@/lib/queries";
import type { OrderStatus } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/dashboard/orders")({ component: OrdersPage });

function OrdersPage() {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useOrders(user?.id);
  const deleteOrder = useDeleteOrder();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const perPage = 8;
  const [editingOrder, setEditingOrder] = useState<any>(null);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesQ = !q || o.id.toLowerCase().includes(q.toLowerCase()) || o.customer_name.toLowerCase().includes(q.toLowerCase()) || o.product_name.toLowerCase().includes(q.toLowerCase());
      const matchesS = status === "all" || o.status === status;
      return matchesQ && matchesS;
    });
  }, [q, status, orders]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      deleteOrder.mutate(id, {
        onSuccess: () => toast.success("Order deleted"),
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle={`${filtered.length} orders`} action={
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
      } />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by ID, customer, product…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="pl-9 h-10 bg-card" />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v as OrderStatus | "all"); setPage(1); }}>
          <SelectTrigger className="w-[180px] h-10 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Wilaya</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={10} className="h-32 text-center text-muted-foreground animate-pulse">Loading orders...</TableCell></TableRow>
              ) : paged.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="h-32 text-center text-muted-foreground">No orders match your filters.</TableCell></TableRow>
              ) : paged.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id}</TableCell>
                  <TableCell className="font-medium">{o.product_name}</TableCell>
                  <TableCell>
                    <div className="text-sm">{o.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{o.phone}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{o.wilaya}</TableCell>
                  <TableCell>{o.quantity}</TableCell>
                  <TableCell className="font-semibold">{formatDZD(o.selling_price * o.quantity)}</TableCell>
                  <TableCell className="font-semibold text-success">{formatDZD(o.commission || 0)}</TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    {o.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditingOrder(o)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(o.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between p-4 border-t">
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {editingOrder && (
        <EditOrderDialog 
          order={editingOrder} 
          open={!!editingOrder} 
          onOpenChange={(open) => !open && setEditingOrder(null)} 
        />
      )}
    </div>
  );
}

function EditOrderDialog({ order, open, onOpenChange }: { order: any; open: boolean; onOpenChange: (o: boolean) => void }) {
  const updateOrder = useUpdateOrder();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [commune, setCommune] = useState("");

  useEffect(() => {
    if (order) {
      setCustomerName(order.customer_name || "");
      setPhone(order.phone || "");
      setWilaya(order.wilaya || "");
      setCommune(order.commune || "");
    }
  }, [order]);

  const handleSave = () => {
    updateOrder.mutate({
      id: order.id,
      customer_name: customerName,
      phone,
      wilaya,
      commune
    }, {
      onSuccess: () => {
        toast.success("Order updated successfully");
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Order {order?.id}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Customer Name</Label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Wilaya</Label>
            <Input value={wilaya} onChange={(e) => setWilaya(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Commune</Label>
            <Input value={commune} onChange={(e) => setCommune(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateOrder.isPending} className="gradient-brand text-brand-foreground border-0 shadow-brand">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
