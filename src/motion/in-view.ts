import { type Accessor, createSignal, onCleanup, onSettled } from "solid-js";

export type InViewOptions = {
  once?: boolean;
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
};

/** Attach an observer without depending on a Solid owner. */
export const attachInView = (
  element: Element,
  options: InViewOptions,
  onChange: (visible: boolean) => void,
): (() => void) => {
  const view = element.ownerDocument?.defaultView;
  const Observer =
    view?.IntersectionObserver ?? globalThis.IntersectionObserver;
  if (typeof Observer !== "function") {
    onChange(true);
    return () => {};
  }

  let observer: IntersectionObserver | undefined;
  let disconnected = false;
  const disconnect = () => {
    if (disconnected) return;
    disconnected = true;
    observer?.disconnect();
  };

  const once = options.once ?? false;
  try {
    observer = new Observer(
      (entries) => {
        if (disconnected) return;
        for (const entry of entries) {
          if (entry.target !== element) continue;
          const isVisible = entry.isIntersecting || entry.intersectionRatio > 0;
          onChange(isVisible);
          if (once && isVisible) disconnect();
        }
      },
      {
        root: options.root ?? null,
        rootMargin: options.rootMargin,
        threshold: options.threshold,
      },
    );
    observer.observe(element);
  } catch {
    disconnect();
    onChange(true);
    return () => {};
  }

  return disconnect;
};

/** Observe an element's visibility. The static and unsupported default is visible. */
export const createInView = (
  target: () => Element | null | undefined,
  options: InViewOptions = {},
): Accessor<boolean> => {
  const [visible, setVisible] = createSignal(true);
  let cleanup: (() => void) | undefined;

  onSettled(() => {
    cleanup?.();
    const element = target();
    cleanup = element ? attachInView(element, options, setVisible) : undefined;
  });

  onCleanup(() => cleanup?.());

  return visible;
};
