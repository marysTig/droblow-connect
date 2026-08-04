import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useImmobilierProducts, useAffiliateProfile } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard/shared";
import {
  Search, Building, MapPin, BedDouble, MoveDiagonal, Info,
  MessageCircle, Lock, CheckCircle2, CreditCard, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/immobilier")({
  component: DashboardImmobilier,
});

// ─── WhatsApp Number ──────────────────────────────────────────────────────────
const ADMIN_WHATSAPP = "213776338127";

// ─── Paywall Modal (shown on "Plus d'info" click when account locked) ─────────
function PaywallModal({ onClose }: { onClose: () => void }) {
  const waText = encodeURIComponent(
    "أريد دفع اشتراكي الشهري لقسم العقارات على Droblow (2000 دج). إليك دليل الدفع:"
  );
  const waLink = `https://wa.me/${ADMIN_WHATSAPP}?text=${waText}`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-md bg-card/95 backdrop-blur-xl border border-border/50 rounded-[2rem] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 h-8 w-8 rounded-full bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative w-fit mx-auto mt-2">
          <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center shadow-inner">
            <Lock className="h-7 w-7 text-indigo-500" />
          </div>
          <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 border-2 border-card flex items-center justify-center shadow-lg">
            <Lock className="h-3 w-3 text-white" />
          </div>
        </div>

        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            قسم العقارات
          </h2>
          <p className="text-muted-foreground leading-snug text-sm">
            قم بالوصول إلى العروض الحصرية واربح{" "}
            <span className="text-emerald-500 font-bold whitespace-nowrap" dir="ltr">
              40,000 دج
            </span>{" "}
            عن كل عملية بيع.
          </p>
        </div>

        <div className="w-full relative bg-gradient-to-b from-indigo-500/10 to-indigo-500/5 border-2 border-indigo-500/20 rounded-xl p-4 text-center shadow-sm">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
            اشتراك شهري
          </div>
          <div className="text-4xl font-black text-indigo-500 tracking-tight mt-1 drop-shadow-sm flex items-center justify-center gap-1.5" dir="ltr">
            2,000 <span className="text-xl font-bold text-indigo-400/80">دج</span>
          </div>
          <div className="text-[10px] font-medium text-indigo-500/80 mt-1 uppercase tracking-wider">
            دفع شهري
          </div>
        </div>

        <div className="w-full space-y-2 text-right">
          {[
            "وصول كامل إلى جميع الإعلانات",
            "عمولة ثابتة 40,000 دج عن كل عملية بيع",
            "إضافة عقارات جديدة يومياً مع متابعة شخصية VIP",
            "مقاطع فيديو وتفاصيل حصرية عبر واتساب",
            "توفير عملاء محتملين بأرقام هواتفهم وعناوينهم",
            "نشر عدد غير محدود من العقارات بكل المعلومات الموفرة عبر واتساب",
          ].map((benefit) => (
            <div
              key={benefit}
              className="flex items-center gap-2.5 bg-muted/30 p-2 rounded-lg"
            >
              <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              </div>
              <span className="text-xs font-medium text-foreground">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="w-full bg-card/80 border border-border/60 rounded-xl overflow-hidden shadow-inner">
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 justify-center">
            <CreditCard className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              كيفية تفعيل الوصول
            </span>
          </div>
          <div className="p-3.5 space-y-3 text-right">
            {[
              <>أرسل <strong className="text-foreground whitespace-nowrap" dir="ltr">2,000 دج</strong> عبر <strong className="text-foreground">BaridiMob/CCP</strong>.</>,
              <>أرسل <strong className="text-foreground">الإيصال</strong> عبر واتساب.</>,
              <>سيتم تفعيل الوصول <strong className="text-foreground">فوراً</strong>.</>,
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-500 shrink-0">
                  {i + 1}
                </div>
                <p className="text-xs text-muted-foreground leading-tight">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <Button
          asChild
          className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 group mt-1"
        >
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
            <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            أريد دفع اشتراكي الشهري
          </a>
        </Button>
      </div>
    </div>
  );
}

// ─── Build WhatsApp link for unlocked users ───────────────────────────────────
function buildInfoWaLink(property: { title?: string | null; id?: string }) {
  const text = encodeURIComponent(
    `أريد مزيداً من المعلومات حول هذا العقار: "${property.title}" (ID: ${property.id})`
  );
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${text}`;
}

// ─── Dashboard Component ──────────────────────────────────────────────────────
function DashboardImmobilier() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: affiliateProfile, isLoading: isLoadingProfile } = useAffiliateProfile(user?.id);
  const { data: properties = [], isLoading: isLoadingProps } = useImmobilierProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);

  const isUnlocked = affiliateProfile?.immobilier_unlocked === true;

  const filteredProperties = properties.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handler for "Plus d'info" button click
  const handleInfoClick = (
    e: React.MouseEvent,
    property: { title?: string | null; id?: string; phone?: string | null; detail_url?: string | null }
  ) => {
    if (!isUnlocked) {
      e.preventDefault();
      setPaywallOpen(true);
      return;
    }
    // Unlocked: navigate to WhatsApp with Arabic message
    // (handled by the <a> tag directly)
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      {/* Paywall modal */}
      {paywallOpen && <PaywallModal onClose={() => setPaywallOpen(false)} />}

      <PageHeader
        title={t("nav_immobilier")}
        description={isUnlocked ? "اكتشف عروضنا العقارية." : "Section payante — débloquez votre accès."}
        icon={Building}
      />

      {isLoadingProfile ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="relative">
          {/* Properties content */}
          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-6 lg:space-y-8">
              {/* Onboarding Banner */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 flex items-start gap-4">
                <div className="bg-indigo-500/20 p-2.5 rounded-xl shrink-0">
                  <MessageCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div dir="rtl" className="text-right">
                  <h4 className="text-lg font-semibold text-foreground mb-1">كيف تنشر هذه العقارات؟</h4>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    عندما تختار عقاراً للنشر، أرسل لنا رسالة عبر واتساب بالنقر على زر{" "}
                    <strong>"Plus d'info"</strong>. سنرسل لك فوراً مقاطع الفيديو وجميع التفاصيل الإضافية التي تحتاجها.
                  </p>
                </div>
              </div>

              {/* Search bar */}
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

              {/* Grid */}
              {isLoadingProps ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[4/3] rounded-2xl border bg-card animate-pulse" />
                  ))}
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground bg-card rounded-2xl border">
                  Aucune offre trouvée.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {filteredProperties.map((p) => {
                    // Build the href for the button
                    const waLink = buildInfoWaLink({ title: p.title, id: p.id });

                    return (
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
                            <span className="absolute top-2 left-2 rounded-full bg-background/90 backdrop-blur px-2 py-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider z-20 shadow-sm">
                              {p.category}
                            </span>
                          )}
                          <span className="absolute top-2 right-2 rounded-full bg-emerald-500/90 text-white backdrop-blur px-2 py-0.5 text-[10px] sm:text-xs font-bold tracking-wide z-20 shadow-md flex items-center gap-1">
                            <span className="hidden sm:inline">Commission: </span>40 000 DZD
                          </span>
                        </div>

                        {/* Details */}
                        <div className="p-2.5 sm:p-5 flex flex-col flex-grow space-y-2 sm:space-y-3">
                          <div>
                            <h3 className="font-semibold text-sm sm:text-lg leading-tight line-clamp-2" dir="auto">
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

                          {/* ── "Plus d'info" button ── */}
                          {isUnlocked ? (
                            /* Account activated → direct WhatsApp with Arabic message */
                            <Button
                              asChild
                              className="w-full mt-2 gradient-brand text-brand-foreground shadow-brand font-medium h-8 sm:h-10 text-[10px] sm:text-sm px-2 sm:px-4"
                            >
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1 sm:gap-2"
                              >
                                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                <span dir="rtl" className="hidden sm:inline">أريد مزيداً من المعلومات حول هذا العقار</span>
                                <span dir="rtl" className="sm:hidden leading-tight text-center">معلومات</span>
                              </a>
                            </Button>
                          ) : (
                            /* Account locked → open paywall modal */
                            <Button
                              className="w-full mt-2 gradient-brand text-brand-foreground shadow-brand font-medium h-8 sm:h-10 text-[10px] sm:text-sm px-2 sm:px-4"
                              onClick={(e) => handleInfoClick(e, p)}
                            >
                              <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                              <span className="ml-1 sm:ml-2">Plus d'info</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


