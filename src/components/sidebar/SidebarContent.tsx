import { JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { useSidebarContext } from "./SidebarContext";
import { IComponentBaseProps } from "../types";

// Main Content Area
export type SidebarContentProps = JSX.HTMLAttributes<HTMLElement> & IComponentBaseProps;

export const SidebarContent = (props: SidebarContentProps) => {
  const { position, variant } = useSidebarContext();

  const [local, others] = splitProps(props, ["children", "class", "className"]);

  const contentClasses = () => {
    const isLeft = position() === "left";

    return twMerge(
      "flex-1 flex flex-col min-w-0 bg-background",

      variant() === "inset" && "rounded-lg border shadow bg-card",

      isLeft ? "order-2" : "order-1",

      local.class || local.className
    );
  };

  return (
    <main {...others} class={contentClasses()}>
      {local.children}
    </main>
  );
};
