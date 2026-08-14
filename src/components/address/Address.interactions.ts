/**
 * Pure helpers behind `Address`.
 *
 * They live apart from the Layout for two reasons. A `.layout.tsx` template
 * resolves free identifiers against props, so a bare `setTimeout` in that file
 * compiles to `props.setTimeout`; and truncation is the part worth testing
 * directly, because getting it wrong is how two different addresses come to
 * look identical on screen.
 */

/** How long "Copied" stays up. Long enough to read, short enough not to lie. */
export const COPY_FEEDBACK_MS = 1200;

export type TruncateOptions = {
  /** Characters kept at the front, including any `0x`. */
  lead?: number;
  /** Characters kept at the end. */
  tail?: number;
};

export const DEFAULT_LEAD = 6;
export const DEFAULT_TAIL = 4;

/**
 * Shorten in the middle, never at the end.
 *
 * The tail is the part that distinguishes two addresses at a glance — every
 * Ethereum address starts `0x` and a shared prefix is common, so an ellipsis
 * at the end produces two labels that look the same and refer to different
 * wallets. Keeping both ends is what makes the short form safe to compare.
 *
 * Returns the value unchanged when shortening would not actually shorten it,
 * so a short address never gains an ellipsis it does not need.
 */
export const truncateAddress = (value: string, options: TruncateOptions = {}): string => {
  const lead = Math.max(0, options.lead ?? DEFAULT_LEAD);
  const tail = Math.max(0, options.tail ?? DEFAULT_TAIL);
  if (!value) return "";
  if (value.length <= lead + tail + 1) return value;
  return `${value.slice(0, lead)}…${value.slice(value.length - tail)}`;
};

/**
 * Copy, and report whether it worked.
 *
 * The clipboard is permission-gated and absent in several runtimes we ship
 * into — Blitz exposes the DOM shape before every method has an implementation,
 * so a bare call throws rather than returning a rejected promise. A caller that
 * gets `false` should leave the address selectable rather than claim a copy
 * that did not happen.
 */
export const copyAddress = async (value: string): Promise<boolean> => {
  try {
    const clipboard = globalThis.navigator?.clipboard;
    if (typeof clipboard?.writeText !== "function") return false;
    await clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Clear the copied flag after the feedback window.
 *
 * Returns the cancel function so an unmount between the copy and the timeout
 * does not write to a disposed signal.
 */
export const scheduleCopyReset = (reset: () => void): (() => void) => {
  const handle = setTimeout(reset, COPY_FEEDBACK_MS);
  return () => clearTimeout(handle);
};
