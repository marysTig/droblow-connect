import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/shared";
import { useProducts, useCreateOrder, formatDZD, getProductImage, useShippingRates } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import { WILAYAS, WILAYA_OPTIONS } from "@/lib/constants";
import wilayasData from "../../wilayas-with-municipalities.json";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowRight,
  PackageCheck,
  Home,
  Building2,
  CircleCheck,
  Circle,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({
  productId: z.string().optional().catch(""),
});

export const Route = createFileRoute("/dashboard/new-order")({
  component: NewOrderPage,
  validateSearch: searchSchema,
});

function NewOrderPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const search = useSearch({ from: Route.id });
  const { data: products = [], isLoading } = useProducts();
  const { data: shippingRates = [] } = useShippingRates();
  const createOrder = useCreateOrder();

  const [productId, setProductId] = useState<string>("");
  const [customPrice, setCustomPrice] = useState<string | number>("");
  const [qty, setQty] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<"home" | "desk" | null>("home");
  const [notes, setNotes] = useState("");

  const activeProducts = products.filter((p) => p.is_active);

  // Compute the actual product id to use (search param or first active product)
  const resolvedProductId = productId || search.productId || activeProducts[0]?.id || "";

  useEffect(() => {
    if (!productId && resolvedProductId) {
      setProductId(resolvedProductId);
      const p = activeProducts.find((x) => x.id === resolvedProductId);
      if (p) setCustomPrice(p.price);
    }
  }, [resolvedProductId, productId]);

  const handleProductChange = (v: string) => {
    setProductId(v);
    const p = activeProducts.find((x) => x.id === v);
    if (p) setCustomPrice(p.price);
  };

  const handleWilayaChange = (v: string) => {
    setWilaya(v);
    setCommune(""); // reset commune when wilaya changes
  };

  // Load communes for the selected wilaya from JSON
  const communes = useMemo(() => {
    const found = (wilayasData as any[]).find(
      (w) => w.nameFr.toLowerCase() === wilaya.toLowerCase(),
    );
    return found
      ? (found.communes as { id: number; nameFr: string }[]).sort((a, b) =>
          a.nameFr.localeCompare(b.nameFr),
        )
      : [];
  }, [wilaya]);

  const wilayaId = useMemo(() => String(WILAYAS.indexOf(wilaya) + 1).padStart(2, "0"), [wilaya]);
  const selectedShippingRate = useMemo(() => {
    const rate = shippingRates.find((r) => r.wilaya_id === wilayaId);
    if (rate) return rate;
    return {
      wilaya_id: wilayaId,
      home_delivery: 0,
      desk_delivery: 0,
      is_available: true,
    };
  }, [shippingRates, wilayaId]);

  const deliveryPrice = useMemo(() => {
    if (!selectedShippingRate) return 0;
    return deliveryType === "home"
      ? selectedShippingRate.home_delivery
      : selectedShippingRate.desk_delivery;
  }, [selectedShippingRate, deliveryType]);

  if (isLoading)
    return <div className="p-10 text-center animate-pulse">Chargement des produits...</div>;
  if (!isLoading && activeProducts.length === 0)
    return (
      <div className="p-10 text-center text-muted-foreground font-medium">
        Aucun produit n'est actuellement disponible à la vente.
      </div>
    );

  const product = activeProducts.find((p) => p.id === resolvedProductId) ?? activeProducts[0];
  if (!product)
    return <div className="p-10 text-center text-destructive">Produit introuvable.</div>;

  const totalPrice = customPrice === "" ? 0 : Number(customPrice);
  const baseTotal = product.price * qty;
  const isPriceValid = totalPrice >= baseTotal;
  const totalCommission = isPriceValid ? totalPrice - baseTotal : 0;
  const unitSellingPrice = isPriceValid ? totalPrice / qty : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !wilaya)
      return toast.error("Please fill in all required customer details");
    if (!isPriceValid)
      return toast.error("veillez mettre un prix égale ou supérieure aux prix du produit");

    createOrder.mutate(
      {
        id: `DR-${Math.floor(10000 + Math.random() * 90000)}`,
        product_id: product.id,
        product_name: product.name,
        quantity: qty,
        selling_price: unitSellingPrice,
        commission: totalCommission,
        customer_name: customerName,
        phone,
        wilaya,
        commune,
        address:
          deliveryType === "desk" ? (selectedShippingRate as any).office_address || "" : address,
        delivery_type: deliveryType,
        delivery_price: deliveryPrice,
        affiliate_id: user?.id,
        affiliate_name: user ? `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim() || null : null,
        status: "pending",
      },
      {
        onSuccess: () => {
          toast.success(t("new_order_success"), {
            description: "Droblow team will confirm shortly.",
          });
          navigate({ to: "/dashboard/orders" });
        },
        onError: (err) => {
          toast.error(t("new_order_error") + " " + err.message);
        },
      },
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader title={t("new_order_title")} subtitle={t("new_order_sub")} />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title={t("new_order_section_product")}>
            <div>
              <Label>{t("new_order_product")}</Label>
              <Select value={productId} onValueChange={handleProductChange}>
                <SelectTrigger className="mt-1.5 h-11">
                  <SelectValue placeholder={t("new_order_select_product")} />
                </SelectTrigger>
                <SelectContent>
                  {activeProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} · {formatDZD(p.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t("new_order_selling_price")}</Label>
                <Input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value ? Number(e.target.value) : "")}
                  className="mt-1.5 h-11"
                />
                {!isPriceValid && customPrice !== "" ? (
                  <div className="mt-1 space-y-0.5">
                    <p className="text-sm text-destructive">
                      {t("new_order_min_total")} {qty} {t("new_order_units")} :{" "}
                      {formatDZD(baseTotal)}
                    </p>
                    <p className="text-sm text-destructive">
                      {t("new_order_current_total")} {formatDZD(totalPrice)}
                    </p>
                  </div>
                ) : customPrice !== "" ? (
                  <div className="mt-1 space-y-0.5">
                    <p className="text-sm text-success">
                      {t("new_order_total_commission")} ({qty} {t("new_order_units")}) :{" "}
                      {formatDZD(totalCommission)}
                    </p>
                  </div>
                ) : null}
              </div>
              <div>
                <Label>{t("new_order_qty")}</Label>
                <Input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, +e.target.value || 1))}
                  className="mt-1.5 h-11"
                />
              </div>
            </div>
          </Section>

          <Section title={t("new_order_section_customer")}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  {t("new_order_customer")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="mt-1.5 h-11"
                  placeholder={t("new_order_ph_name")}
                />
              </div>
              <div>
                <Label>
                  {t("new_order_phone")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-1.5 h-11"
                  placeholder={t("new_order_ph_phone")}
                />
              </div>
              <div>
                <Label>
                  {t("new_order_wilaya")} <span className="text-destructive">*</span>
                </Label>
                <Select value={wilaya} onValueChange={handleWilayaChange}>
                  <SelectTrigger className="mt-1.5 h-11">
                    <SelectValue placeholder={t("register_wilaya_ph")} />
                  </SelectTrigger>
                  <SelectContent>
                    {WILAYA_OPTIONS.map((w) => (
                      <SelectItem key={w.value} value={w.value}>
                        {w.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("new_order_commune")}</Label>
                <Select
                  value={commune}
                  onValueChange={setCommune}
                  disabled={!wilaya || communes.length === 0}
                >
                  <SelectTrigger className="mt-1.5 h-11">
                    <SelectValue
                      placeholder={wilaya ? t("register_commune_ph") : t("register_commune_first")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {communes.map((c) => (
                      <SelectItem key={c.id} value={c.nameFr}>
                        {c.nameFr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div
                className={`md:col-span-2 transition-all rounded-xl ${deliveryType === "desk" ? "p-4 bg-brand/5 border-2 border-brand/30" : ""}`}
              >
                <Label
                  className={`flex items-center gap-1.5 ${deliveryType === "desk" ? "text-brand font-bold mb-2" : ""}`}
                >
                  {deliveryType === "desk" && <MapPin className="h-4 w-4" />}
                  {deliveryType === "desk"
                    ? "Adresse du point relais / bureau de livraison"
                    : t("new_order_address")}
                </Label>
                <Input
                  value={
                    deliveryType === "desk"
                      ? (selectedShippingRate as any).office_address || "—"
                      : address
                  }
                  onChange={(e) => setAddress(e.target.value)}
                  className={`mt-1.5 h-11 ${deliveryType === "desk" ? "bg-white/50 dark:bg-black/50 border-brand/20 text-brand font-medium pointer-events-none" : ""}`}
                  placeholder={t("new_order_ph_address")}
                  readOnly={deliveryType === "desk"}
                />
                {deliveryType === "desk" && (
                  <p className="mt-2 text-xs text-brand/80 font-medium">
                    Il s'agit de l'adresse où le client devra récupérer sa commande.
                  </p>
                )}
              </div>

              {wilaya && (
                <div className="md:col-span-2 pt-2">
                  <Label className="mb-3 block">Type de livraison</Label>
                  <RadioGroup
                    value={deliveryType || "home"}
                    onValueChange={(val: "home" | "desk") => setDeliveryType(val)}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div
                      className={`relative flex flex-col space-y-3 border-2 rounded-xl p-5 cursor-pointer transition-all ${deliveryType === "home" ? "border-brand bg-brand/5 shadow-sm" : "border-border hover:bg-muted/50"}`}
                      onClick={() => setDeliveryType("home")}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Home
                            className={`h-5 w-5 ${deliveryType === "home" ? "text-brand" : "text-muted-foreground"}`}
                          />
                          <Label htmlFor="home" className="cursor-pointer font-bold text-base">
                            À Domicile
                          </Label>
                        </div>
                        <RadioGroupItem value="home" id="home" className="sr-only" />
                        {deliveryType === "home" ? (
                          <CircleCheck className="h-6 w-6 text-brand" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground/30" />
                        )}
                      </div>
                      <div>
                        <div className="text-2xl font-black text-foreground">
                          {formatDZD(selectedShippingRate.home_delivery)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sera ajouté au total à payer par le client
                        </p>
                      </div>
                    </div>

                    <div
                      className={`relative flex flex-col space-y-3 border-2 rounded-xl p-5 cursor-pointer transition-all ${deliveryType === "desk" ? "border-brand bg-brand/5 shadow-sm" : "border-border hover:bg-muted/50"}`}
                      onClick={() => setDeliveryType("desk")}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Building2
                            className={`h-5 w-5 ${deliveryType === "desk" ? "text-brand" : "text-muted-foreground"}`}
                          />
                          <Label htmlFor="desk" className="cursor-pointer font-bold text-base">
                            Point Relais / Bureau
                          </Label>
                        </div>
                        <RadioGroupItem value="desk" id="desk" className="sr-only" />
                        {deliveryType === "desk" ? (
                          <CircleCheck className="h-6 w-6 text-brand" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground/30" />
                        )}
                      </div>
                      <div>
                        <div className="text-2xl font-black text-foreground">
                          {formatDZD(selectedShippingRate.desk_delivery)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sera ajouté au total à payer par le client
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                  {!selectedShippingRate.is_available && (
                    <p className="mt-2 text-sm text-destructive">
                      La livraison n'est actuellement pas disponible pour cette wilaya.
                    </p>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <Label>{t("new_order_notes")}</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1.5"
                  placeholder={t("new_order_ph_notes")}
                />
              </div>
            </div>
          </Section>
        </div>

        <aside>
          <div className="rounded-2xl border bg-card p-5 sticky top-24">
            <div className="flex items-center gap-3 pb-4 border-b">
              {getProductImage(product) ? (
                <img src={getProductImage(product)!} alt="" className="h-14 w-14 rounded-xl object-cover" />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              <div className="min-w-0">
                <div className="font-semibold truncate">{product.name}</div>
                <div className="text-xs text-muted-foreground">Qty: {qty}</div>
              </div>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">
                  {t("new_order_summary_base_price")} (x{qty})
                </dt>
                <dd className="font-semibold">{formatDZD(baseTotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">
                  {t("new_order_summary_selling_price")} (Total)
                </dt>
                <dd className="font-semibold">{formatDZD(totalPrice)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground text-success">
                  {t("new_order_summary_commission")} (x{qty})
                </dt>
                <dd className="font-semibold text-success">{formatDZD(totalCommission)}</dd>
              </div>
              <div className="flex items-center justify-between pt-2">
                <dt className="text-muted-foreground">
                  Livraison ({deliveryType === "home" ? "Domicile" : "Bureau"})
                </dt>
                <dd className="font-semibold">{formatDZD(deliveryPrice)}</dd>
              </div>
              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-sm font-medium">{t("new_order_summary_total")} (Client)</span>
                <span className="text-lg font-bold text-gradient-brand">
                  {formatDZD(totalPrice + deliveryPrice)}
                </span>
              </div>
            </dl>
            <Button
              disabled={
                createOrder.isPending ||
                !isPriceValid ||
                (selectedShippingRate && !selectedShippingRate.is_available)
              }
              type="submit"
              className="mt-5 w-full h-12 gradient-brand text-brand-foreground shadow-brand"
            >
              <PackageCheck className="mr-2 h-5 w-5" />{" "}
              {createOrder.isPending ? t("dash_loading") : t("new_order_submit")}{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="mt-3 text-[11px] text-muted-foreground text-center">
              Our team will confirm your order shortly.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4">
      <h2 className="font-semibold" dir="auto">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
