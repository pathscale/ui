import { JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { useSidebarContext } from "./SidebarContext";

// Sidebar Navigation
export type SidebarNavProps = JSX.HTMLAttributes<HTMLElement> & {
  className?: string;
  children: JSX.Element;
};

export const SidebarNav = (props: SidebarNavProps) => {
  const [local, others] = splitProps(props, ["children", "class", "className"]);

  const navClasses = () =>
    twMerge(
      "flex-1 overflow-y-auto p-2",
      "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border",
      local.class || local.className
    );

  return (
    <nav {...others} class={navClasses()}>
      {local.children}
    </nav>
  );
};

// Sidebar Navigation Item
export type SidebarNavItemProps = JSX.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  active?: boolean;
  children: JSX.Element;
};

export const SidebarNavItem = (props: SidebarNavItemProps) => {
  const { isOpen } = useSidebarContext();

  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "active",
  ]);

  const itemClasses = () =>
    twMerge(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
      "transition-colors hover:bg-accent hover:text-accent-foreground",
      "cursor-pointer select-none",

      // Active state
      local.active && "bg-accent text-accent-foreground font-medium",

      // Collapsed state
      !isOpen() && "justify-center px-2",

      local.class || local.className
    );
  return (
    <div {...others} class={itemClasses()}>
      {local.children}
    </div>
  );
};
