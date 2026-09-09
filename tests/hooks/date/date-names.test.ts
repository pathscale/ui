import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createMemo, createRoot } from "solid-js";

import {
  type DateNameWidth,
  type DateNames,
  DEFAULT_DATE_LOCALE,
  EN_US_DATE_NAMES,
  formatCompactDate,
  formatFullDate,
  formatMonthYear,
  resolveDateNames,
  weekdayNames,
} from "../../../src/hooks/date/date.names";
import { formatDate } from "../../../src/hooks/date/date.utils";
import { useCalendarState } from "../../../src/hooks/date/useCalendarState";

/**
 * The calendar renders its dates from a table, and the table is `en-US`.
 *
 * `Intl` is undefined in the chuzz browser by policy, and ICU data is
 * deliberately not shipped, so `new Intl.DateTimeFormat` there is a
 * `ReferenceError` rather than a formatter with a bad answer. That throw is
 * not survivable: it escapes the component, reaches Solid 2, and Solid 2
 * halts its reactive system permanently. The page keeps painting the frame it
 * already had, so it looks fine, while every control on it is dead.
 * js.software's `/calendar` route is dead this way today, and nothing visible
 * says so, which is why "it renders" is not evidence and this file exists.
 *
 * Two halves, and both are needed:
 *
 *   1. The strings must be **byte-identical to `Intl`**, not merely plausible.
 *      Other repositories hold acceptance checks asserting these exact
 *      strings. So the expectations here are not typed from memory: they are
 *      regenerated from a real `Intl.DateTimeFormat` under bun's own ICU on
 *      every run and compared. A typo in the table fails here instead of
 *      shipping a wrong month.
 *
 *   2. The modules must not **reference** `Intl` at all. A test that only
 *      compares output would pass forever under bun, which has `Intl`, while
 *      the browser that matters does not. So the last case walks the touched
 *      sources for the identifier, and one case runs the hook with the global
 *      deleted, which is the closest this runner gets to standing in chuzz.
 */

/* -------------------------------------------------------------------------------------------------
 * Ground truth, regenerated from real `Intl` rather than remembered
 * -----------------------------------------------------------------------------------------------*/

const L = DEFAULT_DATE_LOCALE;

/** Noon, so no time zone can push a date onto the neighbouring day. */
const at = (year: number, monthIndex: number, day: number) =>
  new Date(year, monthIndex, day, 12, 0, 0, 0);

/** The seven days of an ordinary week beginning on a Sunday. */
const WEEK = Array.from({ length: 7 }, (_, index) => at(2024, 0, 7 + index));

const intlNames = (): DateNames => ({
  monthsLong: Array.from({ length: 12 }, (_, m) =>
    new Intl.DateTimeFormat(L, { month: "long" }).format(at(2024, m, 15)),
  ),
  monthsShort: Array.from({ length: 12 }, (_, m) =>
    new Intl.DateTimeFormat(L, { month: "short" }).format(at(2024, m, 15)),
  ),
  weekdaysNarrow: WEEK.map((date) =>
    new Intl.DateTimeFormat(L, { weekday: "narrow" }).format(date),
  ),
  weekdaysShort: WEEK.map((date) =>
    new Intl.DateTimeFormat(L, { weekday: "short" }).format(date),
  ),
  weekdaysLong: WEEK.map((date) =>
    new Intl.DateTimeFormat(L, { weekday: "long" }).format(date),
  ),
});

/**
 * The corpus. Every date here is a shape that has an opinion about the format:
 * a single-digit day, the first and last day of a year, a leap day, a
 * four-digit year that is not this decade.
 */
const CORPUS = [
  at(2025, 5, 15), // the example in the issue: Sunday, June 15, 2025
  at(2025, 0, 1), // January, single-digit day, first of the year
  at(2025, 11, 31), // December, two-digit day, last of the year
  at(2024, 1, 29), // leap day
  at(1999, 8, 9), // single-digit day and a September short name
  at(2025, 6, 4), // single-digit day mid-year
  at(2025, 8, 30), // "Sep" is the short name, not "Sept"
];

