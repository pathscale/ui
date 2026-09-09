/**
 * Month and weekday names, and the four date strings the calendar assembles
 * from them, without `Intl`.
 *
 * `Intl` is not defined in the chuzz browser. That is deliberate policy and
 * the decision has been made not to ship ICU data, so `new Intl.DateTimeFormat`
 * is not a formatter that returns a bad date, it is a `ReferenceError`. The
 * throw escapes every boundary the component has and reaches Solid 2, which
 * responds by halting its reactive system permanently: the page keeps painting
 * the frame it already had, so it looks alive, while every control on it is
 * dead. js.software's `/calendar` route is dead this way today, and nothing on
 * the page says so.
 *
 * What the calendar actually needed from `Intl` was twelve month names, seven
 * weekday names in three widths, and four assembly patterns. That is a table,
 * so this is the table.
 *
 * ## The locale question
 *
 * Only `en-US` is carried here. A library that shipped name tables for every
 * locale would be shipping ICU data by another name, which is the thing that
 * was ruled out.
 *
 * The sites are not all English, so the names are an input: pass `dateNames`
 * and the calendar renders yours. A site that already ships five locales
 * through its own i18n has these strings; it hands over the set for the
 * language it is currently in.
 *
 * When a consumer passes `locale="de-DE"` and no `dateNames`, the calendar
 * renders English. It cannot do anything else, and the two dishonest options
 * were to throw or to keep claiming German while showing "June". So it renders
 * English *and says so*: `resolveDateNames` returns the locale actually
 * rendered, and `Calendar` puts that on the root as `lang`. A page asking for
 * German gets `lang="en-US"`, which is true, which an assistive technology
 * reads correctly, and which a check can catch.
 */

/** Weekday name width, matching the widths `Intl` calls `weekday`. */
export type DateNameWidth = "narrow" | "short" | "long";

/**
 * The names a calendar needs to render.
 *
 * Every array is indexed positionally: months by `Date#getMonth` (0 is
 * January), weekdays by `Date#getDay` (0 is Sunday). All five are required.
 * A partial set was the friendlier API and the wrong one: German months beside
 * English weekdays under `lang="de-DE"` is exactly the half-truth this module
 * exists to avoid.
 */
export type DateNames = {
  /** 12 entries, `getMonth`-indexed. "January". */
  monthsLong: readonly string[];
  /** 12 entries, `getMonth`-indexed. "Jan". */
  monthsShort: readonly string[];
  /** 7 entries, `getDay`-indexed from Sunday. "S". */
  weekdaysNarrow: readonly string[];
  /** 7 entries, `getDay`-indexed from Sunday. "Sun". */
  weekdaysShort: readonly string[];
  /** 7 entries, `getDay`-indexed from Sunday. "Sunday". */
  weekdaysLong: readonly string[];
};

/** The locale the built-in table transcribes. */
export const DEFAULT_DATE_LOCALE = "en-US";

/**
 * `en-US`, transcribed from `Intl` rather than typed from memory.
 *
 * `tests/hooks/date/date-names.test.ts` regenerates every entry from a real
 * `Intl.DateTimeFormat` under bun's ICU and compares, so a typo here is a test
 * failure and not a wrong month in production.
 */
export const EN_US_DATE_NAMES: DateNames = {
  monthsLong: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  monthsShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  weekdaysNarrow: ["S", "M", "T", "W", "T", "F", "S"],
  weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  weekdaysLong: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
};

/**
 * Pick the names to render with, and report the locale that will actually be
 * on screen.
 *
 * The returned `locale` is the honest one, not the requested one: it is the
 * consumer's locale only when the consumer supplied the names to back it.
 */
export const resolveDateNames = (
  locale: string | undefined,
  names: DateNames | undefined,
): { names: DateNames; locale: string } =>
  names
    ? { names, locale: locale ?? DEFAULT_DATE_LOCALE }
    : { names: EN_US_DATE_NAMES, locale: DEFAULT_DATE_LOCALE };

/**
 * The grid heading. `{ month: "long", year: "numeric" }` in `en-US`.
 *
 * "June 2025".
 */
export const formatMonthYear = (
  date: Date,
  names: DateNames = EN_US_DATE_NAMES,
) => `${names.monthsLong[date.getMonth()] ?? ""} ${date.getFullYear()}`;

/**
 * A day button's `aria-label`. `{ dateStyle: "full" }` in `en-US`.
 *
 * "Sunday, June 15, 2025": long weekday, comma, long month, space, the day
 * with no leading zero, comma, year.
 */
export const formatFullDate = (
  date: Date,
  names: DateNames = EN_US_DATE_NAMES,
) =>
  `${names.weekdaysLong[date.getDay()] ?? ""}, ${names.monthsLong[date.getMonth()] ?? ""} ${date.getDate()}, ${date.getFullYear()}`;

/**
 * A picker's trigger text. `{ day: "numeric", month: "short", year: "numeric" }`
 * in `en-US`.
 *
 * "Jun 15, 2025". Note that `Intl` orders this month-first for `en-US`
 * regardless of the order the options are written in.
 */
export const formatCompactDate = (
  date: Date,
  names: DateNames = EN_US_DATE_NAMES,
) =>
  `${names.monthsShort[date.getMonth()] ?? ""} ${date.getDate()}, ${date.getFullYear()}`;

/**
 * The seven column headers, Sunday first. `{ weekday: width }` in `en-US`.
 *
 * `["Sun", "Mon", ...]` at the default `short` width.
 */
export const weekdayNames = (
  width: DateNameWidth,
  names: DateNames = EN_US_DATE_NAMES,
): readonly string[] => {
  if (width === "narrow") return names.weekdaysNarrow;
  if (width === "long") return names.weekdaysLong;
  return names.weekdaysShort;
};
