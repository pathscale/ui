import { For, createEffect, splitProps, type Component } from "solid-js";
import Table from "../table";
import type { TableProps } from "../table";
import {
  createStreamingTableStore,
  type StreamingTableStore,
} from "./createStreamingTableStore";
import type { StreamingColumnDef } from "./types";

export type StreamingTableProps<TData> = {
  data: TData[];
  columns: StreamingColumnDef<TData>[];
  getRowId?: (row: TData) => string;
} & Omit<TableProps, "children">;

const StreamingTable = <TData,>(props: StreamingTableProps<TData>) => {
  const [local, tableProps] = splitProps(props, [
    "data",
    "columns",
    "getRowId",
  ]);

  const store: StreamingTableStore<TData> = createStreamingTableStore<TData>();

  const resolveId = (row: TData): string => {
    if (local.getRowId) return local.getRowId(row);
    const anyRow = row as any;
    if (anyRow.id != null) return String(anyRow.id);
    return JSON.stringify(anyRow);
  };

  createEffect(() => {
    const incoming = local.data ?? [];
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
  });

  return (
    <Table {...tableProps}>
      <Table.Head>
        <Table.Row>
          <For each={local.columns}>
            {(col) => <Table.HeadCell>{col.header}</Table.HeadCell>}
          </For>
        </Table.Row>
      </Table.Head>

      <Table.Body>
        <For each={store.rows()}>
          {(rowStore) => (
            <Table.Row>
              <For each={local.columns}>
                {(col) => (
                  <Table.Cell>
                    {col.cell
                      ? col.cell({ row: { original: rowStore.data() } })
                      : col.accessorKey
                      ? (rowStore.data() as any)[col.accessorKey]
                      : col.accessorFn
                      ? col.accessorFn(rowStore.data())
                      : ""}
                  </Table.Cell>
                )}
              </For>
            </Table.Row>
          )}
        </For>
      </Table.Body>
    </Table>
  );
};

export default StreamingTable;
