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
    className?: string;
    children: JSX.Element;
  };

export const SidebarProvider = (props: SidebarProviderProps) => {
  const merged = mergeProps(
    {
      open: false,
      position: "left" as const,
    },
    props
  );

  const [local, others] = splitProps(merged, [
    "children",
    "open",
    "position",
    "dataTheme",
    "class",
    "className",
  ]);

  const contextValue: SidebarContextValue = {
    isOpen: () => local.open!,
  };

  const containerClasses = () =>
    twMerge(
      "flex h-screen w-full overflow-hidden",
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
