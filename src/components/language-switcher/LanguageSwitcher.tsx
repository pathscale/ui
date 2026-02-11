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
  /**
   * Show compact version (language code instead of full name in toggle)
   */
  compact?: boolean;
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
    "compact",
  ]);

  const currentLanguageName = () => local.i18n.languageNames[local.i18n.locale];
  const isSelected = (lang: string) => local.i18n.locale === lang;

  const handleSelect = async (lang: string) => {
    await local.i18n.setLocale(lang);
    local.onLanguageChange?.(lang);
  };

  const classes = () => twMerge(local.compact ? "" : "min-w-28", clsx(local.class, local.className));

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
        class={local.compact
          ? "btn btn-sm bg-base-100 border border-base-300"
          : "bg-base-100 border border-base-300 rounded px-3 py-2 flex gap-2 justify-between items-center"}
        aria-label={`${local.currentLanguageLabel ?? "Current language"}: ${currentLanguageName()}`}
      >
        <Show when={!local.compact}>
          <span>{currentLanguageName()}</span>
        </Show>
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
          <Show
            when={!local.compact}
            fallback={
              <Icon
                name="icon-[mdi--translate]"
                width={16}
                height={16}
                aria-hidden="true"
              />
            }
          >
            <Icon
              name="icon-[mdi--chevron-down]"
              width={16}
              height={16}
              aria-hidden="true"
            />
          </Show>
        </Show>
      </Dropdown.Toggle>

      <Dropdown.Menu class={local.compact ? "min-w-32" : "w-full"} aria-label={local.optionsLabel ?? "Language options"}>
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
