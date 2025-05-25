import { type JSX, splitProps, createSignal, createEffect } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps } from "../types";

import CollapseDetails from "./CollapseDetails";
import { CollapseTitle } from "./CollapseTitle";
import CollapseContent from "./CollapseContent";

export type CollapseProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLDivElement> & {
    checkbox?: boolean;
    icon?: "arrow" | "plus";
    open?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    onToggle?: () => void;
  };

export const classesFn = ({
  className,
  icon,
  open,
}: Pick<CollapseProps, "className" | "icon" | "open">) =>
  twMerge(
    "collapse",
    className,
    clsx({
      "collapse-arrow": icon === "arrow",
      "collapse-plus": icon === "plus",
      "collapse-open": open === true,
      "collapse-close": open === false,
    })
  );

const Collapse = (props: CollapseProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "checkbox",
    "icon",
    "open",
    "onOpen",
    "onClose",
    "onToggle",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  let checkboxRef: HTMLInputElement | undefined;
  const [isChecked, setIsChecked] = createSignal(local.open ?? false);

  const handleCheckboxChange = () => {
    local.onToggle?.();
    const checked = checkboxRef?.checked ?? false;
    setIsChecked(checked);
    checked ? local.onOpen?.() : local.onClose?.();
  };

  const handleBlur: JSX.FocusEventHandlerUnion<HTMLDivElement, FocusEvent> = (
    e
  ) => {
    if (!local.checkbox) {
      local.onToggle?.();
      local.onClose?.();
    }
    if (typeof others.onBlur === "function") {
      others.onBlur(e);
    }
  };

  const handleFocus: JSX.FocusEventHandlerUnion<HTMLDivElement, FocusEvent> = (
    e
  ) => {
    if (!local.checkbox) {
      local.onToggle?.();
      local.onOpen?.();
    }
    if (typeof others.onFocus === "function") {
      others.onFocus(e);
    }
  };

  createEffect(() => {
    if (local.open !== undefined) {
      setIsChecked(local.open);
    }
  });

  return (
    <div
      aria-expanded={local.open}
      {...others}
      data-theme={local.dataTheme}
      class={classesFn({
        className: twMerge(local.class, local.className),
        icon: local.icon,
        open: local.open,
      })}
      style={local.style}
      tabIndex={isChecked() ? undefined : 0}
      onBlur={handleBlur}
      onFocus={handleFocus}
    >
      {local.checkbox && (
        <input
          type="checkbox"
          tabIndex={isChecked() ? 0 : undefined}
          class="peer"
          ref={(el) => (checkboxRef = el)}
          onChange={handleCheckboxChange}
        />
      )}
      {local.children}
    </div>
  );
};

export default Object.assign(Collapse, {
  Details: CollapseDetails,
  Title: CollapseTitle,
  Content: CollapseContent,
});
