/**
 * Calls a Solid event handler prop, whichever of the two shapes it has.
 *
 * JSX handlers in Solid are either a plain function or a `[handler, data]`
 * tuple, the bound form that avoids allocating a closure per element. A
 * component that forwards `onClick` has to cope with both, because the consumer
 * picks the shape, not the component.
 *
 * This existed as a private copy in 25 component files. They had drifted: some
 * checked `Array.isArray` first, some never handled the tuple at all, so bound
 * handlers silently did nothing on those components.
 */
export function invokeEventHandler<T extends Event>(
  handler: unknown,
  event: T,
): void {
  if (typeof handler === "function") {
    (handler as (event: T) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
}
