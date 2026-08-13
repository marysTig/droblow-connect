import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader } from "@/components/dashboard/shared";
import { ProductsHubCards } from "@/components/dashboard/shared/ProductsHubCards";
import { formatDZD, getProductImage, useProducts, useCategories } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ImageIcon } from "lucide-react";
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

function ProductImageWithLoading({ src, alt, category }: { src: string | null; alt: string; category?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  if (!src) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted absolute inset-0">
        <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <>
      {/* Placeholder affiché tant que l'image n'est pas chargée (pour la catégorie Promotion ou toutes) */}
      {!loaded && !error && (
        <div className="h-full w-full flex items-center justify-center bg-muted absolute inset-0 z-0">
          <ImageIcon className="w-12 h-12 text-muted-foreground/40 animate-pulse" />
        </div>
      )}
      {error && (
        <div className="h-full w-full flex items-center justify-center bg-muted absolute inset-0 z-0">
          <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        className={`h-full w-full object-cover transition-all duration-500 z-10 relative ${loaded && !error ? 'opacity-100 group-hover:scale-105' : 'opacity-0'}`}
      />
    </>
  );
}

const searchSchema = z.object({
  q: z.string().optional(),
});

export const Route = createFileRoute("/dashboard/products")({
  component: ProductsPage,
  validateSearch: searchSchema,
});

function ProductsPage() {
  const { t } = useI18n();
  const { addToCart } = useCart();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: dbCategories = [], isLoading: isLoadingCategories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [promoSeed, setPromoSeed] = useState(() => Math.random());

  useEffect(() => {
    if (!isLoadingProducts && selectedCategory === null) {
      const hasPromo = products.some(p => (p.category ?? "").toLowerCase().trim() === "promotion");
      setSelectedCategory(hasPromo ? "Promotion" : "All");
    }
  }, [isLoadingProducts, products, selectedCategory]);

  const activeCategory = selectedCategory ?? "Promotion";

  const isLoading = isLoadingProducts || isLoadingCategories;

  // Build categories from actual product data (source of truth for filtering)
  // Then enrich with images from the DB categories table where names match
  const productCategoryNames = Array.from(
    new Set(products.map((p) => (p.category ?? "").trim()).filter(Boolean)),
  ).sort();

  const hasPromo = productCategoryNames.some((c) => c.toLowerCase() === "promotion");
  const nonPromoCategories = productCategoryNames.filter((c) => c.toLowerCase() !== "promotion");

  const promoDbMatch = dbCategories.find((c) => c.name.toLowerCase().trim() === "promotion");

  const categoriesToDisplay = [
    ...(hasPromo ? [{ id: "Promotion", name: "Promotion", image: promoDbMatch?.image ?? null }] : []),
    { id: "all", name: "All", image: null as string | null },
    ...nonPromoCategories.map((name) => {
      // Try to find a matching DB category for its image (case-insensitive)
      const dbMatch = dbCategories.find(
        (c) => c.name.toLowerCase().trim() === name.toLowerCase().trim(),
      );
      return { id: name, name, image: dbMatch?.image ?? null };
    }),
  ];

  const { q } = Route.useSearch();
  const searchQuery = q || "";

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // When searching, ignore category filter — search ALL products
      if (!searchQuery && activeCategory !== "All" && (p.category ?? "").trim().toLowerCase() !== activeCategory.trim().toLowerCase()) {
        return false;
      }
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });

    // Shuffle products consistently based on the seed for all categories
    // Using a simple seeded-like approach based on the id to keep it stable during search
    result = [...result].sort((a, b) => {
      const hash = (str: string | undefined) => {
        if (!str) return 0;
        let h = 0;
        for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
        return h;
      };
      const randA = Math.sin(hash(a.id) * promoSeed);
      const randB = Math.sin(hash(b.id) * promoSeed);
      return randA - randB;
    });

    return result;
  }, [products, selectedCategory, searchQuery, promoSeed]);

  const [visibleCount, setVisibleCount] = useState(24);

  return (
    <div className="space-y-6">
      <ProductsHubCards />

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
                  const isSelected = activeCategory === (cat.id === "all" ? "All" : cat.name);
                  return (
                    <CarouselItem
                      key={cat.id || i}
                      className="pl-4 basis-[120px] sm:basis-[140px] md:basis-[160px]"
                    >
                      <div
                        className={`flex flex-col items-center group cursor-pointer h-full transition-opacity duration-300 ${isSelected ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                        onClick={() => {
                          setSelectedCategory(cat.id === "all" ? "All" : cat.name);
                          setVisibleCount(24);
                          setPromoSeed(Math.random());
                        }}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl border bg-card animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground">{t("products_empty")}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.slice(0, visibleCount).map((p) => (
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
                    <ProductImageWithLoading 
                      src={getProductImage(p)} 
                      alt={p.name} 
                      category={p.category} 
                    />
                    <span className="absolute top-2 left-2 rounded-full bg-background/90 backdrop-blur px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider z-20">
                      {p.category}
                    </span>
                  </div>
                  <div className="p-2 sm:p-4 space-y-1 sm:space-y-2">
                    <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2" dir="auto">
                      {p.name}
                    </h3>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{t("product_card_price")}</span>
                      {p.is_active ? (
                        <div className="flex flex-col items-end">
                          <span className="text-sm sm:text-base font-bold text-gradient-brand leading-none">
                            {formatDZD(p.price)}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-success font-medium mt-0.5">
                            {t("product_in_stock")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-destructive">{t("product_card_out_of_stock")}</span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Add to cart button */}
                <div className="px-2 sm:px-4 pb-2 sm:pb-4 mt-auto">
                  {p.is_active ? (
                    <Button
                      size="sm"
                      className="w-full gradient-brand text-brand-foreground shadow-brand text-xs sm:text-sm h-8 sm:h-9"
                      onClick={() => {
                        addToCart({ id: p.id, name: p.name, image: getProductImage(p) ?? p.image, price: p.price });
                        toast.success(t("cart_added"));
                      }}
                    >
                      <ShoppingBag className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                      {t("products_add_cart")}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="w-full border-destructive/20 text-destructive bg-destructive/5 text-xs sm:text-sm h-8 sm:h-9"
                    >
                      {t("product_card_unavailable")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {visibleCount < filteredProducts.length && (
            <div className="flex justify-center pt-8">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => setVisibleCount(v => v + 24)}
              >
                {t("products_load_more")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
