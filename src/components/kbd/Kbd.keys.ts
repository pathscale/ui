/**
 * The keys Kbd knows how to draw, and what to draw for each.
 *
 * Data, so it sits beside the markup rather than inside it: the glyph is what
 * the page shows and the label is what a screen reader says.
 */

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
