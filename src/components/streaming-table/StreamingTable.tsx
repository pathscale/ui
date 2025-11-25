import { createEffect, splitProps, type Component } from "solid-js";
import EnhancedTable, { type EnhancedTableProps } from "../table/EnhancedTable";
import type { ColumnDef } from "@tanstack/solid-table";
import {
  createStreamingTableStore,
  type StreamingTableStore,
} from "./createStreamingTableStore";
import type { StreamingColumnDef, StreamingConfig } from "./types";

export type StreamingTableProps<TData> = {
  data: TData[];
  columns: StreamingColumnDef<TData>[];
  getRowId?: (row: TData) => string;
  streamingConfig?: StreamingConfig;
} & Omit<EnhancedTableProps<TData>, "data" | "columns">;

const StreamingTable = <TData,>(props: StreamingTableProps<TData>) => {
  const [local, enhancedProps] = splitProps(props, [
    "data",
    "columns",
    "getRowId",
    "streamingConfig",
  ]);

  const store: StreamingTableStore<TData> = createStreamingTableStore<TData>();

  const config = {
    maxBufferSize: local.streamingConfig?.maxBufferSize ?? 1000,
    appendMode: local.streamingConfig?.appendMode ?? false,
  };

  const resolveId = (row: TData): string => {
    if (local.getRowId) return local.getRowId(row);
    const anyRow = row as any;
    if (anyRow.id != null) return String(anyRow.id);
    return JSON.stringify(anyRow);
  };

  createEffect(() => {
    const incoming = local.data ?? [];

    if (config.appendMode) {
      // Append mode: add new rows, don't remove stale ones
      store.appendRows(incoming, resolveId);

      // Truncate if buffer exceeds max size
      store.truncateToSize(config.maxBufferSize);
    } else {
      // Sync mode: upsert and remove stale rows (original behavior)
      const idSet = new Set<string>();

      incoming.forEach((row) => {
        const id = resolveId(row);
        idSet.add(id);
        store.upsertRow(row, resolveId);
      });

      const current = store.rows();
      current.forEach((r) => {
        if (!idSet.has(r.id)) {
          store.removeRow(r.id);
        }
      });
    }
  });

  // Convert row stores to plain data for EnhancedTable
  const tableData = () => store.rows().map((rowStore) => rowStore.data());

  // Convert StreamingColumnDef to TanStack ColumnDef
  const enhancedColumns = (): ColumnDef<TData>[] => {
    return local.columns.map((col) => {
      const colDef: any = {
        header: col.header,
        meta: col.meta,
        enableColumnFilter: col.enableColumnFilter,
        enableSorting: col.enableSorting,
      };

      if (col.accessorKey) {
        colDef.accessorKey = col.accessorKey;
      }

      if (col.accessorFn) {
        colDef.accessorFn = col.accessorFn;
      }

      if (col.cell) {
        colDef.cell = col.cell;
      }

      return colDef as ColumnDef<TData>;
    });
  };

  return (
    <EnhancedTable
      data={tableData()}
      columns={enhancedColumns()}
      {...enhancedProps}
    />
  );
};

export default StreamingTable;
