import type { JSX } from "@solidjs/web";
import { For, omit, Show } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import { Empty } from "../empty";
import Icon from "../icon";
import type { UIBaseProps } from "../vocabulary";
import type { tableMobileListViewRecipe } from "./Table.recipe";

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

const MobileListView: Layout<
  typeof tableMobileListViewRecipe,
  MobileListViewProps<unknown>
> = () => {
  const rest = omit(
    props,
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
  );
  const renderRow = (row: unknown, index: number) => {
    if (props.renderRow) return props.renderRow(row, index);
    if (props.children) return props.children(row, index);
    return null;
  };
  const emptyContent = () => {
    if (props.empty) return props.empty;
    if (!props.emptyTitle) return null;
    return (
      <Empty>
        <Empty.Icon>
          <Icon
            src={props.emptyIcon ?? "icon-[mdi--inbox-outline]"}
            width={24}
            height={24}
          />
        </Empty.Icon>
        <Empty.Title>{props.emptyTitle}</Empty.Title>
      </Empty>
    );
  };

  return (
    <div
      {...rest}
      {...{ class: twMerge("w-full", props.class) }}
      data-theme={props.dataTheme}
      data-slot="table-mobile-list-view"
    >
      <ul
        {...{
          class: twMerge("divide-y divide-base-content/10", props.listClass),
        }}
        data-slot="table-mobile-list-view-list"
      >
        <Show
          when={props.rows.length > 0}
          fallback={
            <Show when={emptyContent()}>
              <li
                class="py-8"
                data-slot="table-mobile-list-view-empty"
              >
                {emptyContent()}
              </li>
            </Show>
          }
        >
          <For each={props.rows}>
            {(row, index) =>
              props.renderRow ? (
                <li
                  {...{ class: props.itemClass }}
                  data-slot="table-mobile-list-view-item"
                >
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

export default MobileListView as <TRow>(
  props: MobileListViewProps<TRow>,
) => JSX.Element;
