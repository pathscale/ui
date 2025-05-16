import {
  type Component,
  type JSX,
  splitProps,
  createMemo,
  Show,
  For,
} from "solid-js";
import {
  paginationItemVariants,
  paginationInfoVariants,
  paginationContainerVariants,
} from "./Pagination.styles";
import type { VariantProps } from "@src/lib/style";

export type PaginationProps = {
  total: number;
  perPage?: number;
  current: number;
  onChange: (page: number) => void;
  rangeBefore?: number;
  rangeAfter?: number;
  simple?: boolean;
  children?: JSX.Element;
} & VariantProps<typeof paginationItemVariants> &
  JSX.HTMLAttributes<HTMLElement>;

const Pagination: Component<PaginationProps> = (props) => {
  const [local, variantProps, otherProps] = splitProps(
    props,
    [
      "total",
      "perPage",
      "current",
      "onChange",
      "rangeBefore",
      "rangeAfter",
      "simple",
      "children",
    ],
    ["rounded", "size", "disabled", "active", "simple"]
  );

  const perPage = () => local.perPage ?? 20;
  const pageCount = createMemo(() => Math.ceil(local.total / perPage()));
  const hasPrev = createMemo(() => local.current > 1);
  const hasNext = createMemo(() => local.current < pageCount());

  const pagesInRange = createMemo(() => {
    const before = local.rangeBefore ?? 1;
    const after = local.rangeAfter ?? 1;

    const start = Math.max(1, local.current - before);
    const end = Math.min(local.current + after, pageCount());

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  const changePage = (page: number) => {
    if (page >= 1 && page <= pageCount() && page !== local.current) {
      local.onChange(page);
    }
  };

  return (
    <nav
      class={paginationContainerVariants({ align: "start", wrap: true })}
      {...otherProps}
    >
      <button
        class={paginationItemVariants({
          ...variantProps,
          disabled: !hasPrev(),
        })}
        onClick={() => changePage(local.current - 1)}
        disabled={!hasPrev()}
      >
        &laquo;
      </button>

      <Show when={pageCount() > 1}>
        <Show when={local.simple}>
          <span class={paginationInfoVariants({ simple: true })}>
            {perPage() === 1
              ? `${(local.current - 1) * perPage() + 1} / ${local.total}`
              : `${(local.current - 1) * perPage() + 1}-${Math.min(
                  local.current * perPage(),
                  local.total
                )} / ${local.total}`}
          </span>
        </Show>

        <Show when={!local.simple}>
          <For each={pagesInRange()}>
            {(page) => (
              <button
                class={paginationItemVariants({
                  ...variantProps,
                  active: page === local.current,
                })}
                onClick={() => changePage(page)}
              >
                {page}
              </button>
            )}
          </For>
        </Show>
      </Show>
      <button
        class={paginationItemVariants({
          ...variantProps,
          disabled: !hasNext(),
        })}
        onClick={() => changePage(local.current + 1)}
        disabled={!hasNext()}
      >
        &raquo;
      </button>
    </nav>
  );
};

export default Pagination;
