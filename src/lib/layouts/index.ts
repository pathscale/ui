/*
 * The one place this library names its Layouts runtime.
 *
 * `solid-layouts` ships two trees from one package: the default serves Solid
 * 1.9, and `solid-layouts/solid-2` serves Solid 2. They are the same code — the
 * only difference is which module the renderer imports `Dynamic` and
 * `createComponent` from, because 2.0 moved them to `@solidjs/web` and dropped
 * the `solid-js/web` subpath entirely, so no single import statement resolves
 * under both.
 *
 * Told rather than sniffed: a module specifier is resolved before any code
 * runs, and `grep` on this line answers which runtime a build is on. The
 * generated `.generated.tsx` files carry the matching
 * `solid-layouts/solid-2/application-boundary` import, chosen by the compiler's
 * `solid: 2` option.
 */
export {
  compound,
  type DefineComponentConfig,
  defineComponent,
  type Layout,
  type PropsOf,
  type Recipe,
  type RecipeConfig,
  recipe,
  type SlotAttrs,
  type SlotsOf,
  type StateOf,
} from "solid-layouts/solid-2";
