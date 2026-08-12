import { children, createMemo, splitProps, type JSX } from "solid-js";
import type { Recipe } from "./recipe";
import type { Layout } from "./types";

export type DefineComponentConfig<R extends Recipe, Model = Record<never, never>> = {
  recipe: R;
  layout: Layout<R, Model>;
  slot?: string;
  behaviour?: readonly string[];
  setup?: (props: Record<string, unknown>) => Record<string, unknown>;
};

export function defineComponent<R extends Recipe, Model>(config: DefineComponentConfig<R, Model>) {
  const presentation = Object.keys(config.recipe.config.props ?? {});
  const state = Object.keys(config.recipe.config.state ?? {});

  return (outer: unknown): JSX.Element => {
    const props = outer as Record<string, unknown>;
    const [appearance, escape, behaviour, passthrough] = splitProps(
      props,
      presentation,
      ["class", "className", "style", "children", "dataTheme"],
      [...(config.behaviour ?? [])],
    );
    const model = config.setup?.(behaviour) ?? {};
    const selection = createMemo(() => {
      const value: Record<string, unknown> = {};
      for (const key of presentation) {
        value[key] = appearance[key] ?? config.recipe.config.defaults?.[key];
      }
      for (const key of state) {
        const current = model[key];
        value[key] = typeof current === "function" ? current() : current;
      }
      return value;
    });
    const ownedSlot = config.slot ?? "root";
    const resolved = createMemo(() =>
      config.recipe.resolve(
        selection(),
        [escape.class, escape.className].filter(Boolean).join(" "),
        ownedSlot,
      ),
    );
    const slot = {} as Record<string, Record<string, unknown>>;

    for (const key of Object.keys(config.recipe.config.slots)) {
      Object.defineProperty(slot, key, {
        enumerable: true,
        get: () =>
          key === ownedSlot
            ? {
                ...passthrough,
                ...(escape.dataTheme === undefined ? {} : { "data-theme": escape.dataTheme }),
                ...resolved()[key],
              }
            : resolved()[key],
      });
    }

    const readable = {} as Record<string, unknown>;
    for (const key of presentation) {
      Object.defineProperty(readable, key, {
        enumerable: true,
        get: () => appearance[key] ?? config.recipe.config.defaults?.[key],
      });
    }
    for (const [key, value] of Object.entries(model)) {
      Object.defineProperty(readable, key, {
        enumerable: true,
        get: () => (state.includes(key) && typeof value === "function" ? value() : value),
      });
    }
    const forwarded = passthrough as Record<string, unknown>;
    for (const key of Object.keys(forwarded)) {
      Object.defineProperty(readable, key, {
        enumerable: true,
        get: () => forwarded[key],
      });
    }
    Object.defineProperties(readable, {
      class: { enumerable: true, get: () => escape.class },
      className: { enumerable: true, get: () => escape.className },
      style: { enumerable: true, get: () => escape.style },
      dataTheme: { enumerable: true, get: () => escape.dataTheme },
    });

    const resolvedChildren = children(() => escape.children as JSX.Element);
    return config.layout(
      { slot: slot as never, get children() { return resolvedChildren(); } },
      readable as never,
    );
  };
}

export function compound<Root extends (...args: never[]) => unknown, Parts extends object>(
  root: Root,
  parts: Parts,
): Root & Parts {
  return Object.assign(root, parts);
}
