import "./Breadcrumb.css";
import type { JSX } from "@solidjs/web";
import {
  type Component,
  createContext,
  omit,
  type ParentComponent,
  Show,
  useContext,
} from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Breadcrumb.recipe";

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb Context
 * -----------------------------------------------------------------------------------------------*/
type BreadcrumbContextValue = {
  separator: () => JSX.Element | undefined;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

const useBreadcrumbContext = () => {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error("Breadcrumb.Item must be used within <Breadcrumb>");
  return ctx;
};

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type BreadcrumbRootProps = Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "children"
> &
  UIBaseProps & {
    children: JSX.Element;
    separator?: JSX.Element;
  };

export type BreadcrumbItemProps = Omit<
  JSX.HTMLAttributes<HTMLLIElement>,
  "children"
> &
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
const BreadcrumbRoot: Layout<
  typeof componentRecipe,
  BreadcrumbRootProps
> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "separator",
    "dataTheme",
    "style",
  );

  const ctx: BreadcrumbContextValue = {
    separator: () => props.separator,
  };

  return (
    <BreadcrumbContext value={ctx}>
      <nav
        {...others}
        aria-label="Breadcrumb"
        {...{ class: twMerge(CLASSES.Root.base, props.class) }}
        data-slot="breadcrumb"
        data-theme={props.dataTheme}
        style={props.style}
      >
        {props.children}
      </nav>
    </BreadcrumbContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb Item
 * -----------------------------------------------------------------------------------------------*/
const [ITEM_CLASS, LINK_CLASS, SEPARATOR_CLASS] = CLASSES.Item.base;

const BreadcrumbItem: Layout<
  typeof componentRecipe,
  BreadcrumbItemProps
> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "href",
    "isCurrent",
    "dataTheme",
    "style",
  );

  const ctx = useBreadcrumbContext();

  return (
    <li
      {...others}
      {...{ class: twMerge(ITEM_CLASS, props.class) }}
      data-slot="breadcrumb-item"
      data-theme={props.dataTheme}
      style={props.style}
    >
      <Show
        when={props.href && !props.isCurrent}
        fallback={
          <span
            {...{ class: LINK_CLASS }}
            data-slot="breadcrumb-link"
            data-current={props.isCurrent ? "true" : undefined}
            aria-current={props.isCurrent ? "page" : undefined}
          >
            {props.children}
          </span>
        }
      >
        <a
          href={props.href}
          {...{ class: LINK_CLASS }}
          data-slot="breadcrumb-link"
        >
          {props.children}
        </a>
      </Show>
      <Show when={!props.isCurrent}>
        <span
          {...{ class: SEPARATOR_CLASS }}
          data-slot="breadcrumb-separator"
        >
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
export { BreadcrumbItem, BreadcrumbRoot };
