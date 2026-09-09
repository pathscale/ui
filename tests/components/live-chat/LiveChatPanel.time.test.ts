import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { formatChatTime } from "../../../src/components/live-chat/LiveChatPanel.interactions";

/**
 * The chat panel must reach a timestamp without `Intl`.
 *
 * `Intl` is not defined in the browser engine the fleet ships, by policy, and
 * the panel built every message timestamp with `new Intl.DateTimeFormat`. The
 * result was not a wrong timestamp: the `ReferenceError` escaped the render,
 * Solid halted its reactive system permanently, and the page went on painting
 * the frame it already had while every control on it was dead. Measured on
 * pathscale.com, where opening the support chat killed the whole application;
 * the same on 24x.ai and pays.online. This one call was the only `Intl`
 * reference in each of those bundles, and the panel is in 8 of 13 site
 * bundles.
 *
 * So the assertion is in two parts, and the second is the one that keeps the
 * fix: the timestamps have to be right, and the module has to reach them with
 * no reference to `Intl` at all. A `try`/`catch` guard, which is what `Meter`
 * does around its `Intl.NumberFormat`, would also survive the missing global,
 * but a clock reading needs no locale database in the first place.
 *
 * The output is the `en-US` output the panel produced before, so no consumer
 * sees a change: a bare 12-hour hour, a colon, two-digit minutes, one space,
 * and `AM` or `PM`.
 */

const localTime = (hours: number, minutes: number): number =>
  new Date(2026, 8, 9, hours, minutes, 0, 0).getTime();

describe("formatChatTime", () => {
  it("writes an afternoon time the way en-US did", () => {
    expect(formatChatTime(localTime(15, 7))).toBe("3:07 PM");
  });

  it("does not pad the hour and does pad the minute", () => {
    expect(formatChatTime(localTime(9, 5))).toBe("9:05 AM");
    expect(formatChatTime(localTime(11, 59))).toBe("11:59 AM");
  });

  /*
   * The two the modulo gets wrong on its own. Hour 0 is 12 AM and hour 12 is
   * 12 PM, and `hours % 12` reports 0 for both.
   */
  it("calls midnight 12 AM and noon 12 PM", () => {
    expect(formatChatTime(localTime(0, 0))).toBe("12:00 AM");
    expect(formatChatTime(localTime(0, 30))).toBe("12:30 AM");
    expect(formatChatTime(localTime(12, 0))).toBe("12:00 PM");
    expect(formatChatTime(localTime(12, 45))).toBe("12:45 PM");
  });

  it("crosses into the PM half at 1 PM, not at 12", () => {
    expect(formatChatTime(localTime(13, 0))).toBe("1:00 PM");
    expect(formatChatTime(localTime(23, 59))).toBe("11:59 PM");
  });
});

describe("the live chat panel", () => {
  const modules = [
    "src/components/live-chat/LiveChatPanel.interactions.ts",
    "src/components/live-chat/LiveChatPanel.layout.tsx",
    "src/components/live-chat/LiveChatBubble.layout.tsx",
  ];

  for (const module of modules) {
    it(`names Intl nowhere in ${module}`, () => {
      const source = readFileSync(
        join(import.meta.dir, "../../..", module),
        "utf8",
      );
      const offenders = source
        .split("\n")
        .map((line, index) => ({ line, number: index + 1 }))
        // Prose in a comment is not a reference, and the comments here have to
        // be free to say what went wrong.
        .filter(({ line }) => !/^\s*(\*|\/\/|\/\*)/.test(line))
        .filter(({ line }) => /\bIntl\b/.test(line))
        .map(({ line, number }) => `${number}: ${line.trim()}`);
      expect(offenders).toEqual([]);
    });
  }
});
