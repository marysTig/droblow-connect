import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/shared";
import { useShippingRates, formatDZD } from "@/lib/queries";
import { WILAYAS } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Home, Building2, Info, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Route = createFileRoute("/dashboard/shipping")({ component: ShippingRatesPage });

function ShippingRatesPage() {
  const { t } = useI18n();
  const { data: shippingRates = [], isLoading } = useShippingRates();
  const [search, setSearch] = useState("");

  const filtered = shippingRates.filter((rate) => {
    const name = WILAYAS[parseInt(rate.wilaya_id, 10) - 1] ?? "";
    return name.toLowerCase().includes(search.toLowerCase()) || rate.wilaya_id.includes(search);
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("shipping_page_title")} subtitle={t("shipping_page_sub")} />

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4">
        <Info className="h-4 w-4 text-brand flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">{t("shipping_page_info")}</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une wilaya..."
          className="pl-9 h-10 bg-card"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl border bg-card animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">{t("shipping_empty")}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((rate) => {
            const wilayaName = WILAYAS[parseInt(rate.wilaya_id, 10) - 1] ?? "—";
            return (
              <div
                key={rate.wilaya_id}
                className={`rounded-2xl border bg-card p-4 space-y-3 transition-all hover:shadow-md hover:-translate-y-0.5 ${!rate.is_available ? "opacity-50" : ""}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {rate.wilaya_id}
                    </span>
                    <h3 className="font-bold text-base leading-tight">{wilayaName}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {rate.is_available ? (
                      <Badge
                        variant="outline"
                        className="bg-success/10 text-success border-success/20 text-[10px] shrink-0"
                      >
                        {t("shipping_available")}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] shrink-0"
                      >
                        {t("shipping_unavailable")}
                      </Badge>
                    )}
                    {(rate as any).delivery_time && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {(rate as any).delivery_time}
                      </span>
                    )}
                  </div>
                </div>

                {/* Address */}
                {(rate as any).office_address && (
                  <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2">
                    <MapPin className="h-3.5 w-3.5 text-brand flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {(rate as any).office_address}
                    </p>
                  </div>
                )}

                {/* Prices */}
                {rate.is_available && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-brand/5 border border-brand/10 px-3 py-2">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                        <Home className="h-3 w-3" />
                        {t("shipping_home")}
                      </div>
                      <p className="font-bold text-sm text-brand">
                        {formatDZD(rate.home_delivery)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 px-3 py-2">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                        <Building2 className="h-3 w-3" />
                        {t("shipping_desk")}
                      </div>
                      <p className="font-bold text-sm text-emerald-600">
                        {formatDZD(rate.desk_delivery)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        {shippingRates.filter((r) => r.is_available).length} wilayas disponibles sur{" "}
        {shippingRates.length}
      </p>
    </div>
  );
}
