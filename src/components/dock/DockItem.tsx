import type { JSX, Component } from "solid-js";
import { splitProps, useContext } from "solid-js";
import { twMerge } from "tailwind-merge";
import { IComponentBaseProps, ComponentColor } from "../types";
import { DockContext } from "./DockContext";
import { dockItemClass } from "./Dock.styles";

export type DockItemProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> &
  IComponentBaseProps & {
    value: string;
    color?: ComponentColor;
    size?: "xs" | "sm" | "md" | "lg"; 
    active?: boolean;
    disabled?: boolean;
  };

const DockItem: Component<DockItemProps> = (props) => {
  const context = useContext(DockContext);

  const [local, others] = splitProps(props, [
    "value",
    "color",
    "size", 
    "active",
    "disabled",
    "dataTheme",
    "class",
    "className",
    "children",
    "onClick",
  ]);

  const isActive = () => {
    if (local.active !== undefined) return local.active;
    return context?.selected?.() === local.value;
  };

  const itemColor = () => local.color || context?.color || "neutral";

  const handleClick = (
    e: MouseEvent & { currentTarget: HTMLButtonElement; target: Element }
  ) => {
    
    if (typeof local.onClick === "function") {
      local.onClick(e);
    }

    
    if (!local.disabled && context?.setSelected) {
      context.setSelected(local.value);
    }
  };

  const classes = () =>
    twMerge(
      dockItemClass({
        active: isActive(),
        color: itemColor(), 
        size: local.size, 
        disabled: local.disabled,
      }),
      local.class,
      local.className
    );

  return (
    <button
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      onClick={handleClick}
      disabled={local.disabled}
    >
      {local.children}
    </button>
  );
};

export default DockItem;
