import { describe, expect, it } from "bun:test";

const css = await Bun.file(
  new URL("../src/components/tabs/Tabs.css", import.meta.url),
).text();

describe("Tabs horizontal layout", () => {
  it("sizes horizontal tabs to their content instead of one list width each", () => {
    const horizontal =
      css.match(
        /\.tabs__list\[data-orientation="horizontal"\] \.tabs__tab\s*\{([\s\S]*?)\}/,
      )?.[1] ?? "";
    const vertical =
      css.match(
        /\.tabs__list\[data-orientation="vertical"\] \.tabs__tab\s*\{([\s\S]*?)\}/,
      )?.[1] ?? "";

    expect(horizontal).toContain("width: auto");
    expect(vertical).toContain("width: 100%");
  });
});
