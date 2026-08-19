import "./Kbd.css";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Kbd.recipe";

export type KbdVariant = "default" | "light";
export type KbdKey =
  | "command"
  | "shift"
  | "ctrl"
  | "option"
  | "enter"
  | "delete"
  | "escape"
  | "tab"
  | "capslock"
  | "up"
  | "right"
  | "down"
  | "left"
  | "pageup"
  | "pagedown"
  | "home"
  | "end"
  | "help"
  | "space"
  | "fn"
  | "win"
  | "alt";

export const kbdKeysMap: Record<KbdKey, string> = {
  command: "⌘",
  shift: "⇧",
  ctrl: "⌃",
  option: "⌥",
  enter: "↵",
  delete: "⌫",
  escape: "⎋",
  tab: "⇥",
  capslock: "⇪",
  up: "↑",
  right: "→",
  down: "↓",
  left: "←",
  pageup: "⇞",
  pagedown: "⇟",
  home: "↖",
  end: "↘",
  help: "?",
  space: "␣",
  fn: "Fn",
  win: "⌘",
  alt: "⌥",
};

export const kbdKeysLabelMap: Record<KbdKey, string> = {
  command: "Command",
  shift: "Shift",
  ctrl: "Control",
  option: "Option",
  enter: "Enter",
  delete: "Delete",
  escape: "Escape",
  tab: "Tab",
  capslock: "Caps Lock",
  up: "Up",
  right: "Right",
  down: "Down",
  left: "Left",
  pageup: "Page Up",
  pagedown: "Page Down",
  home: "Home",
  end: "End",
  help: "Help",
  space: "Space",
  fn: "Fn",
  win: "Win",
  alt: "Alt",
};

export type KbdRootProps = Omit<JSX.HTMLAttributes<HTMLElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element;
    variant?: KbdVariant;
  };

export type KbdAbbrProps = Omit<JSX.HTMLAttributes<HTMLElement>, "children"> &
  UIBaseProps & {
    keyValue: KbdKey;
  };

export type KbdContentProps = Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "children"
> &
  UIBaseProps & {
    children?: JSX.Element;
  };

const KbdRoot: Layout<typeof componentRecipe, KbdRootProps> = () => {
  const others = omit(
    props,
    "class",
    "dataTheme",
    "style",
    "children",
    "variant",
  );

  const variant = () => props.variant ?? "default";

  return (
    <kbd
      {...others}
      {...{
        class: twMerge(CLASSES.base, CLASSES.variant[variant()], props.class),
      }}
      data-slot="kbd"
      data-variant={variant()}
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </kbd>
  );
};

const KbdAbbr: Layout<typeof componentRecipe, KbdAbbrProps> = () => {
  const others = omit(
    props,
    "class",
    "dataTheme",
    "style",
    "keyValue",
    "title",
  );

  return (
    <abbr
      {...others}
      {...{ class: twMerge(CLASSES.slot.abbr, props.class) }}
      title={props.title ?? kbdKeysLabelMap[props.keyValue]}
      data-slot="kbd-abbr"
      data-key={props.keyValue}
      data-theme={props.dataTheme}
      style={props.style}
    >
      {kbdKeysMap[props.keyValue]}
    </abbr>
  );
};

const KbdContent: Layout<typeof componentRecipe, KbdContentProps> = () => {
  const others = omit(props, "class", "dataTheme", "style", "children");

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.slot.content, props.class) }}
      data-slot="kbd-content"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </span>
  );
};

type KbdComponent = Component<KbdRootProps> & {
  Root: Component<KbdRootProps>;
  Abbr: Component<KbdAbbrProps>;
  Content: Component<KbdContentProps>;
};

const Kbd = Object.assign(KbdRoot, {
  Root: KbdRoot,
  Abbr: KbdAbbr,
  Content: KbdContent,
}) as KbdComponent;

export type KbdProps = KbdRootProps;
export { KbdAbbr, KbdContent, KbdRoot };
export default Kbd;
