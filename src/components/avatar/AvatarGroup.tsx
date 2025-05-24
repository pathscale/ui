import { type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

type ElementType = keyof JSX.IntrinsicElements;

type AvatarGroupBaseProps = {
  /** Custom container tag */
  as?: ElementType;
  /** Extra classes */
  class?: string;
  className?: string;
  children: JSX.Element[];
} & IComponentBaseProps;

type PropsOf<E extends ElementType> = JSX.IntrinsicElements[E];

export type AvatarGroupProps<E extends ElementType = "div"> = Omit<
  PropsOf<E>,
  keyof AvatarGroupBaseProps
> &
  AvatarGroupBaseProps;

const VoidElementList: ElementType[] = [
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "keygen", "meta", "param", "source", "track", "wbr",
];

const AvatarGroup = <E extends ElementType = "div">(
  props: AvatarGroupProps<E>
): JSX.Element => {
  const [local, others] = splitProps(
    props as AvatarGroupBaseProps & Record<string, unknown>,
    ["as", "class", "className", "children"]
  );

  const Tag = local.as || "div";
  const classes = () =>
    twMerge("avatar-group -space-x-6", local.class, local.className);

  // Build an aria-label like "Group of N avatar photos"
  const ariaLabel = `Group of ${local.children.length} avatar photos`;

  if (VoidElementList.includes(Tag)) {
    return (
      <Dynamic
        component={Tag}
        {...others}
        aria-label={ariaLabel}
        class={classes()}
      />
    );
  }

  return (
    <Dynamic
      component={Tag}
      {...others}
      aria-label={ariaLabel}
      class={classes()}
    >
      {local.children}
    </Dynamic>
  );
};

export default AvatarGroup;
