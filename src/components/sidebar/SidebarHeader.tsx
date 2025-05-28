import { JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { useSidebarContext } from "./SidebarContext";

// Sidebar Header
export type SidebarHeaderProps = JSX.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: JSX.Element;
};

export const SidebarHeader = (props: SidebarHeaderProps) => {
  const { isOpen } = useSidebarContext();

  const [local, others] = splitProps(props, ["children", "class", "className"]);

  const headerClasses = () =>
    twMerge(
      "flex items-center gap-2 px-4 py-2 border-b",
      "text-sidebar-foreground/90",
      !isOpen() && "justify-center px-2",
      local.class || local.className
    );

  return (
    <div {...others} class={headerClasses()}>
      {local.children}
    </div>
  );
};
