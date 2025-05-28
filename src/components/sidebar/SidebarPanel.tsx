import { JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { useSidebarContext } from "./SidebarContext";
import { mergeProps } from "solid-js";

// Sidebar Panel (the actual sidebar)
export type SidebarPanelProps = JSX.HTMLAttributes<HTMLElement> & {
  className?: string;
  collapsible?: "offcanvas" | "icon" | "none";
  children: JSX.Element;
};

export const SidebarPanel = (props: SidebarPanelProps) => {
  const { isOpen, position, variant } = useSidebarContext();

  const merged = mergeProps(
    {
      collapsible: "offcanvas" as const,
    },
    props
  );

  const [local, others] = splitProps(merged, [
    "children",
    "class",
    "className",
    "collapsible",
  ]);

  const panelClasses = () => {
    const isLeft = position() === "left";
    const isVisible = isOpen();

    return twMerge(
      // Base styles
      "flex h-full flex-col bg-background border-r",
      "transition-all duration-300 ease-in-out",

      // Variant styles
      variant() === "inset" && "rounded-lg border shadow",

      // Width based on state and collapsible type
      isVisible ? "w-64" : local.collapsible === "icon" ? "w-16" : "w-0",

      // Visibility for offcanvas
      local.collapsible === "offcanvas" && !isVisible && "overflow-hidden",

      // Position
      isLeft ? "order-1" : "order-2",

      // Custom classes
      local.class || local.className
    );
  };

  return (
    <aside {...others} class={panelClasses()}>
      <div class="flex h-full flex-col overflow-hidden">{local.children}</div>
    </aside>
  );
};
