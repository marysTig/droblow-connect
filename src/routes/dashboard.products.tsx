import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/shared";
import { formatDZD, useProducts, useCategories } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/products")({ component: ProductsPage });

function ProductsPage() {
  const { t } = useI18n();
  const { addToCart } = useCart();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: dbCategories = [], isLoading: isLoadingCategories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const isLoading = isLoadingProducts || isLoadingCategories;

  // Build categories from actual product data (source of truth for filtering)
  // Then enrich with images from the DB categories table where names match
  const productCategoryNames = Array.from(
    new Set(products.map((p) => (p.category ?? "").trim()).filter(Boolean)),
  ).sort();

  const categoriesToDisplay = [
    { id: "all", name: "All", image: null as string | null },
    ...productCategoryNames.map((name) => {
      // Try to find a matching DB category for its image (case-insensitive)
      const dbMatch = dbCategories.find(
        (c) => c.name.toLowerCase().trim() === name.toLowerCase().trim(),
      );
      return { id: name, name, image: dbMatch?.image ?? null };
    }),
  ];

  // Exact match against product category field (both trimmed)
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === "All") return true;
    return (p.category ?? "").trim() === selectedCategory.trim();
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary" dir="auto">
          {t("products_page_title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("products_page_sub")}</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Categories Carousel */}
        {!isLoadingCategories && categoriesToDisplay.length > 1 && (
          <div className="w-full px-2 lg:px-4">
            <Carousel
              opts={{
                align: "start",
                dragFree: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 py-4">
                {categoriesToDisplay.map((cat, i) => {
                  const isSelected = selectedCategory === (cat.id === "all" ? "All" : cat.name);
                  return (
                    <CarouselItem
                      key={cat.id || i}
                      className="pl-4 basis-[120px] sm:basis-[140px] md:basis-[160px]"
                    >
                      <div
                        className={`flex flex-col items-center group cursor-pointer h-full transition-opacity duration-300 ${isSelected ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                        onClick={() => setSelectedCategory(cat.id === "all" ? "All" : cat.name)}
                      >
                        <div
                          className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-card shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 ${isSelected ? "ring-2 ring-success shadow-md -translate-y-1" : ""}`}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 rounded-full bg-success/10 z-0" />
                          )}
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="absolute z-10 w-[75%] h-[75%] object-contain rounded-full drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute z-10 w-[75%] h-[75%] rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-sm sm:text-base">
                              {cat.id === "all" ? t("products_all") : cat.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <h3
                          className={`mt-4 text-center text-xs sm:text-sm max-w-[120px] leading-tight break-words ${isSelected ? "font-bold text-primary" : "font-medium text-muted-foreground group-hover:text-foreground"}`}
                          dir="auto"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {cat.id === "all" ? t("products_all") : cat.name}
                        </h3>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4 h-10 w-10 shadow-sm border-border bg-card text-foreground" />
              <CarouselNext className="hidden md:flex -right-4 h-10 w-10 shadow-sm border-border bg-card text-foreground" />
            </Carousel>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 rounded-2xl border bg-card animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground">{t("products_empty")}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="group rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col"
            >
              {/* Image — clickable to product page */}
              <Link
                to="/product/$productId"
                params={{ productId: p.id }}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="aspect-square overflow-hidden bg-muted relative">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
                    {p.category}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold leading-tight" dir="auto">
                    {p.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">Prix</span>
                    {p.is_active ? (
                      <span className="text-base font-bold text-gradient-brand">
                        {formatDZD(p.price)}
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-destructive">Rupture</span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Add to cart button */}
              <div className="px-4 pb-4 mt-auto">
                {p.is_active ? (
                  <Button
                    size="sm"
                    className="w-full gradient-brand text-brand-foreground shadow-brand"
                    onClick={() => {
                      addToCart({ id: p.id, name: p.name, image: p.image, price: p.price });
                      toast.success("Produit ajouté au panier");
                    }}
                  >
                    <ShoppingBag className="mr-1.5 h-4 w-4" />
                    {t("products_add_cart")}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="w-full border-destructive/20 text-destructive bg-destructive/5"
                  >
                    {t("product_card_unavailable")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
