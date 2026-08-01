import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useImmobilierProducts, useAffiliateProfile } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard/shared";
import { Search, Building, MapPin, BedDouble, MoveDiagonal, Info, MessageCircle, Lock, CheckCircle2, CreditCard, Smartphone, PhoneCall } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/immobilier")({
  component: DashboardImmobilier,
});

function PaywallScreen() {
  return (
    <div className="flex flex-col items-center justify-center p-5 sm:p-6 bg-card/95 backdrop-blur-xl border border-border/50 rounded-[2rem] shadow-2xl space-y-5 animate-in zoom-in-95 duration-500 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
      {/* Lock icon hero */}
      <div className="relative mt-2">
        <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center shadow-inner">
          <Lock className="h-7 w-7 text-indigo-500" />
        </div>
        <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 border-2 border-card flex items-center justify-center shadow-lg">
          <Lock className="h-3 w-3 text-white" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          Section Immobilier
        </h2>
        <p className="text-muted-foreground leading-snug text-sm">
          Accédez aux offres exclusives et gagnez jusqu'à <span className="text-emerald-500 font-bold whitespace-nowrap">40 000 DZD</span> par vente.
        </p>
      </div>

      {/* Price badge */}
      <div className="w-full relative bg-gradient-to-b from-indigo-500/10 to-indigo-500/5 border-2 border-indigo-500/20 rounded-xl p-4 text-center shadow-sm">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
          Accès unique
        </div>
        <div className="text-4xl font-black text-indigo-500 tracking-tight mt-1 drop-shadow-sm">
          2 000 <span className="text-xl font-bold text-indigo-400/80">DA</span>
        </div>
        <div className="text-[10px] font-medium text-indigo-500/80 mt-1 uppercase tracking-wider">
          Paiement unique · À vie
        </div>
      </div>

      {/* Benefits list */}
      <div className="w-full space-y-2 text-left">
        {[
          "Accès total à toutes les annonces",
          "Commission de 40 000 DZD par vente",
          "Vidéos et détails exclusifs via WhatsApp",
        ].map((benefit) => (
          <div key={benefit} className="flex items-center gap-2.5 bg-muted/30 p-2 rounded-lg">
            <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            </div>
            <span className="text-xs font-medium text-foreground">{benefit}</span>
          </div>
        ))}
      </div>

      {/* Payment instructions */}
      <div className="w-full bg-card/80 border border-border/60 rounded-xl overflow-hidden shadow-inner">
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 justify-center">
          <CreditCard className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Comment débloquer l'accès
          </span>
        </div>
        <div className="p-3.5 space-y-3 text-left">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-500 shrink-0">1</div>
            <p className="text-xs text-muted-foreground leading-tight">Envoyez <strong className="text-foreground">2 000 DA</strong> via <strong className="text-foreground">BaridiMob/CCP</strong>.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-500 shrink-0">2</div>
            <p className="text-xs text-muted-foreground leading-tight">Envoyez le <strong className="text-foreground">reçu</strong> sur WhatsApp.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-500 shrink-0">3</div>
            <p className="text-xs text-muted-foreground leading-tight">L'accès est débloqué <strong className="text-foreground">immédiatement</strong>.</p>
          </div>
        </div>
      </div>

      {/* WhatsApp contact button */}
      <Button
        asChild
        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 group mt-1"
      >
        <a
          href="https://wa.me/213776338127?text=Bonjour%2C%20je%20souhaite%20débloquer%20la%20section%20Immobilier%20sur%20Droblow%20(2000%20DA).%20Voici%20ma%20preuve%20de%20paiement%20:"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center"
        >
          <MessageCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
          Contacter sur WhatsApp
        </a>
      </Button>
    </div>
  );
}

