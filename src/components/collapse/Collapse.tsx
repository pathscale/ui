import { type JSX, splitProps, createSignal } from "solid-js";
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
    "aria-label"?: string;
    "aria-controls"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
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
    "aria-label",
    "aria-controls",
    "aria-labelledby",
    "aria-describedby",
  ]);

  let checkboxRef: HTMLInputElement | undefined;
  const [internalOpen, setInternalOpen] = createSignal(false);
  const isControlled = local.open !== undefined;
  const isChecked = () => (isControlled ? local.open : internalOpen());

  const handleCheckboxChange = () => {
    if (local.onToggle) local.onToggle();
    if (isControlled) {
      if (local.open && local.onClose) local.onClose();
      if (!local.open && local.onOpen) local.onOpen();
    } else {
      const next = !internalOpen();
      setInternalOpen(next);
      if (next && local.onOpen) local.onOpen();
      if (!next && local.onClose) local.onClose();
    }
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

  const collapseId =
    others.id || `collapse-${Math.random().toString(36).slice(2, 11)}`;

  const ariaExpanded = isChecked();
  const ariaControls = local["aria-controls"] || `${collapseId}-content`;
  const ariaLabel = local["aria-label"];
  const ariaLabelledby = local["aria-labelledby"];
  const ariaDescribedby = local["aria-describedby"];

  const tabIndex = !local.checkbox && !isChecked() ? 0 : undefined;
  const role = "region";

  const className = classesFn({
    className: twMerge(local.class, local.className),
    icon: local.icon,
    open: local.open,
  });

  return (
    <div
      id={collapseId}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      role={role}
      {...others}
      data-theme={local.dataTheme}
      class={className}
      style={local.style}
      tabIndex={tabIndex}
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
          checked={isChecked()}
          aria-hidden="true"
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
