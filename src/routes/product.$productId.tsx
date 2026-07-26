import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useProduct, useProducts, useTestimonials, formatDZD } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Download,
  ShoppingBag,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Truck,
  Star,
  Package,
  Users,
  Zap,
  Check,
  Heart,
  Share2,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { generateIntelligentDescription } from "@/lib/utils/product";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export const Route = createFileRoute("/product/$productId")({
  component: ProductPage,
});

function ProductPage() {
  const { productId } = Route.useParams();
  const { data: product, isLoading, error } = useProduct(productId);
  const { data: allProducts = [] } = useProducts();
  const { data: testimonials = [] } = useTestimonials();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [mainImgError, setMainImgError] = useState(false);

  // Initialize the main image index to the first valid (non-empty) image when product loads
  useEffect(() => {
    if (!product) return;
    const allImgs = [product.image, ...(product.images || [])].filter(Boolean);
    // allImgs[0] is already the first valid image; index stays 0 — but reset on product change
    setActiveImageIdx(0);
    setImgLoaded(false);
    setMainImgError(false);
  }, [product?.id]);

  // Products in same category (excluding current)
  const related = allProducts
    .filter((p) => p.id !== productId && p.category === product?.category)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-12 w-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Package className="h-16 w-16 text-muted-foreground/40" />
          <h2 className="text-2xl font-bold">Produit introuvable</h2>
          <p className="text-muted-foreground">Ce produit n'existe pas ou a été retiré.</p>
          <Button variant="outline" onClick={() => navigate({ to: "/" })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
          </Button>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(product.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${product.name.replace(/\s+/g, "_")}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image téléchargée avec succès");
    } catch {
      toast.error("Erreur lors du téléchargement de l'image");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier");
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    toast.success("Produit ajouté au panier");
  };

  const handleBuyNow = () => {
    addToCart(product);
    if (user) {
      navigate({ to: "/dashboard/new-order", search: { productId: product.id } });
    } else {
      navigate({ to: "/login" });
    }
  };

  const TRUST_BADGES = [
    { icon: Truck, label: "Livraison partout en Algérie", sub: "58 wilayas couvertes" },
    { icon: ShieldCheck, label: "Paiement à la livraison", sub: "Zéro risque pour le client" },
    { icon: Package, label: "Stock garanti", sub: "Géré par Droblow" },
    { icon: Zap, label: "Traitement rapide", sub: "Expédition en 24–48h" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PublicHeader />

      {/* ── Breadcrumb ── */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Accueil
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/" hash="products" className="hover:text-foreground transition-colors">
            Produits
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {product.category && (
            <>
              <span className="hover:text-foreground transition-colors cursor-pointer">
                {product.category}
              </span>
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <main className="flex-1">
        {/* ══════════════════ HERO SECTION ══════════════════ */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-accent/30 to-background">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              {(() => {
                // Build full image list, filtering out empty/falsy values
                const allImages = [product.image, ...(product.images || [])].filter(Boolean) as string[];

                // Find the first valid image starting from activeImageIdx,
                // skipping any that have already errored (mainImgError advances the index).
                const activeImgUrl = allImages[activeImageIdx] ?? null;

                return (
                  <>
                    {/* Left – Product Image Gallery */}
                    <div className="flex flex-col gap-4 lg:sticky lg:top-24">
                      {/* Main image */}
                      <div className="relative rounded-3xl border border-border/60 bg-card overflow-hidden aspect-square shadow-xl group">
                        {!imgLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
                        {activeImgUrl ? (
                          <img
                            key={activeImgUrl}
                            src={activeImgUrl}
                            alt={product.name}
                            onLoad={() => {
                              setImgLoaded(true);
                              setMainImgError(false);
                            }}
                            onError={() => {
                              // Current image failed — try the next one in the list
                              if (activeImageIdx < allImages.length - 1) {
                                setActiveImageIdx((prev) => prev + 1);
                                setImgLoaded(false);
                                setMainImgError(false);
                              } else {
                                setMainImgError(true);
                              }
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground/40">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                        {/* Category badge */}
                        {product.category && (
                          <span className="absolute top-4 left-4 rounded-full bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand border border-brand/20">
                            {product.category}
                          </span>
                        )}
                      </div>

                      {/* Gallery Thumbnails */}
                      {allImages.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                          {allImages.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setActiveImageIdx(idx);
                                setImgLoaded(false);
                              }}
                              className={`relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                                activeImageIdx === idx
                                  ? "border-brand shadow-md scale-105"
                                  : "border-transparent opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Action buttons below image */}
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <Button
                          variant="outline"
                          className="h-11 font-semibold gap-2"
                          onClick={async (e) => {
                            e.preventDefault();
                            toast.info("Préparation du téléchargement...");
                            try {
                              const zip = new JSZip();
                              const folder = zip.folder(product.name.replace(/\s+/g, "_"));

                              for (let i = 0; i < allImages.length; i++) {
                                const res = await fetch(allImages[i]);
                                const blob = await res.blob();
                                folder?.file(
                                  `${product.name.replace(/\s+/g, "_")}_${i + 1}.jpg`,
                                  blob,
                                );
                              }

                              const content = await zip.generateAsync({ type: "blob" });
                              saveAs(content, `${product.name.replace(/\s+/g, "_")}_Photos.zip`);
                              toast.success(
                                `Dossier ZIP contenant ${allImages.length} image(s) téléchargé avec succès !`,
                              );
                            } catch (error) {
                              console.error(error);
                              toast.error("Erreur lors de la préparation du fichier ZIP");
                            }
                          }}
                        >
                          <Download className="h-4 w-4" /> {t("product_page_download")} (
                          {allImages.length})
                        </Button>
                        <Button
                          variant="outline"
                          className="h-11 font-semibold gap-2"
                          onClick={handleShare}
                        >
                          <Share2 className="h-4 w-4" /> {t("product_page_share")}
                        </Button>
                      </div>
                    </div>
                  </>
                );
              })()}
              {/* Right – Product Details */}
              <div className="flex flex-col">
                {/* Category + name */}
                <div className="mb-6">
                  <h1
                    className="text-3xl md:text-4xl xl:text-5xl font-bold leading-tight tracking-tight"
                    dir="auto"
                  >
                    {product.name}
                  </h1>
                </div>

                {/* Rating placeholder */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{t("product_page_quality")}</span>
                </div>

                {/* Price */}
                <div className="mb-8 p-5 rounded-2xl bg-card border border-border/60 shadow-sm">
                  <div className="text-sm text-muted-foreground mb-1">
                    {t("product_page_selling_price")}
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-gradient-brand">
                    {formatDZD(product.price)}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-success font-medium">
                    <Check className="h-4 w-4" />
                    <span>Paiement à la livraison (COD) disponible</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8 rounded-2xl bg-muted/50 p-6 border border-border/40">
                  <h3 className="font-semibold text-base mb-3">Description du produit</h3>
                  <p
                    className="text-muted-foreground whitespace-pre-line leading-relaxed text-sm"
                    dir="auto"
                  >
                    {product.description ||
                      generateIntelligentDescription(product.name, product.category, product.price)}
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {product.is_active ? (
                    !user ? (
                      <Button
                        asChild
                        className="col-span-full h-14 text-base font-bold bg-muted text-muted-foreground hover:bg-muted hover:text-muted-foreground shadow-none border border-border"
                      >
                        <Link to="/login">{t("nav_sign_in")}</Link>
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="h-14 text-base font-bold border-2 gap-2"
                          onClick={handleAddToCart}
                        >
                          <ShoppingBag className="h-5 w-5" /> Ajouter au panier
                        </Button>
                        <Button
                          className="h-14 text-base font-bold gradient-brand text-brand-foreground shadow-brand gap-2"
                          onClick={handleBuyNow}
                        >
                          <CreditCard className="h-5 w-5" /> Acheter maintenant
                        </Button>
                      </>
                    )
                  ) : (
                    <div className="col-span-full h-14 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center font-bold text-lg border border-destructive/20">
                      Rupture de stock
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3">
                  {TRUST_BADGES.map((b) => (
                    <div
                      key={b.label}
                      className="flex items-center gap-3 rounded-xl bg-card border border-border/50 p-3"
                    >
                      <div className="h-9 w-9 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                        <b.icon className="h-4.5 w-4.5 text-brand" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold leading-tight">{b.label}</div>
                        <div className="text-[11px] text-muted-foreground">{b.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════ FEATURES / SELLING POINTS ══════════════════ */}
        <section className="py-16 border-y border-border bg-card/50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-2xl gradient-brand shadow-brand flex items-center justify-center">
                  <Truck className="h-7 w-7 text-brand-foreground" />
                </div>
                <h3 className="font-bold text-lg">Livraison rapide</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Disponible dans les 58 wilayas d'Algérie via nos partenaires de livraison agréés.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-2xl gradient-brand shadow-brand flex items-center justify-center">
                  <ShieldCheck className="h-7 w-7 text-brand-foreground" />
                </div>
                <h3 className="font-bold text-lg">Paiement sécurisé</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Le client paie uniquement à la réception. Aucun risque, aucune avance requise.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-2xl gradient-brand shadow-brand flex items-center justify-center">
                  <Users className="h-7 w-7 text-brand-foreground" />
                </div>
                <h3 className="font-bold text-lg">Support affilié</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Notre équipe est disponible pour vous accompagner dans la vente de ce produit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════ BOTTOM CTA BAND ══════════════════ */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="relative overflow-hidden rounded-3xl gradient-navy p-10 md:p-16 text-center shadow-xl">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand/30 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-success/30 blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-brand/20 px-4 py-1.5 text-brand text-sm font-bold mb-5">
                  <Zap className="h-4 w-4" /> Produit disponible
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" dir="auto">
                  Commander ce produit
                </h2>
                <p className="text-white/70 text-base max-w-xl mx-auto mb-8">
                  Ajoutez ce produit à votre panier et finalisez votre commande en quelques clics.
                  Paiement à la réception.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!user ? (
                    <Button
                      asChild
                      size="lg"
                      className="bg-white/10 text-white hover:bg-white/20 h-13 px-8 text-base font-bold"
                    >
                      <Link to="/login">{t("nav_sign_in")}</Link>
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={handleAddToCart}
                      className="gradient-brand text-brand-foreground shadow-brand h-13 px-8 text-base font-bold"
                    >
                      <ShoppingBag className="mr-2 h-5 w-5" /> {t("products_add_cart")}
                    </Button>
                  )}
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/70">
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand" /> Livraison partout en Algérie
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand" /> Paiement à la livraison
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════ TESTIMONIALS ══════════════════ */}
        {testimonials.length > 0 && (
          <section className="py-16 bg-accent/20 border-t border-border">
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center mb-10">
                <div className="text-sm font-bold uppercase tracking-widest text-success mb-2">
                  Avis clients
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary">
                  Ce que disent nos clients
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.slice(0, 3).map((t2: any) => (
                  <div
                    key={t2.id}
                    className="rounded-2xl border bg-card p-7 hover:shadow-lg transition-all"
                  >
                    <div className="flex gap-1 text-warning mb-4">
                      {[...Array(t2.rating ?? 5)].map((_: any, i: number) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-foreground leading-relaxed text-sm">"{t2.text}"</p>
                    <div className="mt-5 flex items-center gap-3">
                      {t2.avatar && (
                        <img
                          src={t2.avatar}
                          alt={t2.name}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-semibold">{t2.name}</div>
                        {t2.role && <div className="text-xs text-muted-foreground">{t2.role}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════ RELATED PRODUCTS ══════════════════ */}
        {related.length > 0 && (
          <section className="py-16 border-t border-border">
            <div className="mx-auto max-w-7xl px-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-sm font-bold uppercase tracking-widest text-success mb-1">
                    À découvrir
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">Produits similaires</h2>
                </div>
                <Button asChild variant="outline" className="hidden sm:flex gap-2">
                  <Link to="/" hash="products">
                    Voir tout <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    to="/product/$productId"
                    params={{ productId: p.id }}
                    className="group rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col"
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2" dir="auto">
                        {p.name}
                      </h3>
                      <div className="mt-auto">
                        <div className="text-base font-bold text-gradient-brand">
                          {formatDZD(p.price)}
                        </div>
                        <span className="mt-2 inline-flex items-center text-xs text-brand font-semibold gap-1">
                          Voir le produit <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
