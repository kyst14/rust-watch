import "dotenv/config";

import ru from "./ru.js";
import en from "./en.js";
import type { Translations } from "./lang.js";

export const translations = {
  ru,
  en,
} as const satisfies Record<string, Translations>;

export type Lang = keyof typeof translations;
export const availableLangs = Object.keys(translations);
export type TranslationKey = keyof typeof translations[Lang];

export function t<K extends TranslationKey>(
  lang: Lang | null | undefined,
  key: K,
  ...args: Parameters<Extract<Translations[K], (...args: any[]) => string>> | []
): string {
    const effectiveLang = lang && lang in translations ? lang : 'en';
    const dict = translations[effectiveLang];
    const value = dict[key];

    if (typeof value !== "function") {
        throw new Error(`Translation key "${key}" is not a function`);
    }
        
    return (value as (...args: any[]) => string)(...args);
}

export default t;