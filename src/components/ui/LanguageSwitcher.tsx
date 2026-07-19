import { useI18n } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center rounded-lg border border-border overflow-hidden text-sm font-semibold">
      <button
        onClick={() => setLang("ar")}
        className={`px-3 py-1.5 transition-colors ${lang === "ar" ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
      >
        AR
      </button>
      <button
        onClick={() => setLang("fr")}
        className={`px-3 py-1.5 transition-colors ${lang === "fr" ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
      >
        FR
      </button>
    </div>
  );
}
