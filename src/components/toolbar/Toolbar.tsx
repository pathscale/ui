import "./Toolbar.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Toolbar.classes";

export type ToolbarOrientation = "horizontal" | "vertical";

export type ToolbarRootProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLDivElement> & {
    orientation?: ToolbarOrientation;
    isAttached?: boolean;
  };

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(", ");

const isFocusableElement = (element: HTMLElement): boolean => {
  if (element.getAttribute("aria-disabled") === "true") return false;
  return !element.hasAttribute("disabled");
};

const isTypingContext = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  return target.getAttribute("contenteditable") === "true";
};

const getFocusableElements = (root: HTMLDivElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isFocusableElement);

const ToolbarRoot: Component<ToolbarRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "orientation",
    "isAttached",
    "onKeyDown",
    "role",
    "ref",
  ]);

  let rootRef: HTMLDivElement | undefined;

  const orientation = (): ToolbarOrientation => local.orientation ?? "horizontal";

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    if (typeof local.onKeyDown === "function") local.onKeyDown(event);
    if (event.defaultPrevented) return;

    if (isTypingContext(event.target)) return;

    const currentRoot = rootRef;
    if (!currentRoot) return;

    const isVertical = orientation() === "vertical";
    const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
    const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";
    const isMoveKey = event.key === nextKey || event.key === prevKey;
    const isHomeEndKey = event.key === "Home" || event.key === "End";

    if (!isMoveKey && !isHomeEndKey) return;

    const focusable = getFocusableElements(currentRoot);
    if (focusable.length === 0) return;

    const activeElement = document.activeElement as HTMLElement | null;
    const currentIndex = activeElement ? focusable.indexOf(activeElement) : -1;

    let nextIndex = currentIndex;

    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = focusable.length - 1;
    } else if (currentIndex === -1) {
      nextIndex = event.key === prevKey ? focusable.length - 1 : 0;
    } else {
      const step = event.key === nextKey ? 1 : -1;
      nextIndex = (currentIndex + step + focusable.length) % focusable.length;
    }

    event.preventDefault();
    focusable[nextIndex]?.focus();
  };

  return (
    <div
      {...others}
      ref={(el) => {
        rootRef = el;
        if (typeof local.ref === "function") local.ref(el);
      }}
      role={local.role ?? "toolbar"}
      aria-orientation={orientation()}
      data-slot="toolbar"
      data-orientation={orientation()}
      data-theme={local.dataTheme}
      style={local.style}
      onKeyDown={handleKeyDown}
      {...{
        class: twMerge(
          CLASSES.base,
          CLASSES.orientation[orientation()],
          local.isAttached && CLASSES.flag.attached,
          local.class,
          local.className,
        ),
      }}
    >
      {local.children}
    </div>
  );
};

const Toolbar = Object.assign(ToolbarRoot, {
  Root: ToolbarRoot,
});

export default Toolbar;
export { Toolbar, ToolbarRoot };
export type { ToolbarRootProps as ToolbarProps };
