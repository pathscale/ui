import "./Avatar.css";
import {
  createContext,
  createSignal,
  splitProps,
  useContext,
  Show,
  onMount,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Avatar.classes";

/* -------------------------------------------------------------------------------------------------
 * Avatar Context
 * -----------------------------------------------------------------------------------------------*/
export type AvatarSize = "sm" | "md" | "lg";
export type AvatarColor = "default" | "accent" | "success" | "warning" | "danger";
export type AvatarVariant = "default" | "soft";

type AvatarContextValue = {
  size: () => AvatarSize;
  color: () => AvatarColor;
  variant: () => AvatarVariant;
  imageLoaded: () => boolean;
  setImageLoaded: (v: boolean) => void;
};

const AvatarContext = createContext<AvatarContextValue>();

const useAvatarContext = () => {
  const ctx = useContext(AvatarContext);
  if (!ctx) throw new Error("Avatar compound components must be used within <Avatar>");
  return ctx;
};

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type AvatarRootProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
    size?: AvatarSize;
    color?: AvatarColor;
    variant?: AvatarVariant;
  };

export type AvatarImageProps = Omit<JSX.ImgHTMLAttributes<HTMLImageElement>, "children"> &
  IComponentBaseProps;

export type AvatarFallbackProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    delayMs?: number;
  };

/* -------------------------------------------------------------------------------------------------
 * Avatar Root
 * -----------------------------------------------------------------------------------------------*/
const AvatarRoot: ParentComponent<AvatarRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "size",
    "color",
    "variant",
    "dataTheme",
    "style",
  ]);

  const [imageLoaded, setImageLoaded] = createSignal(false);
  const size = () => local.size ?? "md";
  const color = () => local.color ?? "default";
  const variant = () => local.variant ?? "default";

  const ctx: AvatarContextValue = {
    size,
    color,
    variant,
    imageLoaded,
    setImageLoaded,
  };

  return (
    <AvatarContext.Provider value={ctx}>
      <span
        {...others}
        class={twMerge(
          CLASSES.base,
          CLASSES.size[size()],
          CLASSES.variant[variant()],
          local.class,
          local.className,
        )}
        data-slot="avatar-root"
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </span>
    </AvatarContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Avatar Image
 * -----------------------------------------------------------------------------------------------*/
const AvatarImage: Component<AvatarImageProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
    "src",
    "alt",
    "onLoad",
    "onError",
  ]);

  const ctx = useAvatarContext();

  const handleLoad: JSX.EventHandlerUnion<HTMLImageElement, Event> = (e) => {
    ctx.setImageLoaded(true);
    if (typeof local.onLoad === "function") local.onLoad(e);
  };

  const handleError = (e: Event & { currentTarget: HTMLImageElement }) => {
    ctx.setImageLoaded(false);
    if (typeof local.onError === "function") (local.onError as (e: Event) => void)(e);
  };

  return (
    <img
      {...others}
      src={local.src}
      alt={local.alt}
      class={twMerge(CLASSES.slot.image, local.class, local.className)}
      data-slot="avatar-image"
      style={local.style}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Avatar Fallback
 * -----------------------------------------------------------------------------------------------*/
const AvatarFallback: ParentComponent<AvatarFallbackProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "delayMs",
  ]);

  const ctx = useAvatarContext();
  const [showFallback, setShowFallback] = createSignal(!local.delayMs);

  onMount(() => {
    if (local.delayMs) {
      const timer = setTimeout(() => setShowFallback(true), local.delayMs);
      return () => clearTimeout(timer);
    }
  });

  return (
    <Show when={showFallback() && !ctx.imageLoaded()}>
      <span
        {...others}
        class={twMerge(
          CLASSES.slot.fallback,
          CLASSES.color[ctx.color()],
          local.class,
          local.className,
        )}
        data-slot="avatar-fallback"
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </span>
    </Show>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
const Avatar = Object.assign(AvatarRoot, {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
});

export default Avatar;
export { AvatarRoot, AvatarImage, AvatarFallback };
