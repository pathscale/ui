import { describe, expect, it } from "bun:test";

const layout = await Bun.file(
  new URL("../../../src/components/select/Select.layout.tsx", import.meta.url),
).text();
const styles = await Bun.file(
  new URL("../../../src/components/select/Select.css", import.meta.url),
).text();

// Select carries the same two overlay defects Dropdown had, and they were
// fixed there first. These pin the Select copies so the pair cannot drift
// apart again: a portaled listbox is a transient semantic subtree under
// Blitz, and a transitioned `visibility` leaves an open listbox hidden to
// the renderer for the length of the transition.
describe("Select overlay ownership", () => {
  it("keeps the fixed popover in its owning component subtree", () => {
    expect(layout).not.toContain("<Portal");
    expect(layout).not.toMatch(/import\s*\{[^}]*\bPortal\b[^}]*\}\s*from\s*["']@solidjs\/web["']/);
    expect(layout).toContain('data-slot="ui-select-popover"');
    expect(layout).toContain("style={popoverStyle()}");
  });

  it("makes native semantic visibility immediate when the popover opens", () => {
    expect(styles).toContain('.ui-select__popover[data-open="true"]');
    expect(styles).toMatch(/\.ui-select__popover\[data-open="true"\]\s*\{[^}]*visibility:\s*visible/s);
    expect(styles).not.toMatch(/transition:[^;]*\bvisibility\b/s);
  });
});
