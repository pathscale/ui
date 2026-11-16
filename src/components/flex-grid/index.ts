import { FlexGridRoot } from "./FlexGrid.generated";

const FlexGrid: typeof FlexGridRoot & {
  Root: typeof FlexGridRoot;
} = Object.assign(FlexGridRoot, {
  Root: FlexGridRoot,
});

export default FlexGrid;

export { FlexGrid, FlexGridRoot };
export type { FlexGridProps } from "./FlexGrid.generated";
export { createFlexGrid } from "./createFlexGrid";
export type { CreateFlexGridOptions, FlexGridModel } from "./createFlexGrid";
