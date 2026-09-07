import { recipe } from "../../lib/layouts";

/**
 * Presentation, owned here rather than assembled in the component.
 *
 * The recipe declared nine empty slots while `Switch.layout.tsx` kept a
 * `CLASSES` table and built the root's class with `twMerge` over base, size,
 * flavor and a disabled flag. The slot names it declared did not match what the
 * component rendered either -- `label` and `switch` were never used, and the
 * classes lived somewhere else entirely.
 *
 * `flavor` and `size` are call-site props. `disabled` is computed from
 * `props.disabled`, `props.state` and the enclosing group, so it is `state`:
 * the compiler mirrors it to `data-disabled`, which is what the component was
 * already setting by hand alongside the class.
 */
export const componentRecipe = recipe({
  component: "switch",
  element: "label",
  slots: {
    root: { base: "switch" },
    input: { base: "switch__input" },
    control: { base: "switch__control" },
    thumb: { base: "switch__thumb" },
    icon: { base: "switch__icon" },
    content: { base: "switch__content" },
    /*
     * `label` and `description` publish their bare names, not the qualified
     * `switch-label` and `switch-description` a non-root slot would get.
     *
     * They are not this component's parts. Eight components in this library
     * render one or both, and five stylesheets reach them through a descendant
     * selector -- `.date-field [data-slot="description"]`, `.menu-item
     * [data-slot="label"]` -- which is how a field styles whichever control is
     * inside it. Qualifying the names here would make this the one control
     * those rules miss.
     */
    label: { slot: "label" },
    description: { base: "switch__description", slot: "description" },
  },
  props: {
    flavor: {
      neutral: "switch--flavor-neutral",
      primary: "switch--flavor-primary",
      secondary: "switch--flavor-secondary",
      accent: "switch--flavor-accent",
      destructive: "switch--flavor-destructive",
      success: "switch--flavor-success",
      warning: "switch--flavor-warning",
      info: "switch--flavor-info",
    },
    size: {
      sm: "switch--sm",
      md: "switch--md",
      lg: "switch--lg",
    },
  },
  /*
   * No `disabled` axis.
   *
   * It is derived -- `props.disabled`, or `state === "disabled"`, or the
   * enclosing group -- so no prop the compiler can read by name produces it.
   * The layout already sets `data-disabled`, and `Switch.css` already selects
   * on `.switch[data-disabled="true"]` beside the old `.switch--disabled`, so
   * the attribute path was live the whole time and the class was a duplicate.
   * The dead selectors are gone with it.
   */
  defaults: {
    flavor: "accent",
    size: "md",
  },
});
