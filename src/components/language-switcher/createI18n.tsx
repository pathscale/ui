import { createSignal, createContext, useContext, type JSX, type FlowComponent } from "solid-js";

export interface Language {
  code: string;
  name: string;
}

export interface I18nOptions {
  /**
   * List of supported languages
   */
  languages: Language[];
  /**
   * Default language code
   * @default first language in the list
   */
  defaultLanguage?: string;
  /**
   * Storage key for persisting locale
   */
  storageKey: string;
  /**
   * Function to load translations for a locale
   * Should return a record of translation keys to values
   */
  loadTranslations?: (locale: string) => Promise<Record<string, unknown>>;
  /**
   * Initial translations (for default language)
   */
  initialTranslations?: Record<string, unknown>;
}

export interface I18nStore {
  /**
   * Current locale code (getter, reactive)
   */
  readonly locale: string;
  /**
   * Whether translations are currently loading (getter, reactive)
   */
  readonly isLoading: boolean;
  /**
   * Translation function
   */
  t: (key: string) => string;
  /**
   * Set the current locale
   */
  setLocale: (lang: string) => Promise<void>;
  /**
   * Initialize the store (detect language from URL, storage, browser)
   */
  init: () => Promise<void>;
  /**
   * Available languages
   */
  readonly languages: Language[];
  /**
   * Language names map for quick lookup
   */
  readonly languageNames: Record<string, string>;
  /**
   * Supported language codes
   */
  readonly supportedCodes: string[];
}

function getNestedValue(obj: unknown, path: string): string {
  const keys = path.split(".");
  let value: unknown = obj;
  for (const key of keys) {
    value = (value as Record<string, unknown>)?.[key];
    if (value === undefined) return path;
  }
  return typeof value === "string" ? value : path;
}

/**
 * Creates an i18n store with configurable options.
 * API matches nofilter.io's i18nStore for easy migration.
 *
 * @example
 * ```tsx
 * // Create the store
 * const i18n = createI18n({
 *   languages: [
 *     { code: "en", name: "English" },
 *     { code: "es", name: "Español" },
 *   ],
 *   storageKey: "myapp_locale",
 *   initialTranslations: enTranslations,
 *   loadTranslations: (locale) => fetch(`/locales/${locale}.json`).then(r => r.json()),
 * });
 *
 * // Use in components
 * <p>{i18n.t("greeting")}</p>
 * <p>Current: {i18n.locale}</p>
 *
 * // Initialize on app mount
 * onMount(() => i18n.init());
 * ```
 */
export function createI18n(options: I18nOptions): I18nStore {
  const {
    languages,
    defaultLanguage = languages[0]?.code ?? "en",
    storageKey,
    loadTranslations,
    initialTranslations = {},
  } = options;

  const supportedCodes = languages.map((l) => l.code);
  const languageNames = languages.reduce(
    (acc, lang) => ({ ...acc, [lang.code]: lang.name }),
    {} as Record<string, string>
  );

  const [localeSignal, setLocaleSignal] = createSignal<string>(defaultLanguage);
  const [translations, setTranslations] = createSignal<Record<string, unknown>>(initialTranslations);
  const [isLoadingSignal, setIsLoading] = createSignal(false);

  const t = (key: string): string => getNestedValue(translations(), key);

  const setLocale = async (lang: string): Promise<void> => {
    if (!supportedCodes.includes(lang)) lang = defaultLanguage;
    if (lang === localeSignal() && Object.keys(translations()).length > 0) return;

    setIsLoading(true);

    try {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 100));
      let data: Record<string, unknown>;

      await minDelay;

      if (lang === defaultLanguage && Object.keys(initialTranslations).length > 0) {
        data = initialTranslations;
      } else if (loadTranslations) {
        data = await loadTranslations(lang);
      } else {
        data = initialTranslations;
      }

      setTranslations(data);
      setLocaleSignal(lang);

      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, lang);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const init = async (): Promise<void> => {
    if (typeof window === "undefined") return;

    // Priority: 1. URL param (?lang=), 2. localStorage, 3. browser language, 4. default
    const urlParams = new URLSearchParams(globalThis.location.search);
    const urlLang = urlParams.get("lang");
    const saved = localStorage.getItem(storageKey);
    const browserLang = navigator.language.split("-")[0];

    let detected: string;
    if (urlLang && supportedCodes.includes(urlLang)) {
      detected = urlLang;
      // Clean up URL by removing lang param after applying it
      urlParams.delete("lang");
      const newUrl = urlParams.toString()
        ? `${globalThis.location.pathname}?${urlParams.toString()}`
        : globalThis.location.pathname;
      globalThis.history.replaceState({}, "", newUrl);
    } else if (saved && supportedCodes.includes(saved)) {
      detected = saved;
    } else if (supportedCodes.includes(browserLang)) {
      detected = browserLang;
    } else {
      detected = defaultLanguage;
    }

    await setLocale(detected);
  };

  // Return object with getters for reactive properties (matches nofilter.io API)
  return {
    get locale() { return localeSignal(); },
    get isLoading() { return isLoadingSignal(); },
    t,
    setLocale,
    init,
    languages,
    languageNames,
    supportedCodes,
  };
}

// Context for providing i18n throughout the app
export interface I18nContextValue {
  i18n: I18nStore;
}

export const I18nContext = createContext<I18nContextValue>();

export function useI18n(): I18nStore {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context.i18n;
}

export interface I18nProviderProps {
  i18n: I18nStore;
  children: JSX.Element;
}

/**
 * Provider component for i18n context
 */
export const I18nProvider: FlowComponent<I18nProviderProps> = (props) => {
  return (
    <I18nContext.Provider value={{ i18n: props.i18n }}>
      {props.children}
    </I18nContext.Provider>
  );
};
