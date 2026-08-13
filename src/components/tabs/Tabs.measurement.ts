type ResizeObserverConstructor = new (
  callback: ResizeObserverCallback,
) => Pick<ResizeObserver, "observe" | "disconnect">;

const getResizeObserver = (): ResizeObserverConstructor | undefined =>
  typeof ResizeObserver === "undefined" ? undefined : ResizeObserver;

export const observeTabIndicator = (
  targets: Element[],
  scheduleMeasure: () => void,
  Observer: ResizeObserverConstructor | undefined = getResizeObserver(),
) => {
  if (!Observer) return () => {};

  const observer = new Observer(() => scheduleMeasure());
  for (const target of targets) observer.observe(target);
  return () => observer.disconnect();
};
