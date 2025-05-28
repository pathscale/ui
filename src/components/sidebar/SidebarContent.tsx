import { JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { useSidebarContext } from "./SidebarContext";
import { IComponentBaseProps } from "../types";

export type SidebarContentProps = JSX.HTMLAttributes<HTMLElement> & IComponentBaseProps;

export const SidebarContent = (props: SidebarContentProps) => {

  const [local, others] = splitProps(props, ["children", "class", "className"]);

  const contentClasses = () => {
    return twMerge(
      "flex-1 flex flex-col min-w-0 bg-background order-2",

      local.class || local.className
    );
  };

  return (
    <main {...others} class={contentClasses()}>
      {local.children}
    </main>
  );
};
