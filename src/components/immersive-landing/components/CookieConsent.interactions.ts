/**
 * Whether a press on the preferences backdrop should dismiss the dialog.
 *
 * The backdrop closes the dialog and is an ancestor of the panel, so every
 * press inside the panel reaches it too. The panel guarded itself the usual
 * way, with `stopPropagation()` on its own click handler, and that guard does
 * not hold in the browser engine the fleet ships: `stopPropagation` is defined
 * there, but event dispatch is deferred, so the host has finished propagating
 * before it calls into the page and the call is a no-op. The engine expresses
 * the same intent as a flag fixed when the listener is registered, which means
 * no runtime call can ever express it. Measured on two sites: pressing
 * Analytics or Marketing closed the whole dialog, so no category could be
 * changed at all.
 *
 * Comparing the press target against the element the handler is bound to needs
 * nothing from the engine beyond the two properties every event already
 * carries. A press that started inside the panel reports the panel, or
 * something under it, as its target, and only a press that landed on the
 * backdrop itself reports the backdrop.
 */
export const dismissesOnBackdropPress = (event: {
  target: EventTarget | null;
  currentTarget: EventTarget | null;
}): boolean => event.target === event.currentTarget;
