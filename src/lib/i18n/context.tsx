"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { es } from "./es";
import { en } from "./en";

type Lang = "es" | "en";
type Dict = Record<string, string>;

const dictionaries: Record<Lang, Dict> = { es, en };

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "es",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const saved = localStorage.getItem("aame-lang") as Lang | null;
    if (saved && (saved === "es" || saved === "en")) {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("aame-lang", newLang);
    document.documentElement.lang = newLang;
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      return dictionaries[lang][key] || fallback || dictionaries["es"][key] || key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
