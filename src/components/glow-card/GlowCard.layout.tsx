import type { Layout } from "solid-layouts";

import type { glowCard } from "./GlowCard.recipe";

/**
 * GlowCard's markup, and nothing else. The two handlers arrive already built
 * from the logic; nothing here computes.
 */
export const GlowCardLayout: Layout<typeof glowCard> = (
  { slot, children },
  props,
) => (
  <div
    {...slot.root}
    onMouseMove={props.track as never}
    onMouseLeave={props.recentre as never}
  >
    {children}
  </div>
);