function DashboardImmobilier() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: affiliateProfile, isLoading: isLoadingProfile } = useAffiliateProfile(user?.id);
  const { data: properties = [], isLoading: isLoadingProps } = useImmobilierProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const isUnlocked = affiliateProfile?.immobilier_unlocked === true;

  const filteredProperties = properties.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      <PageHeader
        title={t("nav_immobilier")}
        description={isUnlocked ? "Découvrez nos offres immobilières." : "Section payante — débloquez votre accès."}
        icon={Building}
      />

      {isLoadingProfile ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="relative">
          {/* Overlay if not unlocked */}
          {!isUnlocked && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="fixed inset-0 bg-background/40 pointer-events-none" />
              <div className="relative z-10 w-full max-w-lg pointer-events-auto drop-shadow-2xl">
                <PaywallScreen />
              </div>
            </div>
          )}

          {/* Properties Content */}
          <div className={!isUnlocked ? "pointer-events-none select-none opacity-60 blur-[3px] transition-all duration-500" : "space-y-6 lg:space-y-8"}>
            <div className="space-y-6 lg:space-y-8">
              {/* ── Onboarding Banner ── */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 flex items-start gap-4">
                <div className="bg-indigo-500/20 p-2.5 rounded-xl shrink-0">
                  <MessageCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-1">Comment publier ces appartements ?</h4>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Quand vous avez choisi un appartement à publier, envoyez-nous un message sur WhatsApp en cliquant sur le bouton <strong>"Plus d'info"</strong> de l'annonce. Nous vous enverrons immédiatement les vidéos et tous les détails supplémentaires dont vous avez besoin pour le publier.
                  </p>
                </div>
              </div>

              {/* ── Search Bar ── */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Search className="h-5 w-5" />
                </div>
                <Input
                  type="text"
                  placeholder="Rechercher par titre, localisation ou catégorie..."
                  className="pl-10 h-12 rounded-xl text-base shadow-sm bg-card border-border/60"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* ── Grid ── */}
              {isLoadingProps ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[4/3] rounded-2xl border bg-card animate-pulse" />
                  ))}
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground bg-card rounded-2xl border">
                  Aucune offre trouvée.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredProperties.map((p) => (
                    <div
                      key={p.id}
                      className="group rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col"
                    >
                      {/* Image */}
                      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.title || "Immobilier"}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                            <Building className="h-12 w-12 opacity-50" />
                          </div>
                        )}
                        {p.category && (
                          <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-xs font-semibold uppercase tracking-wider z-20 shadow-sm">
                            {p.category}
                          </span>
                        )}
                        {/* Commission Badge */}
                        <span className="absolute top-3 right-3 rounded-full bg-emerald-500/90 text-white backdrop-blur px-3 py-1 text-xs font-bold tracking-wider z-20 shadow-md flex items-center gap-1.5">
                          Commission: 40 000 DZD
                        </span>
                      </div>

                      {/* Details */}
                      <div className="p-4 sm:p-5 flex flex-col flex-grow space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg leading-tight line-clamp-2" dir="auto">
                            {p.title}
                          </h3>
                          {p.location && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span className="line-clamp-1">{p.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-1 pb-1">
                          {p.rooms && (
                            <div className="flex items-center gap-1.5">
                              <BedDouble className="h-4 w-4" />
                              <span>{p.rooms}</span>
                            </div>
                          )}
                          {p.surface_m2 && (
                            <div className="flex items-center gap-1.5">
                              <MoveDiagonal className="h-4 w-4" />
                              <span>{p.surface_m2}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-1 mt-auto flex items-end justify-between">
                          <div>
                            <div className="text-xs text-muted-foreground mb-0.5">Prix</div>
                            <div className="text-lg font-bold text-gradient-brand">
                              {p.price || "Sur devis"}
                            </div>
                          </div>
                        </div>

                        {/* Info Button */}
                        <Button
                          asChild
                          className="w-full mt-3 gradient-brand text-brand-foreground shadow-brand font-medium h-10"
                        >
                          {p.detail_url ? (
                            <a href={p.detail_url} target="_blank" rel="noopener noreferrer">
                              <Info className="mr-2 h-4 w-4" />
                              Plus d'info
                            </a>
                          ) : p.phone ? (
                            <a
                              href={`https://wa.me/${p.phone.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(`Bonjour, je suis un affilié Droblow. Je souhaite publier l'appartement "${p.title}" (ID: ${p.id}). Pouvez-vous m'envoyer les vidéos et les détails ?`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Plus d'info (WhatsApp)
                            </a>
                          ) : (
                            <a href="#" onClick={(e) => { e.preventDefault(); alert("Plus d'informations bientôt disponibles."); }}>
                              <Info className="mr-2 h-4 w-4" />
                              Plus d'info
                            </a>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
