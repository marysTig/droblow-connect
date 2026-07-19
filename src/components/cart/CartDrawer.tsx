import { useCart } from "@/lib/cart-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatDZD } from "@/lib/queries";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export function CartDrawer() {
  const { items, isDrawerOpen, setIsDrawerOpen, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    navigate({ to: "/login" });
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-background border-l border-border p-0">
        <SheetHeader className="p-6 border-b border-border/50">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <ShoppingBag className="h-5 w-5 text-brand" />
            {t("cart_title")}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">{t("cart_empty")}</p>
              <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
                {t("cart_continue")}
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-card">
                <div className="h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-2">{item.product.name}</h3>
                    <p className="text-brand font-bold mt-1">{formatDZD(item.product.price)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-muted rounded-lg px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-border/50 bg-card mt-auto space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>{t("cart_total")}</span>
              <span className="text-brand text-xl">{formatDZD(totalPrice)}</span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full h-12 text-base font-bold gradient-brand text-brand-foreground shadow-brand"
            >
              {t("cart_checkout")}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
