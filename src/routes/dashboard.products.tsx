import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/shared";
import { formatDZD, useProducts } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/products")({ component: ProductsPage });

function ProductsPage() {
  const { data: products = [], isLoading } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = (p.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) || (p.description ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Products" subtitle="Choose products to promote and start earning." />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products…" 
            className="pl-9 h-10 bg-card" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {categories.map((c) => (
            <Badge 
              key={c} 
              variant={c === selectedCategory ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setSelectedCategory(c)}
            >
              {c}
            </Badge>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="h-72 rounded-2xl border bg-card animate-pulse" />)}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground">No products found matching your search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((p) => (
              <Link
                key={p.id}
                to="/product/$productId"
                params={{ productId: p.id }}
                className="group rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="aspect-square overflow-hidden bg-muted relative">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">{p.category}</span>
                </div>
                <div className="p-4 space-y-3 flex flex-col flex-1">
                  <div>
                    <h3 className="font-semibold leading-tight" dir="auto">{p.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Price</span>
                    {p.is_active ? (
                      <span className="text-base font-bold text-gradient-brand">{formatDZD(p.price)}</span>
                    ) : (
                      <span className="text-sm font-bold text-destructive">Rupture</span>
                    )}
                  </div>
                  {p.is_active ? (
                    <Button
                      asChild
                      size="sm"
                      className="w-full gradient-brand text-brand-foreground shadow-brand mt-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link to="/dashboard/new-order" search={{ productId: p.id }} onClick={(e) => e.stopPropagation()}>
                        <PlusCircle className="mr-1.5 h-4 w-4" /> Sell this product
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="w-full mt-auto border-destructive/20 text-destructive bg-destructive/5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Indisponible
                    </Button>
                  )}
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
