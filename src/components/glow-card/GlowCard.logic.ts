import type { JSX } from "solid-js";

import { invokeEventHandler } from "../../lib/events";

/**
 * GlowCard's behaviour: the glow follows the pointer.
 *
 * The position is written to two CSS custom properties rather than to a signal,
 * because nothing in the component tree needs to read it — only the stylesheet
 * does. A signal would re-render the card on every mouse move to produce
 * exactly the same DOM.
 */
export function createGlowCard(behaviour: Record<string, unknown>) {
  const track: JSX.EventHandler<HTMLDivElement, MouseEvent> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--mouse-x",
      `${event.clientX - rect.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--mouse-y",
      `${event.clientY - rect.top}px`,
    );
    invokeEventHandler(behaviour.onMouseMove as never, event);
  };

  /** Back to the middle, so a card the pointer has left is lit evenly. */
  const recentre: JSX.EventHandler<HTMLDivElement, MouseEvent> = (event) => {
    event.currentTarget.style.setProperty("--mouse-x", "50%");
    event.currentTarget.style.setProperty("--mouse-y", "50%");
    invokeEventHandler(behaviour.onMouseLeave as never, event);
  };

  return { track, recentre };
}
