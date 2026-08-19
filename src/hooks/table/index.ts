/*
 * What is left of `hooks/table` after TanStack.
 *
 * The sorting, filtering, pagination, selection, expansion and model hooks were
 * a thin public shim over `@tanstack/solid-table`. Nothing inside this library
 * used one, and `createDataGrid` answers the same questions natively — its rows
 * derive `filteredRows -> sortedRows -> pageRows`, with selection alongside — so
 * the shim was a second table engine kept alive only by its own exports.
 *
 * `useAnchoredOverlayPosition` stays because it never had anything to do with
 * TanStack: it positions an overlay against a cell, which a grid still needs.
 */

export type { UseAnchoredOverlayPositionOptions } from "./useAnchoredOverlayPosition";
export { useAnchoredOverlayPosition } from "./useAnchoredOverlayPosition";