describe("en-US date names match Intl", () => {
  it("transcribes every month and weekday name Intl produces", () => {
    expect(EN_US_DATE_NAMES).toEqual(intlNames());
  });

  it("keeps the tables the length the indexing assumes", () => {
    expect(EN_US_DATE_NAMES.monthsLong).toHaveLength(12);
    expect(EN_US_DATE_NAMES.monthsShort).toHaveLength(12);
    expect(EN_US_DATE_NAMES.weekdaysNarrow).toHaveLength(7);
    expect(EN_US_DATE_NAMES.weekdaysShort).toHaveLength(7);
    expect(EN_US_DATE_NAMES.weekdaysLong).toHaveLength(7);
  });
});

describe("the four patterns are byte-identical to Intl", () => {
  it("renders the grid heading as { month: long, year: numeric }", () => {
    for (const date of CORPUS) {
      expect(formatMonthYear(date)).toBe(
        new Intl.DateTimeFormat(L, {
          month: "long",
          year: "numeric",
        }).format(date),
      );
    }

    expect(formatMonthYear(at(2025, 5, 15))).toBe("June 2025");
    expect(formatMonthYear(at(2025, 0, 1))).toBe("January 2025");
    expect(formatMonthYear(at(2025, 11, 31))).toBe("December 2025");
  });

  it("renders a day's aria-label as { dateStyle: full }", () => {
    for (const date of CORPUS) {
      expect(formatFullDate(date)).toBe(
        new Intl.DateTimeFormat(L, { dateStyle: "full" }).format(date),
      );
    }

    // Long weekday, comma, long month, space, unpadded day, comma, year.
    expect(formatFullDate(at(2025, 5, 15))).toBe("Sunday, June 15, 2025");
    expect(formatFullDate(at(2025, 0, 1))).toBe("Wednesday, January 1, 2025");
    expect(formatFullDate(at(2024, 1, 29))).toBe("Thursday, February 29, 2024");
  });

  it("renders the column headers as { weekday: width } at all three widths", () => {
    const widths: DateNameWidth[] = ["narrow", "short", "long"];

    for (const width of widths) {
      expect(weekdayNames(width)).toEqual(
        WEEK.map((date) =>
          new Intl.DateTimeFormat(L, { weekday: width }).format(date),
        ),
      );
    }

    expect(weekdayNames("narrow")).toEqual(["S", "M", "T", "W", "T", "F", "S"]);
    expect(weekdayNames("short")).toEqual([
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]);
    expect(weekdayNames("long")[0]).toBe("Sunday");
    expect(weekdayNames("long")[6]).toBe("Saturday");
  });

  it("renders a picker's trigger as { day, month: short, year }", () => {
    for (const date of CORPUS) {
      expect(formatCompactDate(date)).toBe(
        new Intl.DateTimeFormat(L, {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(date),
      );
      // `formatDate` is the picker's entry point and normalises first, so it
      // has to agree with the pattern it delegates to.
      expect(formatDate(date)).toBe(formatCompactDate(date));
    }

    expect(formatDate(at(2025, 5, 15))).toBe("Jun 15, 2025");
    expect(formatDate(at(1999, 8, 9))).toBe("Sep 9, 1999");
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
    expect(formatDate(new Date(Number.NaN))).toBe("");
  });
});

/* -------------------------------------------------------------------------------------------------
 * A consumer's own language
 * -----------------------------------------------------------------------------------------------*/

const DE_DE: DateNames = {
  monthsLong: [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ],
  monthsShort: [
    "Jan",
    "Feb",
    "Mär",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dez",
  ],
  weekdaysNarrow: ["S", "M", "D", "M", "D", "F", "S"],
  weekdaysShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  weekdaysLong: [
    "Sonntag",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
  ],
};

describe("a consumer supplies its own names", () => {
  it("renders every pattern from the names it was given", () => {
    const date = at(2025, 5, 15);

    expect(formatMonthYear(date, DE_DE)).toBe("Juni 2025");
    expect(formatFullDate(date, DE_DE)).toBe("Sonntag, Juni 15, 2025");
    expect(formatCompactDate(date, DE_DE)).toBe("Jun 15, 2025");
    expect(weekdayNames("short", DE_DE)).toEqual([
      "So",
      "Mo",
      "Di",
      "Mi",
      "Do",
      "Fr",
      "Sa",
    ]);
  });

  /**
   * The assembly order stays `en-US`. A German site gets German words in the
   * English arrangement, which is a real limitation and is written down in
   * `docs/ui-usage.md` rather than hidden: a table of names is not a
   * pattern-per-locale formatter, and the alternative was shipping ICU.
   */
  it("keeps the en-US assembly order, which is the documented limit", () => {
    expect(formatFullDate(at(2025, 5, 15), DE_DE)).not.toBe(
      "Sonntag, 15. Juni 2025",
    );
  });
});

describe("an unsupported locale resolves honestly", () => {
  it("falls back to English and reports English, never the locale asked for", () => {
    const resolved = resolveDateNames("de-DE", undefined);

    expect(resolved.names).toBe(EN_US_DATE_NAMES);
    // The point: it does not claim to be German while showing "June".
    expect(resolved.locale).toBe("en-US");
  });

  it("does not throw on a locale that is not a locale", () => {
    for (const locale of ["", "xx", "not a locale", "de-DE-u-ca-buddhist"]) {
      expect(() => resolveDateNames(locale, undefined)).not.toThrow();
      expect(resolveDateNames(locale, undefined).locale).toBe("en-US");
    }
  });

  it("honours the locale once names back it", () => {
    const resolved = resolveDateNames("de-DE", DE_DE);

    expect(resolved.names).toBe(DE_DE);
    expect(resolved.locale).toBe("de-DE");
  });

  it("defaults the locale when names arrive without one", () => {
    expect(resolveDateNames(undefined, DE_DE).locale).toBe("en-US");
    expect(resolveDateNames(undefined, undefined).locale).toBe("en-US");
  });
});

/* -------------------------------------------------------------------------------------------------
 * The hook, with no `Intl` to reach for
 * -----------------------------------------------------------------------------------------------*/

const runCalendarState = (
  visibleMonth: Date,
  weekdayFormat: DateNameWidth,
  names: DateNames,
) =>
  createRoot((dispose) => {
    const state = useCalendarState({
      selectionMode: () => "single",
      dateNames: createMemo(() => names),
      weekdayFormat: createMemo(() => weekdayFormat),
      visibleMonth: createMemo(() => visibleMonth),
      focusedDate: createMemo(() => visibleMonth),
      selectedDate: createMemo(() => null),
      rangeStart: createMemo(() => null),
      rangeEnd: createMemo(() => null),
      rangePreview: createMemo(() => null),
      isDateDisabled: () => false,
      isDateUnavailable: () => false,
    });

    const captured = {
      monthLabel: state.monthLabel(),
      weekdayLabels: [...state.weekdayLabels()],
      firstDayLabel: state.formatDayLabel(state.calendarWeeks()[0][0]),
      fifteenthLabel: state.formatDayLabel(
        new Date(
          visibleMonth.getFullYear(),
          visibleMonth.getMonth(),
          15,
          12,
          0,
          0,
          0,
        ),
      ),
    };

    dispose();
    return captured;
  });

describe("the calendar formats with Intl removed from the global", () => {
  /**
   * The closest this runner gets to standing in chuzz. Before the fix this
   * case does not fail an assertion, it throws `ReferenceError: Intl is not
   * defined` out of the first `createMemo`, which is exactly the shape of the
   * production failure.
   */
  it("produces every label with no Intl in scope", () => {
    const saved = Reflect.get(globalThis, "Intl");
    Reflect.deleteProperty(globalThis, "Intl");

    try {
      expect(Reflect.has(globalThis, "Intl")).toBeFalse();

      const june = runCalendarState(at(2025, 5, 1), "short", EN_US_DATE_NAMES);

      expect(june.monthLabel).toBe("June 2025");
      expect(june.weekdayLabels).toEqual([
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
      ]);
      // June 2025 begins on a Sunday, so the grid opens on the 1st.
      expect(june.firstDayLabel).toBe("Sunday, June 1, 2025");
      expect(june.fifteenthLabel).toBe("Sunday, June 15, 2025");

      const january = runCalendarState(
        at(2025, 0, 1),
        "narrow",
        EN_US_DATE_NAMES,
      );
      expect(january.monthLabel).toBe("January 2025");
      expect(january.weekdayLabels).toEqual([
        "S",
        "M",
        "T",
        "W",
        "T",
        "F",
        "S",
      ]);
      expect(january.fifteenthLabel).toBe("Wednesday, January 15, 2025");

      const december = runCalendarState(
        at(2025, 11, 1),
        "long",
        EN_US_DATE_NAMES,
      );
      expect(december.monthLabel).toBe("December 2025");
      expect(december.weekdayLabels[0]).toBe("Sunday");
      expect(december.weekdayLabels[6]).toBe("Saturday");

      const german = runCalendarState(at(2025, 5, 1), "short", DE_DE);
      expect(german.monthLabel).toBe("Juni 2025");
      expect(german.weekdayLabels[0]).toBe("So");
    } finally {
      Reflect.set(globalThis, "Intl", saved);
    }

    expect(Reflect.has(globalThis, "Intl")).toBeTrue();
  });
});

/* -------------------------------------------------------------------------------------------------
 * The identifier itself
 * -----------------------------------------------------------------------------------------------*/

const SRC = join(import.meta.dir, "../../../src");

/**
 * Every module on the path from a calendar prop to a rendered date string.
 *
 * The `.generated.tsx` twins are compiled from their `.layout.tsx` sources, so
 * a reference in one is the same reference in the other, and the twin is the
 * file that actually ships.
 */
const TOUCHED = [
  "hooks/date/date.names.ts",
  "hooks/date/date.utils.ts",
  "hooks/date/useCalendarState.ts",
  "components/calendar/Calendar.layout.tsx",
  "components/calendar/Calendar.generated.tsx",
  "components/date-picker/DatePicker.layout.tsx",
  "components/date-picker/DatePicker.generated.tsx",
  "components/date-range-picker/DateRangePicker.layout.tsx",
  "components/date-range-picker/DateRangePicker.generated.tsx",
  "components/range-calendar/RangeCalendar.layout.tsx",
  "components/range-calendar/RangeCalendar.generated.tsx",
];

/** A line that is only prose. These modules discuss `Intl` at length. */
const isComment = (line: string) => /^\s*(\/\/|\/?\*|\{\/\*)/.test(line);

describe("no module on the calendar's path references Intl", () => {
  it("reads every file it claims to check, so a bad path cannot pass", () => {
    for (const relative of TOUCHED) {
      const text = readFileSync(join(SRC, relative), "utf8");
      expect(text.length).toBeGreaterThan(0);
    }
  });

  it("finds no Intl identifier outside a comment", () => {
    const hits: string[] = [];

    for (const relative of TOUCHED) {
      const lines = readFileSync(join(SRC, relative), "utf8").split("\n");

      lines.forEach((line, index) => {
        if (isComment(line)) return;
        // Backticked prose inside a code line is still prose.
        if (/(?<!`)\bIntl\b(?!`)/.test(line)) {
          hits.push(`${relative}:${index + 1}: ${line.trim()}`);
        }
      });
    }

    expect(hits).toEqual([]);
  });

  it("would catch a reference, so the scan is not vacuous", () => {
    const planted = ["const f = new Intl.DateTimeFormat(locale);"];

    expect(planted.filter((line) => !isComment(line) && /(?<!`)\bIntl\b(?!`)/.test(line))).toHaveLength(1);
    expect([" * `Intl` is unavailable", "// Intl is gone"].filter(isComment)).toHaveLength(2);
  });
});
