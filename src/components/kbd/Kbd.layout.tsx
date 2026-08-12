import type { Layout } from "solid-layouts";

import { type KbdKey, kbdKeysLabelMap, kbdKeysMap } from "./Kbd.keys";
import type { kbd } from "./Kbd.recipe";

/**
 * Kbd's markup.
 *
 * The abbreviation renders the glyph for the key it names and titles itself
 * with that key's full name, so a screen reader says "Command" where the page
 * shows ⌘. Both come from the maps in `Kbd.keys.ts`; nothing is decided here.
 */

export const KbdRootLayout: Layout<typeof kbd> = (
  { slot, children },
  props,
) => (
  <kbd
    {...slot.root}
    data-variant={props.variant as string}
  >
    {children}
  </kbd>
);

export const KbdAbbrLayout: Layout<typeof kbd> = ({ slot }, props) => (
  <abbr
    {...slot.abbr}
    title={(props.title as string) ?? kbdKeysLabelMap[props.keyValue as KbdKey]}
    data-key={props.keyValue as string}
  >
    {kbdKeysMap[props.keyValue as KbdKey]}
  </abbr>
);

export const KbdContentLayout: Layout<typeof kbd> = ({ slot, children }) => (
  <span {...slot.content}>{children}</span>
);
