import "./Breadcrumbs.css";
import {
  createContext,
  splitProps,
  useContext,
  Show,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

/* -------------------------------------------------------------------------------------------------
 * Breadcrumbs Context
 * -----------------------------------------------------------------------------------------------*/
type BreadcrumbsContextValue = {
  separator: () => JSX.Element | undefined;
};

const BreadcrumbsContext = createContext<BreadcrumbsContextValue>();

const useBreadcrumbsContext = () => {
  const ctx = useContext(BreadcrumbsContext);
  if (!ctx) throw new Error("Breadcrumbs.Item must be used within <Breadcrumbs>");
  return ctx;
};

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type BreadcrumbsRootProps = Omit<JSX.HTMLAttributes<HTMLElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
    separator?: JSX.Element;
  };

export type BreadcrumbsItemProps = Omit<JSX.HTMLAttributes<HTMLLIElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
    href?: string;
    isCurrent?: boolean;
  };

/* -------------------------------------------------------------------------------------------------
 * Default Separator Icon
 * -----------------------------------------------------------------------------------------------*/
const ChevronRight = () => (
  <svg
    aria-hidden="true"
    data-slot="breadcrumbs-separator"
    fill="none"
    height="12"
    viewBox="0 0 24 24"
    width="12"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 18l6-6-6-6"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
    />
  </svg>
);

/* -------------------------------------------------------------------------------------------------
 * Breadcrumbs Root
 * -----------------------------------------------------------------------------------------------*/
const BreadcrumbsRoot: ParentComponent<BreadcrumbsRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "separator",
    "dataTheme",
    "style",
  ]);

  const ctx: BreadcrumbsContextValue = {
    separator: () => local.separator,
  };

  return (
    <BreadcrumbsContext.Provider value={ctx}>
      <nav
        {...others}
        aria-label="Breadcrumbs"
        class={twMerge("breadcrumbs", local.class, local.className)}
        data-slot="breadcrumbs"
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </nav>
    </BreadcrumbsContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Breadcrumbs Item
 * -----------------------------------------------------------------------------------------------*/
const BreadcrumbsItem: Component<BreadcrumbsItemProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "href",
    "isCurrent",
    "dataTheme",
    "style",
  ]);

  const ctx = useBreadcrumbsContext();

  return (
    <li
      {...others}
      class={twMerge("breadcrumbs__item", local.class, local.className)}
      data-slot="breadcrumbs-item"
      data-theme={local.dataTheme}
      style={local.style}
    >
      <Show
        when={local.href && !local.isCurrent}
        fallback={
          <span
            class="breadcrumbs__link"
            data-slot="breadcrumbs-link"
            data-current={local.isCurrent ? "true" : undefined}
            aria-current={local.isCurrent ? "page" : undefined}
          >
            {local.children}
          </span>
        }
      >
        <a
          href={local.href}
          class="breadcrumbs__link"
          data-slot="breadcrumbs-link"
        >
          {local.children}
        </a>
      </Show>
      <Show when={!local.isCurrent}>
        <span class="breadcrumbs__separator" data-slot="breadcrumbs-separator">
          {ctx.separator() ?? <ChevronRight />}
        </span>
      </Show>
    </li>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
const Breadcrumbs = Object.assign(BreadcrumbsRoot, {
  Root: BreadcrumbsRoot,
  Item: BreadcrumbsItem,
});

export default Breadcrumbs;
export { BreadcrumbsRoot, BreadcrumbsItem };
