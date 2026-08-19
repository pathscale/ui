import {omit} from "solid-js";
import { Dynamic, type JSX} from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";

import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./Avatar.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Avatar.recipe";

type ElementType = keyof JSX.IntrinsicElements;

type AvatarGroupBaseProps = {
  /** Custom container tag */
  as?: ElementType;
  /** Extra classes */
  class?: string;
  children: JSX.Element[];
} & UIBaseProps;

type PropsOf<E extends ElementType> = JSX.IntrinsicElements[E];

export type AvatarGroupProps<E extends ElementType = "div"> = Omit<
  PropsOf<E>,
  keyof AvatarGroupBaseProps
> &
  AvatarGroupBaseProps;

const VoidElementList: ElementType[] = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "keygen",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

const AvatarGroup: Layout<typeof componentRecipe, AvatarGroupProps> = () => {
  const others = omit(
    props as AvatarGroupBaseProps & Record<string, unknown>,
    "as",
    "class",
    "children",
  );

  const Tag = props.as || "div";
  const classes = () =>
    twMerge(CLASSES.group.base, CLASSES.group.overlap, props.class);

  // Build an aria-label like "Group of N avatar photos"
  const ariaLabel = `Group of ${props.children.length} avatar photos`;

  if (VoidElementList.includes(Tag)) {
    return (
      <Dynamic
        component={Tag}
        {...others}
        aria-label={ariaLabel}
        {...{ class: classes() }}
      />
    );
  }

  return (
    <Dynamic
      component={Tag}
      {...others}
      aria-label={ariaLabel}
      {...{ class: classes() }}
    >
      {props.children}
    </Dynamic>
  );
};

export default AvatarGroup as <E extends ElementType = "div">(props: AvatarGroupProps<E>) => JSX.Element;
