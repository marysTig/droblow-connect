import { Link } from "@tanstack/react-router";
import { Facebook, Instagram } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
        <div className="col-span-2">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">{t("footer_desc")}</p>
          <div className="mt-4 flex gap-3">
            <a
              href="#"
              className="grid h-9 w-9 place-items-center rounded-lg bg-muted hover:bg-accent transition-colors"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="grid h-9 w-9 place-items-center rounded-lg bg-muted hover:bg-accent transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">{t("footer_platform")}</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#how" className="hover:text-foreground">
                {t("footer_how")}
              </a>
            </li>
            <li>
              <a href="#products" className="hover:text-foreground">
                {t("footer_products")}
              </a>
            </li>
            <li>
              <Link to="/register" className="hover:text-foreground">
                {t("footer_signup")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">{t("footer_company")}</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#" className="hover:text-foreground">
                {t("footer_about")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground">
                {t("footer_contact")}
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-foreground">
                {t("footer_faq")}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        {t("footer_copy")}
      </div>
    </footer>
  );
}
