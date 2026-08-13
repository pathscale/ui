/**
 * Whether the content element should exist in the DOM.
 *
 * Trivial, and a module of its own because the caller has to read it inside a
 * tracked scope. The same expression written as an early `return null` in the
 * component body reads both values exactly once: a collapsible that starts
 * collapsed with `keepMounted={false}` then never appears, and one that starts
 * expanded never goes away. Naming it makes the reactive read the obvious
 * place to put it, and lets the behaviour be tested without a renderer.
 */
export const shouldMountCollapsibleContent = (
  keepMounted: boolean,
  expanded: boolean,
) => keepMounted || expanded;
