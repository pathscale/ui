import "./Avatar.css";
import type { JSX } from "@solidjs/web";
import {createContext, createSignal, omit, useContext, Show, onSettled, type Component, type ParentComponent} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { UIBaseProps, Flavor } from "../vocabulary";
import { CLASSES } from "./Avatar.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Avatar.recipe";

/* -------------------------------------------------------------------------------------------------
 * Avatar Context
 * -----------------------------------------------------------------------------------------------*/
export type AvatarSize = "sm" | "md" | "lg";
export type AvatarVariant = "default" | "soft";

type AvatarContextValue = {
  size: () => AvatarSize;
  flavor: () => Flavor;
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
  UIBaseProps & {
    children: JSX.Element;
    size?: AvatarSize;
    flavor?: Flavor;
    variant?: AvatarVariant;
  };

export type AvatarImageProps = Omit<JSX.ImgHTMLAttributes<HTMLImageElement>, "children"> &
  UIBaseProps;

export type AvatarFallbackProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element;
    delayMs?: number;
  };

/* -------------------------------------------------------------------------------------------------
 * Avatar Root
 * -----------------------------------------------------------------------------------------------*/
const AvatarRoot: Layout<typeof componentRecipe, AvatarRootProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "size",
    "flavor",
    "variant",
    "dataTheme",
    "style",
  );

  const [imageLoaded, setImageLoaded] = createSignal(false);
  const size = () => props.size ?? "md";
  const flavor = () => props.flavor ?? "neutral";
  const variant = () => props.variant ?? "default";

  const ctx: AvatarContextValue = {
    size,
    flavor,
    variant,
    imageLoaded,
    setImageLoaded,
  };

  return (
    <AvatarContext value={ctx}>
      <span
        {...others}
        {...{ class: twMerge(
          CLASSES.base,
          CLASSES.size[size()],
          CLASSES.variant[variant()],
          props.class,
        ) }}
        data-slot="avatar-root"
        data-theme={props.dataTheme}
        style={props.style}
      >
        {props.children}
      </span>
    </AvatarContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Avatar Image
 * -----------------------------------------------------------------------------------------------*/
const AvatarImage: Layout<typeof componentRecipe, AvatarImageProps> = () => {
  const others = omit(props, "class", "dataTheme", "style", "src", "alt", "onLoad", "onError");

  const ctx = useAvatarContext();

  const handleLoad: JSX.EventHandlerUnion<HTMLImageElement, Event> = (e) => {
    ctx.setImageLoaded(true);
    if (typeof props.onLoad === "function") props.onLoad(e);
  };

  const handleError = (e: Event & { currentTarget: HTMLImageElement }) => {
    ctx.setImageLoaded(false);
    if (typeof props.onError === "function") (props.onError as (e: Event) => void)(e);
  };

  return (
    <img
      {...others}
      src={props.src}
      alt={props.alt}
      {...{ class: twMerge(CLASSES.slot.image, props.class) }}
      data-slot="avatar-image"
      style={props.style}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Avatar Fallback
 * -----------------------------------------------------------------------------------------------*/
const AvatarFallback: Layout<typeof componentRecipe, AvatarFallbackProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style", "delayMs");

  const ctx = useAvatarContext();
  const [showFallback, setShowFallback] = createSignal(!props.delayMs);

  onSettled(() => {
    if (props.delayMs) {
      const timer = setTimeout(() => setShowFallback(true), props.delayMs);
      return () => clearTimeout(timer);
    }
  });

  return (
    <Show when={showFallback() && !ctx.imageLoaded()}>
      <span
        {...others}
        {...{ class: twMerge(
          CLASSES.slot.fallback,
          (CLASSES.flavor[ctx.flavor() as keyof typeof CLASSES.flavor] ?? `avatar__fallback--flavor-${ctx.flavor()}`),
          props.class,
        ) }}
        data-slot="avatar-fallback"
        data-theme={props.dataTheme}
        style={props.style}
      >
        {props.children}
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
