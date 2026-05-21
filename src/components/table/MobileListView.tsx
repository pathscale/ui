import { For, Show, type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { EmptyState } from "../empty-state";
import Icon from "../icon";
import type { IComponentBaseProps } from "../types";

export type MobileListViewProps<TRow> = IComponentBaseProps & {
  rows: TRow[];
  renderRow?: (row: TRow, index: number) => JSX.Element;
  empty?: JSX.Element;
  listClass?: string;
  itemClass?: string;
  children?: (row: TRow, index: number) => JSX.Element;
  emptyTitle?: string;
  emptyIcon?: string;
};

const MobileListView = <TRow,>(props: MobileListViewProps<TRow>): JSX.Element => {
  const [local, rest] = splitProps(props, [
    "rows",
    "renderRow",
    "empty",
    "listClass",
    "itemClass",
    "children",
    "emptyTitle",
    "emptyIcon",
    "class",
    "className",
    "dataTheme",
  ]);
  const renderRow = (row: TRow, index: number) => {
    if (local.renderRow) return local.renderRow(row, index);
    if (local.children) return local.children(row, index);
    return null;
  };
  const emptyContent = () => {
    if (local.empty) return local.empty;
    if (!local.emptyTitle) return null;
    return (
      <EmptyState>
        <EmptyState.Icon>
          <Icon
            name={local.emptyIcon ?? "icon-[mdi--inbox-outline]"}
            width={24}
            height={24}
          />
        </EmptyState.Icon>
        <EmptyState.Title>{local.emptyTitle}</EmptyState.Title>
      </EmptyState>
    );
  };

  return (
    <div
      {...rest}
      {...{ class: twMerge("w-full", local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="table-mobile-list-view"
    >
      <ul
        {...{ class: twMerge("divide-y divide-base-content/10", local.listClass) }}
        data-slot="table-mobile-list-view-list"
      >
        <Show
          when={local.rows.length > 0}
          fallback={
            <Show when={emptyContent()}>
              <li class="py-8" data-slot="table-mobile-list-view-empty">
                {emptyContent()}
              </li>
            </Show>
          }
        >
          <For each={local.rows}>
            {(row, index) =>
              local.renderRow ? (
                <li {...{ class: local.itemClass }} data-slot="table-mobile-list-view-item">
                  {renderRow(row, index())}
                </li>
              ) : (
                renderRow(row, index())
              )
            }
          </For>
        </Show>
      </ul>
    </div>
  );
};

export default MobileListView;
