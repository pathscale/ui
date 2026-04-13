import "./Kbd.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Kbd.classes";

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
  IComponentBaseProps & {
    children?: JSX.Element;
    variant?: KbdVariant;
  };

export type KbdAbbrProps = Omit<JSX.HTMLAttributes<HTMLElement>, "children"> &
  IComponentBaseProps & {
    keyValue: KbdKey;
  };

export type KbdContentProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

const KbdRoot: Component<KbdRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
    "children",
    "variant",
  ]);

  const variant = () => local.variant ?? "default";

  return (
    <kbd
      {...others}
      {...{ class: twMerge(
        CLASSES.base,
        CLASSES.variant[variant()],
        local.class,
        local.className,
      ) }}
      data-slot="kbd"
      data-variant={variant()}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </kbd>
  );
};

const KbdAbbr: Component<KbdAbbrProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
    "keyValue",
    "title",
  ]);

  return (
    <abbr
      {...others}
      {...{ class: twMerge(CLASSES.slot.abbr, local.class, local.className) }}
      title={local.title ?? kbdKeysLabelMap[local.keyValue]}
      data-slot="kbd-abbr"
      data-key={local.keyValue}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {kbdKeysMap[local.keyValue]}
    </abbr>
  );
};

const KbdContent: Component<KbdContentProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
    "children",
  ]);

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.slot.content, local.class, local.className) }}
      data-slot="kbd-content"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
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
export { KbdRoot, KbdAbbr, KbdContent };
export default Kbd;
