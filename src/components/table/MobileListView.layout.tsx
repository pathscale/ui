import { For, Show, type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { Empty } from "../empty";
import Icon from "../icon";
import type { UIBaseProps } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { tableMobileListViewRecipe } from "./Table.recipe";

export type MobileListViewProps<TRow> = UIBaseProps & {
  rows: TRow[];
  renderRow?: (row: TRow, index: number) => JSX.Element;
  empty?: JSX.Element;
  listClass?: string;
  itemClass?: string;
  children?: (row: TRow, index: number) => JSX.Element;
  emptyTitle?: string;
  emptyIcon?: string;
};

const MobileListView: Layout<typeof tableMobileListViewRecipe, MobileListViewProps<unknown>> = () => {
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
    "dataTheme",
  ]);
  const renderRow = (row: unknown, index: number) => {
    if (local.renderRow) return local.renderRow(row, index);
    if (local.children) return local.children(row, index);
    return null;
  };
  const emptyContent = () => {
    if (local.empty) return local.empty;
    if (!local.emptyTitle) return null;
    return (
      <Empty>
        <Empty.Icon>
          <Icon
            src={local.emptyIcon ?? "icon-[mdi--inbox-outline]"}
            width={24}
            height={24}
          />
        </Empty.Icon>
        <Empty.Title>{local.emptyTitle}</Empty.Title>
      </Empty>
    );
  };

  return (
    <div
      {...rest}
      {...{ class: twMerge("w-full", local.class) }}
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

export default MobileListView as <TRow>(props: MobileListViewProps<TRow>) => JSX.Element;
