import {
  type JSX,
  splitProps,
  Show,
  children as resolveChildren,
  createMemo,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import AvatarGroup from "./AvatarGroup";
import type {
  IComponentBaseProps,
  ComponentColor,
  ComponentShape,
  ComponentSize,
} from "../types";

type ElementType = keyof JSX.IntrinsicElements;

type AvatarBaseProps = {
  src?: string;
  letters?: string;
  size?: ComponentSize | number;
  shape?: ComponentShape;
  color?: Exclude<ComponentColor, "ghost">;
  border?: boolean;
  borderColor?: Exclude<ComponentColor, "ghost">;
  online?: boolean;
  offline?: boolean;
  innerClass?: string;
  as?: ElementType;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  children?: JSX.Element;
};

type PropsOf<E extends ElementType> = JSX.IntrinsicElements[E];

export type AvatarProps<E extends ElementType = "div"> = Omit<
  PropsOf<E>,
  "color"
> &
  AvatarBaseProps &
  IComponentBaseProps;

// Void elements rarely used here, but we'll allow generic `as`
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

const Avatar = <E extends ElementType = "div">(
  props: AvatarProps<E>
): JSX.Element => {
  const [local, others] = splitProps(
    props as AvatarBaseProps & Record<string, unknown>,
    [
      "src",
      "letters",
      "size",
      "shape",
      "color",
      "border",
      "borderColor",
      "online",
      "offline",
      "innerClass",
      "as",
      "class",
      "className",
      "style",
      "children",
      "dataTheme",
    ]
  );

  const resolvedChildren = resolveChildren(() => local.children);
  const Tag = createMemo(() => local.as || "div");

  // Container classes
  const containerClass = createMemo(() =>
    twMerge(
      "avatar",
      local.class,
      local.className,
      clsx({
        "avatar-online": local.online,
        "avatar-offline": local.offline,
        "avatar-placeholder": !local.src,
      })
    )
  );

  // Inner element dimensions
  const customSizeStyle = createMemo(() =>
    typeof local.size === "number"
      ? { width: `${local.size}px`, height: `${local.size}px` }
      : undefined
  );

  // Shared inner classes
  const baseInner = createMemo(() => twMerge(local.innerClass));

  // Image wrapper classes
  const imgClasses = createMemo(() =>
    clsx(baseInner(), {
      ring: local.border,
      "ring-offset-base-100 ring-offset-2": local.border,
      [`ring-${local.borderColor}`]: local.border && local.borderColor,
      "rounded-full": local.shape === "circle",
      "rounded-btn": local.shape === "square",
      "w-32 h-32": local.size === "lg",
      "w-24 h-24": local.size === "md",
      "w-14 h-14": local.size === "sm",
      "w-10 h-10": local.size === "xs",
    })
  );

  // Placeholder wrapper classes
  const placeholderClasses = createMemo(() =>
    clsx(baseInner(), {
      "bg-neutral-focus": !local.color,
      "text-neutral-content": !local.color || local.color === "neutral",
      [`bg-${local.color}`]: !!local.color,
      [`text-${local.color}-content`]: !!local.color,
      ring: local.border,
      "ring-offset-base-100 ring-offset-2": local.border,
      [`ring-${local.borderColor}`]: local.border && local.borderColor,
      "rounded-full": local.shape === "circle",
      "rounded-btn": local.shape === "square",
      "w-32 h-32 text-3xl": local.size === "lg",
      "w-24 h-24 text-xl": local.size === "md",
      "w-14 h-14": local.size === "sm",
      "w-10 h-10": local.size === "xs",
    })
  );

  // Check if child is a single string
  const isStringChild = createMemo(() => {
    const child = resolvedChildren();
    return typeof child === "string";
  });

  const renderContents = () => {
    // If src => image avatar
    return local.src ? (
      <div class={imgClasses()} style={customSizeStyle()}>
        <img src={local.src} />
      </div>
    ) : local.letters || isStringChild() ? (
      <div class={placeholderClasses()} style={customSizeStyle()}>
        <span>{local.letters ?? resolvedChildren()}</span>
      </div>
    ) : (
      <div class={imgClasses()} style={customSizeStyle()}>
        {resolvedChildren()}
      </div>
    );
  };

  // Render void tags (unlikely) or normal
  if (VoidElementList.includes(Tag())) {
    return (
      <Dynamic
        component={Tag()}
        {...others}
        data-theme={local.dataTheme}
        class={containerClass()}
        style={local.style}
      />
    );
  }

  return (
    <Dynamic
      component={Tag()}
      {...others}
      data-theme={local.dataTheme}
      class={containerClass()}
      style={local.style}
    >
      {renderContents()}
    </Dynamic>
  );
};

// Attach Group
export default Object.assign(Avatar, {
  Group: AvatarGroup,
});
