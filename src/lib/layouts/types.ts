import type { JSX } from "solid-js";
import type { Recipe, RecipeConfig, SlotAttrs, Variant } from "./recipe";

type VariantValue<V extends Variant> = keyof V extends never
  ? unknown
  : "true" extends keyof V
    ? boolean
    : keyof V;

type Group<R, K extends "props" | "state"> = R extends Recipe<infer C>
  ? C extends Record<K, infer G extends Record<string, Variant>>
    ? { [P in keyof G]?: VariantValue<G[P]> }
    : Record<never, never>
  : Record<never, never>;

export type PropsOf<R> = Group<R, "props">;
export type StateOf<R> = Group<R, "state">;
export type SlotsOf<R> = R extends Recipe<infer C extends RecipeConfig> ? keyof C["slots"] : never;

export type Layout<R, Model = Record<never, never>> = (
  stable: {
    slot: Record<SlotsOf<R> & string, SlotAttrs>;
    children: JSX.Element;
  },
  props: PropsOf<R> & StateOf<R> & Model & JSX.HTMLAttributes<HTMLElement> & {
    className?: string;
    dataTheme?: string;
  },
) => JSX.Element;
