import "./Pagination.css";
import type { JSX } from "@solidjs/web";
import {For, omit} from "solid-js";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps, State } from "../vocabulary";
import { CLASSES } from "./Pagination.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Pagination.recipe";

type PaginationToken = number | "ellipsis-left" | "ellipsis-right";

export type PaginationProps = Omit<JSX.HTMLAttributes<HTMLElement>, "onChange"> &
  UIBaseProps & {
    page: number;
    total: number;
    onChange: (page: number) => void;
    state?: State;
  };

const clampPage = (page: number, total: number) => {
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(1, Math.floor(page)), total);
};

const getPaginationTokens = (page: number, total: number): PaginationToken[] => {
  if (total <= 0) return [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-right", total];
  }

  if (page >= total - 3) {
    return [1, "ellipsis-left", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "ellipsis-left", page - 1, page, page + 1, "ellipsis-right", total];
};

const Pagination: Layout<typeof componentRecipe, PaginationProps> = () => {
  const others = omit(props, "class", "dataTheme", "page", "total", "onChange", "state");

  const safeTotal = () => Math.max(1, Math.floor(props.total || 0));
  const currentPage = () => clampPage(props.page, safeTotal());
  const tokens = () => getPaginationTokens(currentPage(), safeTotal());
  const disabled = () => Boolean((props.state === "disabled"));

  const handleChange = (nextPage: number) => {
    if (disabled()) return;
    const bounded = clampPage(nextPage, safeTotal());
    if (bounded === currentPage()) return;
    props.onChange(bounded);
  };

  return (
    <nav
      {...others}
      aria-label="pagination"
      role="navigation"
      {...{ class: twMerge(CLASSES.base, props.class) }}
      data-theme={props.dataTheme}
      data-slot="pagination"
    >
      <div {...{ class: CLASSES.slot.summary }} data-slot="pagination-summary">
        Page {currentPage()} of {safeTotal()}
      </div>

      <ul {...{ class: CLASSES.slot.content }} data-slot="pagination-content">
        <li {...{ class: CLASSES.slot.item }} data-slot="pagination-item">
          <button
            type="button"
            {...{ class: twMerge(CLASSES.slot.link, CLASSES.slot.linkNav) }}
            data-slot="pagination-previous"
            onClick={() => handleChange(currentPage() - 1)}
            disabled={disabled() || currentPage() <= 1}
            aria-label="Go to previous page"
          >
            <span aria-hidden="true">‹</span>
            <span>Previous</span>
          </button>
        </li>

        <For each={tokens()}>
          {(token) => (
            <li {...{ class: CLASSES.slot.item }} data-slot="pagination-item">
              {typeof token === "number" ? (
                <button
                  type="button"
                  {...{ class: CLASSES.slot.link }}
                  data-slot="pagination-link"
                  data-active={token === currentPage() ? "true" : undefined}
                  aria-current={token === currentPage() ? "page" : undefined}
                  aria-label={`Go to page ${token}`}
                  disabled={disabled()}
                  onClick={() => handleChange(token)}
                >
                  {token}
                </button>
              ) : (
                <span
                  {...{ class: CLASSES.slot.ellipsis }}
                  data-slot="pagination-ellipsis"
                  aria-hidden="true"
                >
                  …
                </span>
              )}
            </li>
          )}
        </For>

        <li {...{ class: CLASSES.slot.item }} data-slot="pagination-item">
          <button
            type="button"
            {...{ class: twMerge(CLASSES.slot.link, CLASSES.slot.linkNav) }}
            data-slot="pagination-next"
            onClick={() => handleChange(currentPage() + 1)}
            disabled={disabled() || currentPage() >= safeTotal()}
            aria-label="Go to next page"
          >
            <span>Next</span>
            <span aria-hidden="true">›</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
