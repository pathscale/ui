import {
    type Component,
    splitProps,
    Show,
    type JSX,
  } from "solid-js";
  import { classes, type VariantProps, type ClassProps } from "@src/lib/style";
  import { listWrapper } from "./Menu.styles";
  
  export type MenuListProps = {
    label?: string;
    children: JSX.Element;
  } & VariantProps<typeof listWrapper>
    & ClassProps;
  
  const MenuList: Component<MenuListProps> = (props) => {
    const [local, variantProps, otherProps] = splitProps(
      props,
      ["class", "children", "label"] as const,
      Object.keys(listWrapper.variantKeys ?? {}) as any
    );
  
    return (
      <div
        class={classes(
          listWrapper({ label: !!local.label }),
          local.class,
        )}
        {...otherProps}
      >
        <Show when={local.label}>
          <div class="px-4 pb-2 font-medium text-gray-700">{local.label}</div>
        </Show>
        <div class="flex flex-col">{local.children}</div>
      </div>
    );
  };
  
  export default MenuList;
  