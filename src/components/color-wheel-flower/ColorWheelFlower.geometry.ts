/**
 * Place one petal around the wheel centre using properties Blitz supports.
 *
 * Keeping the percentage anchor separate from the pixel offset is deliberate:
 * browser engines accept `calc(50% + …px)`, while Blitz currently drops that
 * mixed-unit position and piles every petal onto the centre.
 */
export function flowerPetalPosition(offsetX: number, offsetY: number) {
  return {
    left: "50%",
    top: "50%",
    "margin-left": `${offsetX}px`,
    "margin-top": `${offsetY}px`,
  } as const;
}
