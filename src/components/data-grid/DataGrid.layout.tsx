import "./DataGrid.css";
import { For, type JSX, Show, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import Button from "../button";
import Checkbox from "../checkbox";
import {
  SortIcon,
  TableBody,
  TableCell,
  TableColumn,
  TableContent,
  TableFooter,
  TableHeader,
  TableRoot,
  TableRow,
  TableScrollContainer,
} from "../table";
import type { Flavor, Size, UIBaseProps, Width } from "../vocabulary";
import type {
  DataGridModel,
  DataGridRow,
  DataGridSort,
} from "./createDataGrid";
import {
  cellContent,
  columnSpan,
  formatCell,
  rangeLabel,
  readInputValue,
  searchPlaceholder,
} from "./DataGrid.interactions";
import { CLASSES, componentRecipe } from "./DataGrid.recipe";

export type DataGridBorders = "none" | "rows" | "cols" | "both";
export type DataGridStriping = "none" | "rows" | "cols";
export type DataGridSticky = "none" | "header" | "columns" | "both";

/**
 * `model` is the only required prop.
 *
 * There is no `sortable`, `searchable`, `checkable`, `pagination` or
 * `expandable` flag, because each of those is already a fact about the model
 * and a second copy on the tag could disagree with it. A column is sortable
 * because it was added sortable; the grid pages because it was given a
 * pageSize; it selects because it was given a selection mode.
 *
 * What is left on the tag is presentation, which is nobody else's fact.
 */
export type DataGridProps<Row extends DataGridRow = DataGridRow> = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  UIBaseProps & {
    model: DataGridModel<Row>;
    borders?: DataGridBorders;
    striping?: DataGridStriping;
    sticky?: DataGridSticky;
    /** Row hover feedback. Named to match Card rather than vue3's `hoverable`. */
    interactive?: boolean;
    size?: Size;
    width?: Width;
    flavor?: Flavor;
    caption?: JSX.Element;
    /** Shown in place of the body when nothing survives the filters. */
    empty?: JSX.Element;
    /** Renders under a row. Supplying it is what makes rows expandable. */
    renderExpanded?: (row: Row) => JSX.Element;
    /** Mirrors, for an app keeping state in a URL. The model stays the source. */
    onSortChange?: (sort: DataGridSort | null) => void;
    onPageChange?: (page: number) => void;
    onSelectionChange?: (ids: ReadonlySet<string>) => void;
  };

const DataGrid: Layout<typeof componentRecipe, DataGridProps> = () => {
  const [local, rest] = splitProps(props, [
    "model",
    "borders",
    "striping",
    "sticky",
    "interactive",
    "size",
    "width",
    "flavor",
    "caption",
    "empty",
    "renderExpanded",
    "onSortChange",
    "onPageChange",
    "onSelectionChange",
    "class",
    "dataTheme",
  ]);

  const borders = () => local.borders ?? "rows";
  const striping = () => local.striping ?? "none";
  const sticky = () => local.sticky ?? "none";
  const size = () => local.size ?? "md";

  const searchable = () =>
    local.model.visibleColumns().filter((column) => column.searchable);
  const selects = () => local.model.selectionMode() !== "none";
  const paginates = () => local.model.pageSize() > 0;
  const span = () => columnSpan(local.model.visibleColumns().length, selects());

  const allOnPageSelected = () => {
    const rows = local.model.pageRows();
    if (rows.length === 0) return false;
    return rows.every((row, index) => local.model.isSelected(row, index));
  };

  const changeSort = (descriptor: DataGridSort) => {
    local.model.sortByColumn(descriptor.column);
    local.onSortChange?.(local.model.sort());
  };

  const changePage = (page: number) => {
    local.model.switchPage(page);
    local.onPageChange?.(local.model.page());
  };

  const changeSelection = (row: DataGridRow, index: number) => {
    local.model.toggleCheck(row, index);
    local.onSelectionChange?.(local.model.selectedIds());
  };

  const changeSelectAll = (selected: boolean) => {
    local.model.toggleCheckAll(selected);
    local.onSelectionChange?.(local.model.selectedIds());
  };

  return (
    <TableRoot
      {...{
        class: twMerge(
          CLASSES.root,
          CLASSES.borders[borders()],
          CLASSES.striping[striping()],
          CLASSES.sticky[sticky()],
          CLASSES.size[size()],
          local.interactive ? CLASSES.interactive : undefined,
          local.class,
        ),
      }}
      data-theme={local.dataTheme}
      data-slot="data-grid"
      data-flavor={local.flavor}
      data-width={local.width}
      data-selection={local.model.selectionMode()}
      {...rest}
    >
      <Show when={searchable().length > 0}>
        <div
          {...{ class: CLASSES.toolbar }}
          data-slot="data-grid-toolbar"
        >
          <For each={searchable()}>
            {(column) => (
              <label
                {...{ class: CLASSES.search }}
                data-slot="data-grid-search"
              >
                <span {...{ class: CLASSES.searchLabel }}>
                  {searchPlaceholder(column.label)}
                </span>
                <input
                  {...{ class: CLASSES.searchInput }}
                  type="search"
                  value={local.model.queries()[column.name] ?? ""}
                  placeholder={searchPlaceholder(column.label)}
                  onInput={(event) =>
                    local.model.searchColumn(column.name, readInputValue(event))
                  }
                />
              </label>
            )}
          </For>
        </div>
      </Show>

      <TableScrollContainer>
        <TableContent
          sortDescriptor={local.model.sort() ?? undefined}
          onSortChange={changeSort}
        >
          <Show when={local.caption}>
            <caption>{local.caption}</caption>
          </Show>

          <TableHeader>
            <TableRow>
              <Show when={selects()}>
                <TableColumn
                  id="__select"
                  {...{ class: CLASSES.selectCell }}
                >
                  <Checkbox
                    aria-label="Select all rows"
                    checked={allOnPageSelected()}
                    onChange={() => changeSelectAll(!allOnPageSelected())}
                  />
                </TableColumn>
              </Show>
              <For each={local.model.visibleColumns()}>
                {(column) => (
                  <TableColumn
                    id={column.name}
                    allowsSorting={column.sortable}
                    {...{ class: CLASSES.headerCell }}
                    data-sticky={column.sticky ? "true" : undefined}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {(state) => (
                      <span {...{ class: CLASSES.headerButton }}>
                        {column.label}
                        <Show when={column.sortable}>
                          <SortIcon
                            state={
                              state.sortDirection === "ascending"
                                ? "asc"
                                : state.sortDirection === "descending"
                                  ? "desc"
                                  : "none"
                            }
                          />
                        </Show>
                      </span>
                    )}
                  </TableColumn>
                )}
              </For>
            </TableRow>
          </TableHeader>

          <TableBody>
            <For each={local.model.groupedRows()}>
              {(group) => (
                <>
                  <Show when={local.model.groupBy()}>
                    <TableRow
                      {...{ class: CLASSES.groupRow }}
                      data-slot="data-grid-group-row"
                    >
                      <TableCell colSpan={span()}>
                        {formatCell(group.value)}
                      </TableCell>
                    </TableRow>
                  </Show>
                  <For each={group.rows}>
                    {(row, index) => (
                      <>
                        <TableRow
                          data-selected={
                            local.model.isSelected(row, index())
                              ? "true"
                              : undefined
                          }
                        >
                          <Show when={selects()}>
                            <TableCell {...{ class: CLASSES.selectCell }}>
                              <Checkbox
                                aria-label="Select row"
                                checked={local.model.isSelected(row, index())}
                                onChange={() => changeSelection(row, index())}
                              />
                            </TableCell>
                          </Show>
                          <For each={local.model.visibleColumns()}>
                            {(column) => (
                              <TableCell
                                {...{ class: CLASSES.cell }}
                                data-sticky={column.sticky ? "true" : undefined}
                                data-align={column.align}
                              >
                                {cellContent(column, row, index())}
                              </TableCell>
                            )}
                          </For>
                        </TableRow>
                        <Show when={local.renderExpanded}>
                          <TableRow>
                            <TableCell colSpan={span()}>
                              {local.renderExpanded?.(row)}
                            </TableCell>
                          </TableRow>
                        </Show>
                      </>
                    )}
                  </For>
                </>
              )}
            </For>

            <Show when={local.model.pageRows().length === 0}>
              <TableRow>
                <TableCell
                  colSpan={span()}
                  {...{ class: CLASSES.empty }}
                  data-slot="data-grid-empty"
                >
                  {local.empty ?? "No rows"}
                </TableCell>
              </TableRow>
            </Show>
          </TableBody>
        </TableContent>
      </TableScrollContainer>

      <Show when={paginates()}>
        <TableFooter
          {...{ class: CLASSES.pagination }}
          data-slot="data-grid-pagination"
        >
          <span {...{ class: CLASSES.pageStatus }}>
            {rangeLabel(
              local.model.page(),
              local.model.pageSize(),
              local.model.total(),
            )}
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Previous page"
            state={local.model.page() === 0 ? "disabled" : "default"}
            onClick={() => changePage(local.model.page() - 1)}
          >
            Previous
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Next page"
            state={
              local.model.page() >= local.model.pageCount() - 1
                ? "disabled"
                : "default"
            }
            onClick={() => changePage(local.model.page() + 1)}
          >
            Next
          </Button>
        </TableFooter>
      </Show>
    </TableRoot>
  );
};

export default DataGrid;
