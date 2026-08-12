import { twMerge } from "tailwind-merge";

export type VariantClasses = string | Record<string, string>;
export type Variant = Record<string, VariantClasses>;

export type RecipeConfig = {
  component: string;
  element?: keyof HTMLElementTagNameMap;
  slots: { root: { base?: string } } & Record<string, { base?: string }>;
  props?: Record<string, Variant>;
  state?: Record<string, Variant>;
  defaults?: Record<string, unknown>;
};

export type SlotAttrs = {
  class: string;
  [name: string]: unknown;
};

export type Recipe<C extends RecipeConfig = RecipeConfig> = {
  config: C;
  resolve(
    selection: Record<string, unknown>,
    className?: string,
    overrideSlot?: string,
  ): Record<string, SlotAttrs>;
};

const selected = (value: unknown) => {
  if (value === undefined || value === null) return undefined;
  return String(value);
};

export function recipe<const C extends RecipeConfig>(config: C): Recipe<C> {
  return {
    config,
    resolve(selection, className, overrideSlot = "root") {
      const resolved: Record<string, SlotAttrs> = {};

      for (const [slot, definition] of Object.entries(config.slots)) {
        const classes = [definition.base];

        for (const variants of [config.props, config.state]) {
          for (const [axis, values] of Object.entries(variants ?? {})) {
            const key = selected(selection[axis]);
            if (key === undefined) continue;
            const value = values[key];
            if (typeof value === "string") {
              if (slot === "root") classes.push(value);
            } else {
              classes.push(value?.[slot]);
            }
          }
        }

        const attrs: SlotAttrs = {
          class: twMerge(...classes, slot === overrideSlot ? className : undefined),
          "data-slot": slot === "root" ? config.component : `${config.component}-${slot}`,
        };

        for (const key of Object.keys(config.state ?? {})) {
          const value = selection[key];
          if (value !== undefined && value !== null) attrs[`data-${key}`] = String(value);
        }

        resolved[slot] = attrs;
      }

      return resolved;
    },
  };
}
