import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/shared";
import { PRODUCTS, formatDZD } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/products")({ component: ProductsPage });

function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Products" subtitle="Choose products to promote and start earning." />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products…" className="pl-9 h-10 bg-card" />
        </div>
        <div className="flex gap-2">
          {["All", "Electronics", "Home", "Beauty", "Kids"].map((c, i) => (
            <Badge key={c} variant={i === 0 ? "default" : "outline"} className="cursor-pointer">{c}</Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {PRODUCTS.map((p) => (
          <div key={p.id} className="group rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="aspect-square overflow-hidden bg-muted relative">
              <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">{p.category}</span>
              <span className="absolute top-3 right-3 rounded-full bg-success/90 text-white px-2.5 py-1 text-[10px] font-semibold">{p.stock} in stock</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold leading-tight">{p.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="rounded-lg bg-muted/60 py-1.5">
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Min</div>
                  <div className="text-xs font-semibold">{formatDZD(p.minPrice)}</div>
                </div>
                <div className="rounded-lg bg-muted/60 py-1.5">
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Sell</div>
                  <div className="text-xs font-semibold">{formatDZD(p.suggestedPrice)}</div>
                </div>
                <div className="rounded-lg gradient-brand py-1.5 text-brand-foreground">
                  <div className="text-[9px] uppercase tracking-wider opacity-80">Profit</div>
                  <div className="text-xs font-bold">{formatDZD(p.commission)}</div>
                </div>
              </div>
              <Button asChild size="sm" className="w-full gradient-brand text-brand-foreground shadow-brand">
                <Link to="/dashboard/new-order"><PlusCircle className="mr-1.5 h-4 w-4" /> Sell this product</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
