/** Return a nonnegative WAAPI delay in milliseconds for an item's position. */
export const stagger = (index: number, interval = 50) => {
  const safeIndex = Number.isFinite(index) ? Math.max(0, index) : 0;
  const safeInterval = Number.isFinite(interval) ? Math.max(0, interval) : 0;
  return safeIndex * safeInterval;
};
