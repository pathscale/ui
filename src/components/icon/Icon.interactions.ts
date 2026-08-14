/**
 * Token handling for the preload source.
 *
 * `@pathscale/rsbuild-plugin-iconify` scans an application's own code and emits
 * one rule per glyph it finds, named `.icon-[<set>--<name>]`, plus the
 * `.iconify` rule that turns the generated custom property into a mask. Both
 * classes come from the application's build, never from this package.
 *
 * Call sites across the fleet write the token both ways, `lucide--copy` and the
 * full `icon-[lucide--copy]`, so both are accepted and normalised here rather
 * than at every call site.
 */
const WRAPPED = /^icon-\[(.+)\]$/;

/** Strip the `icon-[...]` wrapper if the caller supplied one. */
export function normalizeToken(token: string): string {
  const wrapped = WRAPPED.exec(token.trim());
  return wrapped ? wrapped[1] : token.trim();
}

/**
 * The class pair the application's generated CSS defines. `iconify` masks with
 * the glyph so it takes `currentColor`; `iconify-color` would paint the glyph's
 * own colours instead, which is not what a themed icon wants.
 */
export function preloadClasses(token: string): string {
  const name = normalizeToken(token);
  return name ? `icon-[${name}] iconify` : "";
}
