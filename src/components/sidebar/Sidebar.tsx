import {
  JSX,
  splitProps,
  mergeProps,
  createContext,
  useContext,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import { IComponentBaseProps } from "../types";

interface SidebarContextValue {
  isOpen: () => boolean;
  position: () => "left" | "right";
  variant: () => "default" | "inset";
}

const SidebarContext = createContext<SidebarContextValue>();

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("Sidebar components must be used within SidebarProvider");
  }
  return context;
};

export type SidebarProviderProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    open?: boolean;
    position?: "left" | "right";
    variant?: "default" | "inset";
    className?: string;
    children: JSX.Element;
  };

export const SidebarProvider = (props: SidebarProviderProps) => {
  const merged = mergeProps(
    {
      open: false,
      position: "left" as const,
      variant: "default" as const,
    },
    props
  );

  const [local, others] = splitProps(merged, [
    "children",
    "open",
    "position",
    "variant",
    "dataTheme",
    "class",
    "className",
  ]);

  const contextValue: SidebarContextValue = {
    isOpen: () => local.open!,
    position: () => local.position!,
    variant: () => local.variant!,
  };

  const containerClasses = () =>
    twMerge(
      "flex h-screen w-full",
      local.variant === "inset" && "p-2 gap-2",
      local.class || local.className
    );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div {...others} data-theme={local.dataTheme} class={containerClasses()}>
        {local.children}
      </div>
    </SidebarContext.Provider>
  );
};
