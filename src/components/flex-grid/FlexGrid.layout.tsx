import type { JSX } from "@solidjs/web";
import { For, omit, Show } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
// `componentRecipe` is a value import, not `import type`: the generated file
// passes it to `defineComponent`, so narrowing it to a type breaks the
// declaration build with TS1361 while the source still typechecks.
import { CLASSES, componentRecipe } from "./FlexGrid.recipe";
import "./FlexGrid.css";
import { createFlexGrid } from "./createFlexGrid";

interface FlexGridProps<T> extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> {
  class?: string;
  /** Everything there is, in the order it should appear. */
  rows: readonly T[];
  /** One row. */
  children: (row: T, index: () => number) => JSX.Element;
  /** How many rows to build up front, and how many each reveal adds. */
  pageSize?: number;
  /**
   * Reveal from the end rather than the start: a log or a transcript, whose
   * useful rows are the last ones and whose "more" means *earlier*.
   */
  fromEnd?: boolean;
  /**
   * Reveal more as the reader scrolls, without them having to ask. On by
   * default, because it is what a list of this shape is expected to do.
   */
  autoLoad?: boolean;
  /**
   * The control that reveals the next page, given the count so it can say how
   * many are coming. Omit it to rely on scrolling alone.
   */
  more?: (props: { count: number; remaining: number; reveal: () => void }) => JSX.Element;
  /** Shown in place of the list when there is nothing at all. */
  empty?: JSX.Element;
}

/**
 * A long list, rendered a page at a time.
 *
 * The cost this removes is construction, not data: a list of 700 rows where 20
 * are visible still builds 700 subtrees, and each row in a component library is
 * a handful of instances rather than one element. Consumers had been
 * hand-rolling it - one application had seven separate implementations of the
 * same limit signal and "show more" button, and the lists that had *not* been
 * given one were the slow ones.
 *
 * The reveal rule lives in `createFlexGrid`, exported separately for anyone who
 * wants it without this markup.
 */
const FlexGridRoot: Layout<typeof componentRecipe, FlexGridProps<unknown>> = () => {
  const others = omit(
    props,
    "class",
    "rows",
    "children",
    "pageSize",
    "fromEnd",
    "autoLoad",
    "more",
    "empty",
  );

  const grid = createFlexGrid({
    rows: () => props.rows,
    pageSize: props.pageSize,
    fromEnd: props.fromEnd,
  });

  const autoLoad = () => props.autoLoad ?? true;
  const moreControl = () =>
    props.more?.({
      count: grid.nextCount(),
      remaining: grid.remaining(),
      reveal: grid.revealMore,
    });

  return (
    <div {...others} {...{ class: twMerge(CLASSES.base, props.class) }} data-slot="root">
      <Show when={props.rows.length > 0} fallback={props.empty}>
        <div
          {...{ class: CLASSES.slot.list }}
          data-slot="flex-grid-list"
          onScroll={(event) => {
            if (autoLoad()) grid.onScroll(event);
          }}
        >
          {/*
            The control sits above the rows when the list runs from the end,
            because what it reveals is older than everything already on screen,
            and below them otherwise. Same control either way; only its place
            changes, so the reader never has to hunt for it.
          */}
          <Show when={props.fromEnd && grid.hasMore() && props.more}>
            <div {...{ class: CLASSES.slot.more }} data-slot="flex-grid-more">
              {moreControl()}
            </div>
          </Show>

          <For each={grid.visible()}>{(row, index) => props.children(row, index)}</For>

          <Show when={!props.fromEnd && grid.hasMore() && props.more}>
            <div {...{ class: CLASSES.slot.more }} data-slot="flex-grid-more">
              {moreControl()}
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export { FlexGridRoot };
export type { FlexGridProps };
