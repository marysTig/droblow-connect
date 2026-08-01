import { createFileRoute } from "@tanstack/react-router";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useImmobilierProduct } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { 
  Building, MapPin, BedDouble, MoveDiagonal, Info, ArrowLeft,
  Phone, Home, CheckCircle2, Share2, ShieldCheck, Star
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/immobilier/$id")({
  component: ImmobilierLandingPage,
});

function ImmobilierLandingPage() {
  const { id } = Route.useParams();
  const { data: property, isLoading } = useImmobilierProduct(id);

  const [mainImgError, setMainImgError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: property?.title || "Immobilier Droblow",
          text: "Découvrez ce superbe bien immobilier !",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Lien copié dans le presse-papier !");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PublicHeader />
        <main className="flex-1 max-w-7xl mx-auto px-4 w-full py-12 animate-pulse">
          <div className="h-[400px] bg-muted rounded-3xl mb-8"></div>
          <div className="space-y-4 max-w-2xl">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex flex-col items-center justify-center py-24 text-center">
          <Building className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Bien introuvable</h1>
          <p className="text-muted-foreground mb-6">Cette annonce immobilière n'existe plus ou l'URL est invalide.</p>
          <Button asChild>
            <a href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil</a>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20">
      <PublicHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 sm:py-12">
        {/* Breadcrumb / Top Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <a href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </a>
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="rounded-full">
            <Share2 className="mr-2 h-4 w-4" />
            Partager
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Image */}
          <div className="space-y-6">
            <div className="aspect-[4/3] sm:aspect-video lg:aspect-square bg-muted rounded-3xl overflow-hidden relative shadow-lg ring-1 ring-border">
              {!mainImgError && property.image_url ? (
                <img
                  src={property.image_url}
                  alt={property.title || "Image du bien"}
                  className="w-full h-full object-cover"
                  onError={() => setMainImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <Building className="h-16 w-16 mb-4 opacity-50" />
                  <p>Aucune image disponible</p>
                </div>
              )}
              {property.category && (
                <div className="absolute top-4 left-4">
                  <span className="bg-background/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-sm">
                    {property.category}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col">
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4 leading-tight" dir="auto">
                {property.title}
              </h1>
              
              {property.location && (
                <div className="flex items-center text-lg text-muted-foreground mb-6">
                  <MapPin className="mr-2 h-5 w-5 text-primary" />
                  <span>{property.location}</span>
                </div>
              )}

              <div className="flex flex-wrap items-baseline gap-3 mb-8">
                <span className="text-4xl sm:text-5xl font-black text-gradient-brand">
                  {property.price || "Sur devis"}
                </span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {property.rooms && (
                <div className="bg-muted/50 rounded-2xl p-4 border border-border/50 text-center">
                  <BedDouble className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground mb-1">Chambres</div>
                  <div className="font-bold">{property.rooms}</div>
                </div>
              )}
              {property.surface_m2 && (
                <div className="bg-muted/50 rounded-2xl p-4 border border-border/50 text-center">
                  <MoveDiagonal className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground mb-1">Surface</div>
                  <div className="font-bold">{property.surface_m2} m²</div>
                </div>
              )}
              {property.type && (
                <div className="bg-muted/50 rounded-2xl p-4 border border-border/50 text-center">
                  <Home className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground mb-1">Type</div>
                  <div className="font-bold">{property.type}</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 mb-10 bg-card border rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Intéressé par ce bien ?</h3>
              {property.phone && (
                <Button 
                  size="lg" 
                  className="w-full text-base h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                  asChild
                >
                  <a href={`tel:${property.phone}`}>
                    <Phone className="mr-2 h-5 w-5" />
                    Appeler le {property.phone}
                  </a>
                </Button>
              )}
              
              {property.detail_url && (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full text-base h-14 rounded-2xl border-2"
                  asChild
                >
                  <a href={property.detail_url} target="_blank" rel="noopener noreferrer">
                    <Info className="mr-2 h-5 w-5" />
                    Plus d'informations
                  </a>
                </Button>
              )}

              {!property.phone && !property.detail_url && (
                <Button size="lg" className="w-full text-base h-14 rounded-2xl" disabled>
                  Contact indisponible
                </Button>
              )}
            </div>

            {/* Features/Trust badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto border-t pt-8">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="bg-primary/10 p-2 rounded-full">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Annonce vérifiée</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Qualité Premium</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
