import { JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { useSidebarContext } from "./SidebarContext";

export type SidebarPanelProps = JSX.HTMLAttributes<HTMLElement> & {
  className?: string;
  children: JSX.Element;
};

export const SidebarPanel = (props: SidebarPanelProps) => {
  const { isOpen } = useSidebarContext();

  const [local, others] = splitProps(props, ["children", "class", "className"]);

  const panelClasses = () => {
    const isVisible = isOpen();

    return twMerge(
      "flex h-full flex-col bg-background border-r shrink-0",
      "transition-all duration-300 ease-in-out",

      clsx({
        "w-64": isVisible,
        "w-0": !isVisible,

        "overflow-hidden": !isVisible,
      }),

      local.class || local.className
    );
  };

  return (
    <aside {...others} class={panelClasses()}>
      <div class="flex h-full flex-col shrink-0 min-w-64">{local.children}</div>
    </aside>
  );
};
