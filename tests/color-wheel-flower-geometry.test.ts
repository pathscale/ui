import { describe, expect, it } from "bun:test";
import { flowerPetalPosition } from "../src/components/color-wheel-flower/ColorWheelFlower.geometry";

describe("ColorWheelFlower geometry", () => {
  it("anchors petals at the centre and offsets them without mixed-unit calc", () => {
    const position = flowerPetalPosition(47.631, -27.5);

    expect(position).toEqual({
      left: "50%",
      top: "50%",
      "margin-left": "47.631px",
      "margin-top": "-27.5px",
    });
    expect(Object.values(position).join(" ")).not.toContain("calc(");
  });
});
