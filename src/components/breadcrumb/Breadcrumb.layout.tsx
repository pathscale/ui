import "./Breadcrumb.css";
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
import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./Breadcrumb.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Breadcrumb.recipe";

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb Context
 * -----------------------------------------------------------------------------------------------*/
type BreadcrumbContextValue = {
  separator: () => JSX.Element | undefined;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue>();

const useBreadcrumbContext = () => {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error("Breadcrumb.Item must be used within <Breadcrumb>");
  return ctx;
};

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type BreadcrumbRootProps = Omit<JSX.HTMLAttributes<HTMLElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
    separator?: JSX.Element;
  };

export type BreadcrumbItemProps = Omit<JSX.HTMLAttributes<HTMLLIElement>, "children"> &
  UIBaseProps & {
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
    data-slot="breadcrumb-separator"
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
 * Breadcrumb Root
 * -----------------------------------------------------------------------------------------------*/
const BreadcrumbRoot: Layout<typeof componentRecipe, BreadcrumbRootProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "separator",
    "dataTheme",
    "style",
  ]);

  const ctx: BreadcrumbContextValue = {
    separator: () => local.separator,
  };

  return (
    <BreadcrumbContext.Provider value={ctx}>
      <nav
        {...others}
        aria-label="Breadcrumb"
        {...{ class: twMerge(CLASSES.Root.base, local.class) }}
        data-slot="breadcrumb"
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </nav>
    </BreadcrumbContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb Item
 * -----------------------------------------------------------------------------------------------*/
const [ITEM_CLASS, LINK_CLASS, SEPARATOR_CLASS] = CLASSES.Item.base;

const BreadcrumbItem: Layout<typeof componentRecipe, BreadcrumbItemProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "href",
    "isCurrent",
    "dataTheme",
    "style",
  ]);

  const ctx = useBreadcrumbContext();

  return (
    <li
      {...others}
      {...{ class: twMerge(ITEM_CLASS, local.class) }}
      data-slot="breadcrumb-item"
      data-theme={local.dataTheme}
      style={local.style}
    >
      <Show
        when={local.href && !local.isCurrent}
        fallback={
          <span
            {...{ class: LINK_CLASS }}
            data-slot="breadcrumb-link"
            data-current={local.isCurrent ? "true" : undefined}
            aria-current={local.isCurrent ? "page" : undefined}
          >
            {local.children}
          </span>
        }
      >
        <a
          href={local.href}
          {...{ class: LINK_CLASS }}
          data-slot="breadcrumb-link"
        >
          {local.children}
        </a>
      </Show>
      <Show when={!local.isCurrent}>
        <span {...{ class: SEPARATOR_CLASS }} data-slot="breadcrumb-separator">
          {ctx.separator() ?? <ChevronRight />}
        </span>
      </Show>
    </li>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
const Breadcrumb = Object.assign(BreadcrumbRoot, {
  Root: BreadcrumbRoot,
  Item: BreadcrumbItem,
});

export default Breadcrumb;
export { BreadcrumbRoot, BreadcrumbItem };
