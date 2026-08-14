export type {
  CreateDataGridOptions,
  DataGridCellContext,
  DataGridColumn,
  DataGridColumnOptions,
  DataGridDataType,
  DataGridModel,
  DataGridRow,
  DataGridSelectionMode,
  DataGridSort,
  DataGridSortDirection,
} from "./createDataGrid";
export { createDataGrid } from "./createDataGrid";
export type {
  DataGridBorders,
  DataGridProps,
  DataGridSticky,
  DataGridStriping,
} from "./DataGrid.generated";

import type { JSX } from "solid-js";
import GeneratedDataGrid from "./DataGrid.generated";
import type { DataGridProps as Props } from "./DataGrid.generated";
import type { DataGridRow as Row } from "./createDataGrid";

/* The compiler emits `declare const DataGrid: __LayoutComponent<DataGridProps>`,
   which erases the row type: `DataGridProps` falls back to its default and a
   model built with `createDataGrid<Person>()` no longer fits, because the model
   takes `Row` in parameter position and is therefore invariant. Restoring the
   generic at the boundary is a type-level change only - the value is the same
   compiled component - and it is what makes the documented call shape compile. */
const DataGrid = GeneratedDataGrid as <R extends Row = Row>(
  props: Props<R>,
) => JSX.Element;

export default DataGrid;

