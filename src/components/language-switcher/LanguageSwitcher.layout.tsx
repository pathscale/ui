import "./LanguageSwitcher.css";
import { type Component, createSignal, For, Show, omit } from "solid-js";
import { twMerge } from "../../lib/twMerge";
import Dropdown, { type DropdownAlign } from "../dropdown";
import Icon from "../icon";
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

const LanguageSwitcher: Layout<typeof componentRecipe, LanguageSwitcherProps> = () => {
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
  const isSelected = (lang: string) => props.i18n.locale === lang;
  const [open, setOpen] = createSignal(false);

  const handleSelect = async (lang: string) => {
    await props.i18n.setLocale(lang);
    props.onLanguageChange?.(lang);
  };

  const classes = () => twMerge(CLASSES.base, props.class);

  return (
    <Dropdown.Root
      {...others}
      {...{ class: classes() }}
      open={open()}
      onOpenChange={setOpen}
      style={props.style}
      role={undefined}
      aria-label={local["aria-label"] ?? "Language selector"}
    >
      <Dropdown.Trigger
        {...{ class: CLASSES.trigger }}
        aria-label={`${props.currentLanguageLabel ?? "Current language"}: ${currentLanguageName()}`}
      >
        <Show
          when={!props.i18n.isLoading}
          fallback={
            <Icon
              src="icon-[mdi--loading]"
              {...{ class: CLASSES.loadingIcon }}
              width={16}
              height={16}
              aria-label={props.loadingLabel ?? "Loading language"}
            />
          }
        >
          <span {...{ class: CLASSES.locale }} aria-hidden="true">
            {props.i18n.locale.toUpperCase()}
          </span>
        </Show>
      </Dropdown.Trigger>

      <Dropdown.Menu
        {...{ class: CLASSES.menu }}
        align={props.align}
        aria-label={props.optionsLabel ?? "Language options"}
      >
        <For each={props.i18n.languages}>
          {(lang) => (
            <Dropdown.Item
              onClick={() => handleSelect(lang.code)}
              aria-label={lang.name}
              {...{ class: twMerge(CLASSES.item, isSelected(lang.code) && CLASSES.itemSelected) }}
              aria-current={isSelected(lang.code) ? "true" : undefined}
            >
              {lang.name}
            </Dropdown.Item>
          )}
        </For>
      </Dropdown.Menu>
    </Dropdown.Root>
  );
};

export default LanguageSwitcher;
