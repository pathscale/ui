/**
 * Pure mechanics behind `Composer`.
 *
 * They live apart from the Layout because a `.layout.tsx` template resolves
 * free identifiers against props, so a bare `setTimeout` or `window` in that
 * file compiles to `props.setTimeout`. They are also the part worth testing
 * directly: autosize is where a chat box gets slow, and submit resolution is
 * where it gets rude.
 */

/** A textarea, reduced to what autosize actually touches. */
export type AutosizeField = {
  value: string;
  scrollHeight: number;
  style: { height: string; maxHeight: string };
};

export type AutosizeBounds = {
  /** Smallest height to hold, in pixels. Keeps one writable line while layout settles. */
  floor: number;
  /** Largest height before the field scrolls instead of growing. */
  ceiling: number;
};

/**
 * State carried between measurements.
 *
 * Not decoration: without it every keystroke writes a style, and a style write
 * marks layout stale, so the `scrollHeight` read that follows has to resolve
 * the whole document before it can answer. Measured at 12.77ms per keystroke on
 * a 3,599-node tree, which was 82 percent of the cost of typing a character.
 */
export type AutosizeMemo = {
  length: number;
  height: number;
  ceiling: number;
};

export const newAutosizeMemo = (): AutosizeMemo => ({ length: -1, height: -1, ceiling: -1 });

/**
 * Grow with the content up to a ceiling, then scroll.
 *
 * Returns the height applied, so a caller can tell a surrounding scroller what
 * changed. Writes nothing when nothing moved, which is most keystrokes: text
 * usually lands inside the current line.
 *
 * The `height = "auto"` reset is what lets the field *shrink* — with a fixed
 * height larger than its content, `scrollHeight` reports the box rather than
 * the text. It is also a style write, so it is skipped while the content is
 * only getting longer, where the box is never taller than the text and the
 * reset buys nothing.
 */
export const autosize = (
  field: AutosizeField,
  bounds: AutosizeBounds,
  memo: AutosizeMemo,
): number => {
  if (bounds.ceiling !== memo.ceiling) {
    field.style.maxHeight = `${bounds.ceiling}px`;
    memo.ceiling = bounds.ceiling;
    // A new ceiling invalidates the shrink bookkeeping.
    memo.length = -1;
  }

  const length = field.value.length;
  if (length < memo.length || memo.length < 0) field.style.height = "auto";
  memo.length = length;

  // A retained or just-restored view can briefly report scrollHeight = 0.
  // Falling back to the floor keeps one writable line rather than collapsing.
  const height = Math.max(bounds.floor, Math.min(field.scrollHeight || bounds.floor, bounds.ceiling));
  if (height !== memo.height) {
    field.style.height = `${height}px`;
    memo.height = height;
  }
  return height;
};

/** Pixels per row, used only to turn a row count into a bound. */
export const ROW_HEIGHT = 22;

/**
 * Turn rows into pixel bounds, never letting the box eat the window.
 *
 * `viewportHeight` is passed in rather than read, so this stays pure and so a
 * runtime without a window can still call it.
 */
export const boundsFromRows = (
  minRows: number,
  maxRows: number,
  viewportHeight: number,
  fraction = 0.45,
): AutosizeBounds => {
  const floor = Math.max(1, minRows) * ROW_HEIGHT;
  const viewportCeiling = Math.max(floor, Math.floor(viewportHeight * fraction));
  return { floor, ceiling: Math.min(Math.max(1, maxRows) * ROW_HEIGHT, viewportCeiling) };
};

export type SubmitKey = {
  key: string;
  shiftKey: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  isComposing?: boolean;
};

/**
 * Does this keystroke send?
 *
 * Enter sends and Shift+Enter is a newline, which is what a chat box has
 * trained everyone to expect. `isComposing` is the part that is easy to miss:
 * while an IME is open, Enter commits the candidate and must not also send the
 * message. Skipping that check sends half a word in Japanese, Chinese and
 * Korean and looks like the app is broken to everyone who uses one.
 */
export const shouldSubmit = (event: SubmitKey, submitOnEnter: boolean): boolean => {
  if (!submitOnEnter) return false;
  if (event.key !== "Enter") return false;
  if (event.isComposing) return false;
  return !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey;
};

/** Nothing but whitespace is not a message, so it never submits. */
export const isSubmittable = (value: string): boolean => value.trim().length > 0;

/**
 * Run after the pending value has landed in the field.
 *
 * A paste changes the value through the browser rather than through us, so
 * measuring in the handler measures the box as it was. The deferral lives here
 * because a bare `queueMicrotask` inside a `.layout.tsx` compiles to
 * `props.queueMicrotask`: free identifiers in a template bind to props, and
 * timers are not on the known-globals list.
 */
export const afterValueLands = (measure: () => void): void => {
  queueMicrotask(measure);
};

/** The window height, or a sane stand-in where there is no window. */
export const viewportHeight = (override?: number): number =>
  override ?? globalThis.innerHeight ?? 800;
