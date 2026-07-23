import { useState, useMemo } from "react";
import { useCart } from "@/lib/cart-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDZD, useShippingRates, useCreateOrder } from "@/lib/queries";
import { WILAYAS, WILAYA_OPTIONS } from "@/lib/constants";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Home,
  Building2,
  CircleCheck,
  Circle,
  Loader2,
  CheckCircle,
  MapPin,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useLocation } from "@tanstack/react-router";
import wilayasData from "../../../wilayas-with-municipalities.json";

function generateId() {
  return "order-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
}

export function CartDrawer() {
  const { user } = useAuth();
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeFromCart,
    totalPrice,
    clearCart,
  } = useCart();
  const { t } = useI18n();
  const { data: shippingRates = [] } = useShippingRates();
  const createOrder = useCreateOrder();

  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const showAffiliateFeatures = !!user || isDashboard;

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<"home" | "desk">("home");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Custom selling prices for affiliates
  const [sellingPrices, setSellingPrices] = useState<Record<string, number>>({});

  const handleSellingPriceChange = (productId: string, val: string) => {
    const num = parseInt(val, 10);
    setSellingPrices((prev) => ({
      ...prev,
      [productId]: isNaN(num) ? 0 : num,
    }));
  };

  // Communes for selected wilaya
  const communes = useMemo(() => {
    if (!wilaya) return [];
    const found = (wilayasData as any[]).find(
      (w) => w.nameFr === wilaya || w.wilaya_name_ascii === wilaya || w.wilaya_name === wilaya,
    );
    if (!found || !found.communes) return [];
    return found.communes.map((c: any) => c.nameFr || c).sort();
  }, [wilaya]);

  // Shipping rate for selected wilaya
  const wilayaId = useMemo(() => String(WILAYAS.indexOf(wilaya) + 1).padStart(2, "0"), [wilaya]);
  const shippingRate = useMemo(() => {
    const rate = shippingRates.find((r) => r.wilaya_id === wilayaId);
    return rate ?? { home_delivery: 0, desk_delivery: 0, is_available: true };
  }, [shippingRates, wilayaId]);

  // Subtotal using custom selling prices if affiliate is logged in
  const cartSubtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = showAffiliateFeatures
        ? (sellingPrices[item.product.id] ?? item.product.price)
        : item.product.price;
      return sum + price * item.quantity;
    }, 0);
  }, [items, showAffiliateFeatures, sellingPrices]);

  const totalCommission = useMemo(() => {
    return items.reduce((sum, item) => {
      if (!showAffiliateFeatures) return sum;
      const sellingPrice = sellingPrices[item.product.id] ?? item.product.price;
      const commission = (sellingPrice - item.product.price) * item.quantity;
      return sum + (commission > 0 ? commission : 0);
    }, 0);
  }, [items, showAffiliateFeatures, sellingPrices]);

  const deliveryPrice =
    deliveryType === "home" ? (shippingRate.home_delivery ?? 0) : (shippingRate.desk_delivery ?? 0);
  const grandTotal = cartSubtotal + deliveryPrice;

  const handleWilayaChange = (val: string) => {
    setWilaya(val);
    setCommune("");
  };

  const handleSubmit = async () => {
    if (!customerName.trim() || !phone.trim() || !wilaya) {
      toast.error(t("new_order_fill_all"));
      return;
    }
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      // Create one order per cart item (or combine – here we use first item as primary)
      for (const item of items) {
        const sellingPrice = showAffiliateFeatures
          ? (sellingPrices[item.product.id] ?? item.product.price)
          : item.product.price;
        const commission = showAffiliateFeatures
          ? (sellingPrice - item.product.price) * item.quantity
          : 0;

        await createOrder.mutateAsync({
          id: generateId(),
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          selling_price: sellingPrice,
          commission: commission > 0 ? commission : 0,
          customer_name: customerName,
          phone,
          wilaya,
          commune,
          address: deliveryType === "desk" ? (shippingRate as any).office_address || "" : address,
          delivery_type: deliveryType,
          delivery_price: deliveryPrice,
        });
      }
      setOrderSuccess(true);
      clearCart?.();
    } catch (err: any) {
      toast.error(t("new_order_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
    if (orderSuccess) {
      setOrderSuccess(false);
      setCustomerName("");
      setPhone("");
      setWilaya("");
      setCommune("");
      setAddress("");
      setDeliveryType("home");
    }
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-background border-l border-border p-0">
        <SheetHeader className="p-5 border-b border-border/50 flex-shrink-0">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <ShoppingBag className="h-5 w-5 text-brand" />
            {t("cart_title")}
          </SheetTitle>
        </SheetHeader>

        {/* ── Success Screen ── */}
        {orderSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-5">
            <div className="h-20 w-20 rounded-full bg-success/15 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h3 className="text-xl font-bold">{t("new_order_success")}</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Votre commande a bien été enregistrée. Nous vous contacterons bientôt pour confirmer.
            </p>
            <Button
              onClick={handleClose}
              className="gradient-brand text-brand-foreground shadow-brand h-11 px-8 font-bold"
            >
              Fermer
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* ── Cart Items ── */}
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 p-6">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">{t("cart_empty")}</p>
                <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
                  {t("cart_continue")}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col">
                {/* Products */}
                <div className="p-5 flex flex-col gap-4">
                  {items.map((item) => {
                    const currentSellingPrice = showAffiliateFeatures
                      ? (sellingPrices[item.product.id] ?? item.product.price)
                      : item.product.price;
                    return (
                      <div
                        key={item.product.id}
                        className="flex gap-3 p-3 rounded-xl border border-border/50 bg-card"
                      >
                        <div className="h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                            {item.product.name}
                          </h3>
                          <p className="text-muted-foreground text-xs mt-1">
                            Prix de base: {formatDZD(item.product.price)}
                          </p>

                          {showAffiliateFeatures && (
                            <div className="mt-2 flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Label
                                  className="text-xs font-semibold"
                                  title="Prix de vente pour un seul article"
                                >
                                  Prix vente (unité):
                                </Label>
                                <Input
                                  type="number"
                                  min={item.product.price}
                                  className="h-7 w-24 text-xs font-bold text-brand"
                                  value={sellingPrices[item.product.id] ?? item.product.price}
                                  onChange={(e) =>
                                    handleSellingPriceChange(item.product.id, e.target.value)
                                  }
                                />
                                <span className="text-xs text-muted-foreground">DZD</span>
                              </div>
                              {currentSellingPrice - item.product.price > 0 && (
                                <p className="text-xs text-emerald-600 font-medium">
                                  Commission:{" "}
                                  {item.quantity > 1 ? (
                                    <span>
                                      +{formatDZD(currentSellingPrice - item.product.price)} &times;{" "}
                                      {item.quantity} ={" "}
                                      <strong>
                                        +
                                        {formatDZD(
                                          (currentSellingPrice - item.product.price) *
                                            item.quantity,
                                        )}
                                      </strong>
                                    </span>
                                  ) : (
                                    <span>
                                      +{formatDZD(currentSellingPrice - item.product.price)}
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          )}
                          {!showAffiliateFeatures && (
                            <p className="text-brand font-bold text-sm mt-1">
                              {formatDZD(item.product.price)}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 bg-muted rounded-lg px-2 py-1">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="text-sm font-medium w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Checkout Form ── */}
                <div className="px-5 pb-5 flex flex-col gap-4 border-t border-border/50 pt-5">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Informations de livraison
                  </p>

                  {/* Name */}
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">
                      {t("new_order_customer")}
                    </Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t("new_order_ph_name")}
                      className="h-10 text-sm"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">
                      {t("new_order_phone")}
                    </Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t("new_order_ph_phone")}
                      className="h-10 text-sm"
                      type="tel"
                    />
                  </div>

                  {/* Wilaya */}
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">
                      {t("new_order_wilaya")}
                    </Label>
                    <Select value={wilaya} onValueChange={handleWilayaChange}>
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder="Sélectionner la Wilaya" />
                      </SelectTrigger>
                      <SelectContent>
                        {WILAYA_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Commune */}
                  {communes.length > 0 && (
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">
                        {t("new_order_commune")}
                      </Label>
                      <Select value={commune} onValueChange={setCommune}>
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue placeholder="Sélectionner la Commune" />
                        </SelectTrigger>
                        <SelectContent>
                          {communes.map((c: string) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Address */}
                  <div
                    className={`transition-all rounded-xl ${deliveryType === "desk" ? "p-3 bg-brand/5 border-2 border-brand/30" : ""}`}
                  >
                    <Label
                      className={`text-xs font-medium mb-1.5 flex items-center gap-1.5 ${deliveryType === "desk" ? "text-brand font-bold" : ""}`}
                    >
                      {deliveryType === "desk" && <MapPin className="h-3.5 w-3.5" />}
                      {deliveryType === "desk"
                        ? "Adresse du point relais / bureau"
                        : t("new_order_address")}
                    </Label>
                    <Input
                      value={
                        deliveryType === "desk"
                          ? (shippingRate as any).office_address || "—"
                          : address
                      }
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t("new_order_ph_address")}
                      className={`h-10 text-sm ${deliveryType === "desk" ? "bg-white/50 dark:bg-black/50 border-brand/20 font-medium text-brand pointer-events-none" : ""}`}
                      readOnly={deliveryType === "desk"}
                    />
                    {deliveryType === "desk" && (
                      <p className="mt-2 text-[10px] text-brand/80 font-medium leading-tight">
                        Le client devra récupérer sa commande à cette adresse.
                      </p>
                    )}
                  </div>

                  {/* ── Delivery Type Buttons ── */}
                  {wilaya && (
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Type de livraison</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Home Delivery */}
                        <button
                          type="button"
                          onClick={() => setDeliveryType("home")}
                          className={`relative flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-all ${
                            deliveryType === "home"
                              ? "border-brand bg-brand/5 shadow-sm"
                              : "border-border/60 hover:border-muted-foreground/40"
                          }`}
                        >
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-brand flex-shrink-0" />
                              <span className="text-xs font-semibold">À domicile</span>
                            </div>
                            {deliveryType === "home" ? (
                              <CircleCheck className="h-4 w-4 text-brand flex-shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm font-bold text-brand">
                            {formatDZD(shippingRate.home_delivery ?? 0)}
                          </p>
                        </button>

                        {/* Desk Delivery */}
                        <button
                          type="button"
                          onClick={() => setDeliveryType("desk")}
                          className={`relative flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-all ${
                            deliveryType === "desk"
                              ? "border-brand bg-brand/5 shadow-sm"
                              : "border-border/60 hover:border-muted-foreground/40"
                          }`}
                        >
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-brand flex-shrink-0" />
                              <span className="text-xs font-semibold">Bureau / Relais</span>
                            </div>
                            {deliveryType === "desk" ? (
                              <CircleCheck className="h-4 w-4 text-brand flex-shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm font-bold text-brand">
                            {formatDZD(shippingRate.desk_delivery ?? 0)}
                          </p>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Order Summary ── */}
                  <div className="rounded-xl bg-muted/50 p-4 space-y-2 text-sm border border-border/40">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Sous-total produits</span>
                      <span className="font-medium text-foreground">{formatDZD(cartSubtotal)}</span>
                    </div>
                    {wilaya && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Frais de livraison</span>
                        <span className="font-medium text-foreground">
                          {formatDZD(deliveryPrice)}
                        </span>
                      </div>
                    )}
                    {showAffiliateFeatures && totalCommission > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium pt-1">
                        <span>Commission totale</span>
                        <span>+{formatDZD(totalCommission)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base pt-1 border-t border-border/50">
                      <span>{t("cart_total")}</span>
                      <span className="text-brand">
                        {formatDZD(wilaya ? grandTotal : cartSubtotal)}
                      </span>
                    </div>
                  </div>

                  {/* Submit */}
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full h-12 text-base font-bold gradient-brand text-brand-foreground shadow-brand"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...
                      </>
                    ) : (
                      t("cart_checkout")
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
