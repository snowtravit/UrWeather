import { createContext, useContext, useState, ReactNode } from 'react';
import { Lang, translations, Translations } from './translations';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const stored = (localStorage.getItem('sw-lang') as Lang) || 'en';
  const [lang, setLangState] = useState<Lang>(stored);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('sw-lang', l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
