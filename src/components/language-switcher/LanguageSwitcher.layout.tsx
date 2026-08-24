import "./LanguageSwitcher.css";
import { type Component, For, omit } from "solid-js";
import { twMerge } from "../../lib/twMerge";
import type { DropdownAlign } from "../dropdown";
import NativeSelect from "../native-select";
import type { UIBaseProps } from "../vocabulary";
import type { I18nStore } from "./createI18n";
import { CLASSES } from "./LanguageSwitcher.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./LanguageSwitcher.recipe";

export interface LanguageSwitcherProps extends UIBaseProps {
  /**
   * The i18n store to use for language state
   */
  i18n: I18nStore;
  /**
   * ARIA label for the dropdown
   */
  "aria-label"?: string;
  /**
   * ARIA label for current language (for screen readers)
   */
  currentLanguageLabel?: string;
  /**
   * ARIA label for language options menu
   */
  optionsLabel?: string;
  /**
   * ARIA label shown while loading
   */
  loadingLabel?: string;
  /**
   * Menu alignment relative to the trigger. Forwarded to the underlying
   * Dropdown.Menu.
   */
  align?: DropdownAlign;
  /**
   * Callback when language changes
   */
  onLanguageChange?: (lang: string) => void;
}

const LanguageSwitcher: Layout<
  typeof componentRecipe,
  LanguageSwitcherProps
> = () => {
  const others = omit(
    props,
    "i18n",
    "class",
    "style",
    "aria-label",
    "currentLanguageLabel",
    "optionsLabel",
    "loadingLabel",
    "align",
    "onLanguageChange",
  );

  const currentLanguageName = () => props.i18n.languageNames[props.i18n.locale];
  const handleSelect = async (lang: string) => {
    await props.i18n.setLocale(lang);
    props.onLanguageChange?.(lang);
  };

  const classes = () => twMerge(CLASSES.base, CLASSES.trigger, props.class);

  const move = (direction: -1 | 1): void => {
    const languages = props.i18n.languages;
    const current = languages.findIndex(
      (language) => language.code === props.i18n.locale,
    );
    const next =
      (Math.max(0, current) + direction + languages.length) % languages.length;
    const language = languages[next];
    if (language) void handleSelect(language.code);
  };

  return (
    <NativeSelect
      {...others}
      {...{ class: classes() }}
      style={props.style}
      value={props.i18n.locale}
      disabled={props.i18n.isLoading}
      aria-busy={props.i18n.isLoading ? "true" : undefined}
      aria-label={`${props.currentLanguageLabel ?? "Current language"}: ${currentLanguageName()}`}
      title={props.optionsLabel ?? local["aria-label"] ?? "Language selector"}
      onChange={(event) => void handleSelect(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          move(1);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          move(-1);
        }
      }}
    >
      <For each={props.i18n.languages}>
        {(lang) => <option value={lang.code}>{lang.name}</option>}
      </For>
    </NativeSelect>
  );
};

export default LanguageSwitcher;
