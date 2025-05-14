import {
  type Component,
  splitProps,
  type JSX,
} from "solid-js";
import { classes, type VariantProps, type ClassProps } from "@src/lib/style";
import { menuWrapper } from "./Menu.styles";

export type MenuProps = {
  inline?: boolean;
  className?: string;
  children: JSX.Element;
} & VariantProps<typeof menuWrapper>
  & ClassProps;

const Menu: Component<MenuProps> = (props) => {
  const [local, variantProps, otherProps] = splitProps(
    props,
    ["class", "className", "children", "inline"] as const,
    Object.keys(menuWrapper.variantKeys ?? {}) as any
  );

  return (
    <div
      class={classes(
        menuWrapper({ inline: !!variantProps.inline }),
        local.class,
        local.className
      )}
      {...otherProps}
    >
      {local.children}
    </div>
  );
};

export default Menu;
