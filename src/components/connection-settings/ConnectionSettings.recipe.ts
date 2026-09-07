import { recipe } from "../../lib/layouts";

/**
 * Presentation lives here, not in the layout.
 *
 * This declared empty slots while `ConnectionSettings.layout.tsx` kept a
 * `CLASSES` table and assembled class strings by hand with `twMerge`. That is
 * the shape `solid-layouts-lint` calls a "legacy component-shaped Layout", and
 * it was the only unbaselined warning in the repository -- new debt in a new
 * component, which is exactly the debt `warningsAsErrors` exists to stop.
 *
 * `open` and `applying` are recipe props rather than conditional classes in the
 * component, so the compiler owns the whole class string.
 */
export const componentRecipe = recipe({
  component: "connection-settings",
  element: "form",
  slots: {
    root: { base: "connection-settings" },
    header: { base: "connection-settings__header" },
    title: { base: "connection-settings__title" },
    description: { base: "connection-settings__description" },
    switch: { base: "connection-settings__switch" },
    fields: { base: "connection-settings__fields" },
    field: { base: "connection-settings__field" },
    label: { base: "connection-settings__label" },
    input: { base: "connection-settings__input" },
    hint: { base: "connection-settings__hint" },
    current: { base: "connection-settings__current" },
    actions: { base: "connection-settings__actions" },
  },
});

/*
 * No `props` block, deliberately.
 *
 * `open` and `applying` are this component's own runtime state -- a local
 * signal and a read off the store -- not props a caller passes, so a recipe
 * prop could never be driven by either. They are `data-open` and
 * `data-applying` on the root instead, which is the state-attribute convention
 * the library already documents and style against.
 *
 * `connection-settings--open` is gone rather than converted: no rule in
 * `ConnectionSettings.css` ever matched it.
 */
