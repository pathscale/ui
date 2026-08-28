import { describe, expect, it } from "bun:test";

const layout = await Bun.file(
  new URL("../../../src/components/dropdown/Dropdown.layout.tsx", import.meta.url),
).text();
const styles = await Bun.file(
  new URL("../../../src/components/dropdown/Dropdown.css", import.meta.url),
).text();

describe("Dropdown overlay ownership", () => {
  it("portals the fixed menu out of transformed component ancestors", () => {
    expect(layout).toContain("<Portal>");
    expect(layout).toMatch(/import\s*\{[^}]*\bPortal\b[^}]*\}\s*from\s*["']@solidjs\/web["']/);
    expect(layout).toContain('data-slot="dropdown-popover"');
    expect(layout).toContain("style={menuStyle()}");
  });

  it("makes native semantic visibility immediate when the menu opens", () => {
    expect(styles).toContain('.dropdown__popover[data-open="true"]');
    expect(styles).toMatch(/\.dropdown__popover\[data-open="true"\]\s*\{[^}]*visibility:\s*visible/s);
    expect(styles).not.toMatch(/transition:[^;]*\bvisibility\b/s);
  });
});
