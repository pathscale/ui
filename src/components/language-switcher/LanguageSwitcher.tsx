import { type Component, For, Show, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import Dropdown from "../dropdown";
import Icon from "../icon";
import type { IComponentBaseProps } from "../types";
import type { I18nStore, Language } from "./createI18n";

export interface LanguageSwitcherProps extends IComponentBaseProps {
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
   * Callback when language changes
   */
  onLanguageChange?: (lang: string) => void;
}

const LanguageSwitcher: Component<LanguageSwitcherProps> = (props) => {
  const [local, others] = splitProps(props, [
    "i18n",
    "class",
    "className",
    "style",
    "aria-label",
    "currentLanguageLabel",
    "optionsLabel",
    "loadingLabel",
    "onLanguageChange",
  ]);

  const currentLanguageName = () => local.i18n.languageNames[local.i18n.locale];
  const isSelected = (lang: string) => local.i18n.locale === lang;

  const handleSelect = async (lang: string) => {
    await local.i18n.setLocale(lang);
    local.onLanguageChange?.(lang);
  };

  const classes = () => twMerge(clsx(local.class, local.className));

  return (
    <Dropdown
      {...others}
      class={classes()}
      style={local.style}
      role={undefined}
      aria-label={local["aria-label"] ?? "Language selector"}
      aria-haspopup="menu"
    >
      <Dropdown.Toggle
        button
        size="sm"
        aria-label={`${local.currentLanguageLabel ?? "Current language"}: ${currentLanguageName()}`}
      >
        <Show
          when={!local.i18n.isLoading}
          fallback={
            <Icon
              name="icon-[mdi--loading]"
              class="animate-spin"
              width={16}
              height={16}
              aria-label={local.loadingLabel ?? "Loading language"}
            />
          }
        >
          <span class="text-xs font-bold uppercase" aria-hidden="true">
            {local.i18n.locale.toUpperCase()}
          </span>
        </Show>
      </Dropdown.Toggle>

      <Dropdown.Menu class="min-w-32" aria-label={local.optionsLabel ?? "Language options"}>
        <For each={local.i18n.languages}>
          {(lang) => (
            <Dropdown.Item
              onClick={() => handleSelect(lang.code)}
              class={isSelected(lang.code) ? "bg-base-200" : ""}
              aria-current={isSelected(lang.code) ? "true" : undefined}
            >
              {lang.name}
            </Dropdown.Item>
          )}
        </For>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSwitcher;
