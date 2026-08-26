import { describe, expect, it } from "bun:test";

const layout = await Bun.file(
  new URL("../../../src/components/dropdown/Dropdown.layout.tsx", import.meta.url),
).text();

describe("Dropdown overlay ownership", () => {
  it("keeps the fixed menu in its owning component subtree", () => {
    expect(layout).not.toContain("<Portal");
    expect(layout).not.toMatch(/import\s*\{[^}]*\bPortal\b[^}]*\}\s*from\s*["']@solidjs\/web["']/);
    expect(layout).toContain('data-slot="dropdown-popover"');
    expect(layout).toContain("style={menuStyle()}");
  });
});
