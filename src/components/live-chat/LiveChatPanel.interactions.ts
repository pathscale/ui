/**
 * A chat timestamp, formatted without `Intl`.
 *
 * The panel used to build its timestamps with
 * `new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit",
 * hour12: true })`. `Intl` is not defined in the browser engine the fleet
 * ships, so that constructor threw a `ReferenceError` while a message list was
 * rendering. The consequence is not a wrong timestamp: the error escapes the
 * render, Solid halts its reactive system, and the page keeps painting the
 * frame it already had while every control on it is dead. Measured on
 * pathscale.com, where opening the support chat killed the whole application,
 * and this one call was the only `Intl` reference in that bundle.
 *
 * A clock reading of `3:07 PM` needs no locale database, so this does the
 * conversion with plain `Date` accessors and keeps the `en-US` output byte for
 * byte: a bare 12-hour hour, a colon, two-digit minutes, a space, and `AM` or
 * `PM`. `Meter` guards its `Intl.NumberFormat` in a `try`/`catch` for the same
 * reason; a fallback is not needed here because there is nothing to fall back
 * from.
 */
export const formatChatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  // Midnight and noon are the two the modulo gets wrong on its own: hour 0 and
  // hour 12 both read as 12, in the AM half and the PM half respectively.
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const suffix = hours < 12 ? "AM" : "PM";
  const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hour12}:${paddedMinutes} ${suffix}`;
};
