import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { PageHeader, StatusBadge, ProductNameDisplay } from "@/components/dashboard/shared";
import { formatProductName } from "@/lib/utils";
import { formatDZD, useOrders, useUpdateOrder, useDeleteOrder } from "@/lib/queries";
import type { OrderStatus } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, ChevronLeft, ChevronRight, Pencil, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/dashboard/orders")({ component: OrdersPage });

function OrdersPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data: orders = [], isLoading, error } = useOrders(user?.id);
  const deleteOrder = useDeleteOrder();
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const perPage = 8;
  const [editingOrder, setEditingOrder] = useState<any>(null);

  // Debug log (remove after fix)
  useEffect(() => {
    console.log("[Orders Debug] user?.id =", user?.id);
    console.log("[Orders Debug] orders count =", orders.length);
    console.log("[Orders Debug] error =", error);
  }, [user?.id, orders, error]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesS = status === "all" || o.status === status;
      return matchesS;
    });
  }, [status, orders]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = (id: string) => {
    if (confirm(t("orders_delete_confirm"))) {
      deleteOrder.mutate(id, {
        onSuccess: () => toast.success(t("orders_deleted")),
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("orders_title")}
        subtitle={`${filtered.length} ${t("sidebar_orders").toLowerCase()}`}
        action={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> {t("orders_export")}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as OrderStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] h-10 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("orders_all_statuses")}</SelectItem>
            <SelectItem value="pending">{t("orders_status_pending")}</SelectItem>
            <SelectItem value="confirmed">{t("orders_status_confirmed")}</SelectItem>
            <SelectItem value="shipped">{t("orders_status_shipped")}</SelectItem>
            <SelectItem value="delivered">{t("orders_status_delivered")}</SelectItem>
            <SelectItem value="cancelled">{t("orders_status_cancelled")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("th_order_id")}</TableHead>
                <TableHead>{t("th_product")}</TableHead>
                <TableHead>{t("th_customer")}</TableHead>
                <TableHead>{t("th_wilaya")}</TableHead>
                <TableHead>{t("th_qty")}</TableHead>
                <TableHead>{t("th_total")}</TableHead>
                <TableHead>{t("th_commission")}</TableHead>
                <TableHead>{t("th_commune")}</TableHead>
                <TableHead>{t("th_status")}</TableHead>
                <TableHead>{t("th_date")}</TableHead>
                <TableHead className="text-right">{t("th_actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="h-32 text-center text-muted-foreground animate-pulse"
                  >
                    {t("orders_loading")}
                  </TableCell>
                </TableRow>
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                    {t("orders_no_match")}
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell className="font-medium"><ProductNameDisplay name={o.product_name} /></TableCell>
                    <TableCell>
                      <div className="text-sm">{o.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{o.phone}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{o.wilaya}</TableCell>
                    <TableCell>{o.quantity}</TableCell>
                    <TableCell className="font-semibold">
                      {formatDZD(o.selling_price * o.quantity)}
                    </TableCell>
                    <TableCell className="font-semibold text-success">
                      {formatDZD(o.commission || 0)}
                    </TableCell>
                    <TableCell>
                      <div className="capitalize text-sm">{o.delivery_type || "N/A"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <StatusBadge status={o.status} />
                        {o.status === "cancelled" && o.cancellation_reason && (
                          <div className="flex items-start gap-1.5 mt-1.5 rounded-lg bg-destructive/10 border border-destructive/20 px-2 py-1.5 max-w-[220px]">
                            <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                            <p className="text-xs text-destructive leading-snug">
                              {o.cancellation_reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {o.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setEditingOrder(o)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(o.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between p-4 border-t">
          <span className="text-sm text-muted-foreground">
            {t("orders_page_of")} {page} {t("orders_of")} {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
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

function EditOrderDialog({
  order,
  open,
  onOpenChange,
}: {
  order: any;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { t } = useI18n();
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
    updateOrder.mutate(
      {
        id: order.id,
        customer_name: customerName,
        phone,
        wilaya,
        commune,
      },
      {
        onSuccess: () => {
          toast.success(t("orders_updated"));
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("orders_edit_title")} {order?.id}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{t("orders_customer_name")}</Label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>{t("profile_phone")}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>{t("profile_wilaya")}</Label>
            <Input value={wilaya} onChange={(e) => setWilaya(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>{t("profile_commune")}</Label>
            <Input value={commune} onChange={(e) => setCommune(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("orders_cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateOrder.isPending}
            className="gradient-brand text-brand-foreground border-0 shadow-brand"
          >
            {t("orders_save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
