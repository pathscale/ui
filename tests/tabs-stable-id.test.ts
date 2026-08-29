import { describe, expect, it } from "bun:test";

const layout = await Bun.file(
  new URL("../src/components/tabs/Tabs.layout.tsx", import.meta.url),
).text();

describe("Tabs stable identity", () => {
  it("derives tab and panel ids from a caller-supplied root id", () => {
    expect(layout).toContain("const baseId = () => props.id || generatedId");
    expect(layout).toContain('`${baseId()}-tab-${String(key)}`');
    expect(layout).toContain('`${baseId()}-panel-${String(key)}`');
  });
});
