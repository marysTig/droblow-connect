import { createContext, useContext, useState, ReactNode } from "react";
import { ar, type TranslationKey } from "./translations/ar";
import { fr } from "./translations/fr";

type Language = "ar" | "fr";

interface I18nContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const dictionaries: Record<Language, Record<TranslationKey, string>> = { ar, fr };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("droblow_lang") as Language) || "ar";
    }
    return "ar";
  });

  const handleSetLang = (l: Language) => {
    setLang(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("droblow_lang", l);
    }
  };

  const t = (key: TranslationKey): string => {
    return dictionaries[lang][key] ?? dictionaries["ar"][key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
