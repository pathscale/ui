import {
  type JSX,
  type ParentComponent,
  splitProps,
  children as resolveChildren,
} from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { IComponentBaseProps } from "../types";

export type DrawerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "ref"> &
  IComponentBaseProps & {
    side: JSX.Element;
    open?: boolean;
    end?: boolean;
    toggleClassName?: string;
    contentClassName?: string;
    sideClassName?: string;
    overlayClassName?: string;
    onClickOverlay?: () => void;
  };

const Drawer: ParentComponent<DrawerProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "side",
    "open",
    "end",
    "dataTheme",
    "class",
    "className",
    "toggleClassName",
    "contentClassName",
    "sideClassName",
    "overlayClassName",
    "onClickOverlay",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = () =>
    twMerge(
      "drawer",
      local.class,
      local.className,
      clsx({
        "drawer-end": local.end,
      })
    );

  const toggleClasses = () => twMerge("drawer-toggle", local.toggleClassName);

  const contentClasses = () =>
    twMerge("drawer-content", local.contentClassName);

  const sideClasses = () => twMerge("drawer-side", local.sideClassName);

  const overlayClasses = () =>
    twMerge("drawer-overlay", local.overlayClassName);

  return (
    <div
      aria-expanded={local.open}
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
    >
      <input
        type="checkbox"
        class={toggleClasses()}
        checked={local.open}
        readOnly
      />
      <div class={contentClasses()}>{resolvedChildren()}</div>
      <div class={sideClasses()}>
        <label class={overlayClasses()} onClick={local.onClickOverlay} />
        {local.side}
      </div>
    </div>
  );
};

export default Drawer;
