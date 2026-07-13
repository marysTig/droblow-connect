import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/shared";
import { PRODUCTS, WILAYAS, formatDZD } from "@/lib/demo-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowRight, PackageCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/new-order")({ component: NewOrderPage });

function NewOrderPage() {
  const navigate = useNavigate();
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(PRODUCTS[0].suggestedPrice);
  const product = PRODUCTS.find((p) => p.id === productId)!;
  const commission = product.commission * qty;
  const totalMin = product.minPrice * qty;
  const profit = (price - product.minPrice) * qty + commission;

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader title="Create new order" subtitle="Fill in the customer details. We'll confirm and ship the order." />

      <form
        onSubmit={(e) => { e.preventDefault(); toast.success("Order created successfully!", { description: "Droblow team will confirm shortly." }); navigate({ to: "/dashboard/orders" }); }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          <Section title="Product">
            <div>
              <Label>Product</Label>
              <Select value={productId} onValueChange={(v) => { setProductId(v); setPrice(PRODUCTS.find((p) => p.id === v)!.suggestedPrice); }}>
                <SelectTrigger className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} · min {formatDZD(p.minPrice)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity</Label>
                <Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} className="mt-1.5 h-11" />
              </div>
              <div>
                <Label>Selling price (per unit)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(+e.target.value || 0)} className="mt-1.5 h-11" />
              </div>
            </div>
          </Section>

          <Section title="Customer">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Customer name</Label><Input className="mt-1.5 h-11" placeholder="Full name" /></div>
              <div><Label>Phone number</Label><Input className="mt-1.5 h-11" placeholder="0555 12 34 56" /></div>
              <div>
                <Label>Wilaya</Label>
                <Select><SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Choose wilaya" /></SelectTrigger>
                  <SelectContent>{WILAYAS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Commune</Label><Input className="mt-1.5 h-11" placeholder="Commune" /></div>
              <div className="md:col-span-2"><Label>Address</Label><Input className="mt-1.5 h-11" placeholder="Street, building, etc." /></div>
              <div className="md:col-span-2"><Label>Notes (optional)</Label><Textarea className="mt-1.5" placeholder="Delivery instructions…" /></div>
            </div>
          </Section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 sticky top-24">
            <div className="flex items-center gap-3 pb-4 border-b">
              <img src={product.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
              <div className="min-w-0">
                <div className="font-semibold truncate">{product.name}</div>
                <div className="text-xs text-muted-foreground">Qty: {qty}</div>
              </div>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Minimum price total" value={formatDZD(totalMin)} />
              <Row label="Selling price total" value={formatDZD(price * qty)} />
              <Row label="Base commission" value={formatDZD(commission)} accent="success" />
              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-sm font-medium">Expected profit</span>
                <span className="text-lg font-bold text-gradient-brand">{formatDZD(profit)}</span>
              </div>
            </dl>
            <Button type="submit" className="mt-5 w-full h-12 gradient-brand text-brand-foreground shadow-brand">
              <PackageCheck className="mr-2 h-5 w-5" /> Submit order <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="mt-3 text-[11px] text-muted-foreground text-center">Commission unlocks when the order is delivered.</p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4">
      <h2 className="font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: "success" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`font-semibold ${accent === "success" ? "text-success" : ""}`}>{value}</dd>
    </div>
  );
}
