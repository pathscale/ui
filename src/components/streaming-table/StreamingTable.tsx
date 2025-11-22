import { For, onMount, splitProps } from "solid-js";
import Table from "../table/Table";
import type { StreamingColumnDef } from "./types";

import {
  createStreamingTableStore,
  type StreamingTableStore,
} from "./createStreamingTableStore";

export type StreamingTableProps<T> = {
  data: T[];
  columns: StreamingColumnDef<T>[];
  getRowId?: (row: T) => string;
} & Omit<Parameters<typeof Table>[0], "children">;

export function StreamingTable<T>(props: StreamingTableProps<T>) {
  const [local, tableProps] = splitProps(props, [
    "data",
    "columns",
    "getRowId",
  ]);

  const getId = local.getRowId ?? ((row: any) => row.id);

  const store: StreamingTableStore<T> = createStreamingTableStore<T>();

  onMount(() => {
    store.loadInitial(local.data, getId);
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
                      ? col.cell({
                          row: { original: rowStore.data() },
                        })
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
}

export default StreamingTable;
