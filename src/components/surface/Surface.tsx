import "./Surface.css";
import { createContext, splitProps, type JSX, type ParentComponent } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type SurfaceVariant = "default" | "secondary" | "tertiary" | "transparent";

export type SurfaceVariants = {
  variant?: SurfaceVariant;
};

type SurfaceContextValue = {
  variant?: SurfaceVariant;
};

const SurfaceContext = createContext<SurfaceContextValue>({});

type SurfaceVariantsOptions = SurfaceVariants & {
  className?: string;
};

const SURFACE_VARIANT_CLASS: Record<SurfaceVariant, string> = {
  default: "surface--default",
  secondary: "surface--secondary",
  tertiary: "surface--tertiary",
  transparent: "surface--transparent",
};

const surfaceVariants = (options: SurfaceVariantsOptions = {}): string => {
  const variant = options.variant ?? "default";
  return twMerge("surface", SURFACE_VARIANT_CLASS[variant], options.className);
};

export type SurfaceRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps &
  SurfaceVariants & {
    children?: JSX.Element;
  };

const SurfaceRoot: ParentComponent<SurfaceRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "variant",
  ]);

  const variant = () => local.variant ?? "default";

  return (
    <SurfaceContext.Provider value={{ variant: variant() }}>
      <div
        {...others}
        class={surfaceVariants({
          variant: variant(),
          className: twMerge(local.class, local.className),
        })}
        data-slot="surface"
        data-variant={variant()}
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </div>
    </SurfaceContext.Provider>
  );
};

export { SurfaceRoot, SurfaceContext, surfaceVariants };
export type { SurfaceRootProps as SurfaceProps };
