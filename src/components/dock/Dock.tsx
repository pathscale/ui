import type { JSX } from "solid-js";
import { splitProps, createSignal } from "solid-js";
import { twMerge } from "tailwind-merge";
import { IComponentBaseProps, ComponentColor } from "../types";
import { DockContext } from "./DockContext";
import { dockClass } from "./Dock.styles";
import DockLabel from "./DockLabel";
import DockItem from "./DockItem";

type DockSize = "xs" | "sm" | "md" | "lg";

export type DockProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    size?: DockSize;
    position?: "top" | "bottom" | "left" | "right";
    variant?: "default" | "floating" | "minimal";
    color?: ComponentColor;
    selected?: string;
    onSelectionChange?: (value: string) => void;
  };

const Dock = (props: DockProps): JSX.Element => {
  const [internalSelected, setInternalSelected] = createSignal(props.selected);

  const [local, others] = splitProps(props, [
    "size",
    "position",
    "variant",
    "color",
    "selected",
    "onSelectionChange",
    "dataTheme",
    "class",
    "className",
    "children",
  ]);

  const handleSelectionChange = (value: string) => {
    if (local.onSelectionChange) {
      local.onSelectionChange(value);
    } else {
      setInternalSelected(value);
    }
  };

  const currentSelected = () => {
    return local.selected !== undefined ? local.selected : internalSelected();
  };

  const classes = twMerge(
    dockClass({
      size: local.size,
      position: local.position,
    }),
    local.class,
    local.className
  );

  const contextValue = {
    color: local.color || "neutral",
    selected: currentSelected,
    setSelected: handleSelectionChange,
  };

  return (
    <DockContext.Provider value={contextValue}>
      <div
        {...others}
        role="navigation"
        data-theme={local.dataTheme}
        class={classes}
      >
        {local.children}
      </div>
    </DockContext.Provider>
  );
};

export default Object.assign(Dock, { Item: DockItem, Label: DockLabel });
