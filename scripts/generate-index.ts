/**
 * Phase 1 of the plan: generate each component's `index.ts` from its recipe.
 *
 * The wiring is mechanical — which slots exist, whether there is a layout,
 * whether there is behaviour to run — so this is a code generator rather than
 * an AST transform, per §12. The output is committed, ships as ordinary
 * TypeScript, and shows up in a diff and in go-to-definition.
 *
 * It exists because hand-writing that wiring is how the first attempt went
 * wrong: thirteen components were converted by hand into `defineComponent`
 * calls in a `Foo.tsx`, which is precisely the file §3 does not list and §12
 * says the compiler removes.
 *
 * Slot validation lives here too: every declared slot must be rendered by the
 * layout, and every slot the layout renders must be declared.
 *
 *   bun run scripts/generate-index.ts [--check]
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const COMPONENTS = resolve("src/components");

type Component = {
  dir: string;
  /** `Badge`, from `Badge.recipe.ts`. */
  name: string;
  /** The recipe's exported binding, `badge`. */
  binding: string;
  /** Slot names in declaration order; `root` first by convention. */
  slots: string[];
  /** The tag the recipe renders. */
  element: string;
  /** Presentation axis names, which become the public variant unions. */
  axes: string[];
  hasDefaults: boolean;
  /** `Badge.layout.tsx`, and the layout bindings it exports. */
  layouts: string[];
  /** Slots the layout file actually renders, from its `slot.x` references. */
  rendered: string[];
  /** A behaviour module, `badge.ts` per §3. */
  behaviour: string | null;
  /** The file it lives in, so the import points at what is actually there. */
  behaviourModule: string | null;
  /** The prop names it consumes, declared by the module itself. */
  behaviourProps: string[];
  /** Whether it exports a `Props` type describing them. */
  behaviourType: boolean;
  /** A context to wrap the layout in, exported from the behaviour module. */
  provide: string | null;
  /** Legacy hand-written component. Its presence means "not converted yet". */
  legacy: boolean;
};

/** `close-button` → `CloseButton`. */
function pascal(value: string): string {
  return value.replace(/(^|[-_])([a-z])/g, (_, __, c) => c.toUpperCase());
}

function read(path: string): string {
  return readFileSync(path, "utf8");
}

/**
 * The slot names a recipe declares.
 *
 * Read from the source rather than by importing it: the recipe imports from
 * `solid-layouts`, and a generator that has to resolve the runtime to read a
 * declaration is a generator that cannot run before an install.
 */
function slotsOf(source: string): string[] {
  const start = source.indexOf("slots:");
  if (start === -1) return [];
  let depth = 0;
  let index = source.indexOf("{", start);
  const open = index;
  for (; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    else if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
  }

  const body = source.slice(open + 1, index);
  const names: string[] = [];
  let nested = 0;
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (nested === 0) {
      const match = trimmed.match(/^"?([A-Za-z_][\w-]*)"?\s*:/);
      if (match) names.push(match[1]);
    }
    nested += (line.match(/\{/g) ?? []).length;
    nested -= (line.match(/\}/g) ?? []).length;
  }
  return names;
}

/** The names under `props:` — the axes a caller can set. */
function axesOf(source: string): string[] {
  const start = source.search(/\n  props: \{/);
  if (start === -1) return [];
  let depth = 0;
  let index = source.indexOf("{", start);
  const open = index;
  for (; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    else if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  const body = source.slice(open + 1, index);
  const names: string[] = [];
  let nested = 0;
  for (const line of body.split("\n")) {
    if (nested === 0) {
      const match = line.trim().match(/^"?([A-Za-z_][\w-]*)"?\s*:/);
      if (match) names.push(match[1]);
    }
    nested += (line.match(/\{/g) ?? []).length;
    nested -= (line.match(/\}/g) ?? []).length;
  }
  return names;
}

function collect(): Component[] {
  const found: Component[] = [];

  for (const dir of readdirSync(COMPONENTS).sort()) {
    const full = join(COMPONENTS, dir);
    if (!statSync(full).isDirectory()) continue;

    const files = readdirSync(full);
    const recipeFile = files.find((f) => f.endsWith(".recipe.ts"));
    if (!recipeFile) continue;

    const name = recipeFile.slice(0, -".recipe.ts".length);
    const recipe = read(join(full, recipeFile));
    const binding = recipe.match(/export const (\w+) = recipe\(/)?.[1] ?? name;

    const layoutFile = files.find((f) => f === `${name}.layout.tsx`);
    const layoutSource = layoutFile ? read(join(full, layoutFile)) : "";
    const layouts = [...layoutSource.matchAll(/export const (\w+Layout)\b/g)].map(
      (m) => m[1],
    );
    // Which slots the markup reaches for. A slot need not have a layout of its
    // own — close-button draws its icons inside the root's — so this is what
    // "rendered" means, not the set of exported layout bindings.
    const rendered = [
      ...new Set(
        [...layoutSource.matchAll(/\bslot\.(\w+)/g)].map((m) => m[1]),
      ),
    ];

    // §3 names the behaviour module in lowercase — `accordion.ts` beside
    // `Accordion.recipe.ts`. `.logic.ts` is accepted as well because that is
    // what the hand-written attempt produced, and rejecting it outright would
    // strand those modules rather than generating against them.
    const behaviourFile =
      files.find((f) => f === `${dir}.ts`) ??
      files.find((f) => f === `${name.toLowerCase()}.ts`) ??
      files.find((f) => f === `${name}.logic.ts`);

    let behaviour: string | null = null;
    let behaviourModule: string | null = null;
    let behaviourProps: string[] = [];
    let behaviourType = false;
    if (behaviourFile) {
      const source = read(join(full, behaviourFile));
      behaviour = source.match(/export function (create\w+)/)?.[1] ?? null;
      behaviourModule = behaviourFile.replace(/\.tsx?$/, "");
      // The module declares which props it consumes, because nothing else can
      // know: they are neither presentation (the recipe would declare them)
      // nor plain HTML (the element would accept them).
      const list = source.match(/export const behaviour = \[([^\]]*)\]/);
      if (list) {
        behaviourProps = [...list[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      }
      behaviourType = /export type Props\b/.test(source);
    }

    const contextFile = files.find((f) => f === `${name}.context.ts`);
    const provide = contextFile
      ? (read(join(full, contextFile)).match(/export const (\w*Context)\b/)?.[1] ??
        null)
      : null;

    found.push({
      dir,
      name,
      binding,
      slots: slotsOf(recipe),
      element: recipe.match(/element:\s*"(\w+)"/)?.[1] ?? "div",
      axes: axesOf(recipe),
      rendered,
      hasDefaults: files.includes(`${name}.defaults.ts`),
      layouts,
      behaviour,
      behaviourModule,
      behaviourProps,
      behaviourType,
      provide,
      // Any hand-written component in the directory, not just `<Name>.tsx`:
      // live-chat ships as LiveChatBubble.tsx and LiveChatPanel.tsx, and
      // matching only the exact name overwrote its index with a generated one
      // that exported neither.
      legacy: files.some(
        (f) => f.endsWith(".tsx") && !f.endsWith(".layout.tsx"),
      ),
    });
  }

  return found;
}

/**
 * `root` → the component itself; any other slot → a compound member.
 *
 * When there are members the root takes a `Root` suffix, because the bare name
 * belongs to the compound that wraps it — otherwise the file declares the same
 * binding twice.
 */
function memberFor(component: Component, slot: string): string {
  if (slot !== "root") return `${component.name}${pascal(slot)}`;
  const hasMembers = component.slots.some(
    (other) => other !== "root" && layoutFor(component, other) !== null,
  );
  return hasMembers ? `${component.name}Root` : component.name;
}

function layoutFor(component: Component, slot: string): string | null {
  const wanted = `${component.name}${pascal(slot)}Layout`;
  if (component.layouts.includes(wanted)) return wanted;
  // A single-slot component may name its layout after itself.
  if (slot === "root" && component.layouts.includes(`${component.name}Layout`)) {
    return `${component.name}Layout`;
  }
  return null;
}

/** `span` → `HTMLSpanElement`, so the element's own attributes type correctly. */
const ELEMENTS: Record<string, string> = {
  a: "HTMLAnchorElement",
  abbr: "HTMLElement",
  button: "HTMLButtonElement",
  div: "HTMLDivElement",
  fieldset: "HTMLFieldSetElement",
  input: "HTMLInputElement",
  kbd: "HTMLElement",
  label: "HTMLLabelElement",
  legend: "HTMLLegendElement",
  li: "HTMLLIElement",
  p: "HTMLParagraphElement",
  span: "HTMLSpanElement",
  ul: "HTMLUListElement",
};

/**
 * A component's public props: what the recipe declares, plus the state the
 * logic computes, plus whatever the element itself accepts.
 *
 * Only the root carries presentation. A sub-component renders another slot of
 * the same recipe and inherits the selection from its parent, so offering it
 * the axes again would imply a per-part override that does not exist.
 */
function propsType(component: Component, slot: string): string {
  const element = ELEMENTS[component.element] ?? "HTMLElement";
  const html = `JSX.HTMLAttributes<${element}>`;
  if (slot !== "root") return `${html} & IComponentBaseProps`;
  const parts = [
    html,
    "IComponentBaseProps",
    `PropsOf<typeof ${component.binding}>`,
    `StateOf<typeof ${component.binding}>`,
  ];
  if (component.behaviourType) parts.push(`BehaviourProps`);
  return parts.join(" &\n  ");
}

function generate(component: Component): string {
  const { name, binding, slots } = component;
  const imports: string[] = [];
  const parts: string[] = [];

  const usedLayouts = slots
    .map((slot) => layoutFor(component, slot))
    .filter((layout): layout is string => layout !== null);

  imports.push(`import type { JSX } from "solid-js";`);
  imports.push(`import { compound, defineComponent } from "solid-layouts";`);
  imports.push(`import type { PropsOf, StateOf } from "solid-layouts";`);
  imports.push(``);
  imports.push(`import type { IComponentBaseProps } from "../types";`);
  imports.push(``);
  imports.push(`import { ${binding} } from "./${name}.recipe";`);
  if (component.hasDefaults) {
    imports.push(`import defaults from "./${name}.defaults";`);
  }
  if (usedLayouts.length > 0) {
    imports.push(
      `import { ${usedLayouts.join(", ")} } from "./${name}.layout";`,
    );
  }
  if (component.behaviour) {
    imports.push(
      `import { ${component.behaviour} } from "./${component.behaviourModule}";`,
    );
  }
  if (component.behaviourType) {
    imports.push(
      `import type { Props as BehaviourProps } from "./${component.behaviourModule}";`,
    );
  }
  if (component.provide) {
    imports.push(
      `import { ${component.provide} } from "./${name}.context";`,
    );
  }

  const owned = slots.filter(
    (slot) => slot === "root" || layoutFor(component, slot) !== null,
  );

  for (const slot of owned) {
    const member = memberFor(component, slot);
    const layout = layoutFor(component, slot);
    const isRoot = slot === "root";

    const config: string[] = [`recipe: ${binding}`];
    if (member !== binding) config.push(`name: "${member}"`);
    if (!isRoot) config.push(`slot: "${slot}"`);
    if (isRoot && component.hasDefaults) {
      config.push(`defaults: defaults.${name}`);
    }
    if (isRoot && component.behaviourProps.length > 0) {
      config.push(
        `behaviour: [${component.behaviourProps.map((p) => `"${p}"`).join(", ")}]`,
      );
    }
    if (isRoot && component.behaviour) config.push(`setup: ${component.behaviour}`);
    if (isRoot && component.provide) config.push(`provide: ${component.provide}`);
    if (layout) config.push(`layout: ${layout}`);

    const body =
      config.length === 1
        ? `{ ${config[0]} }`
        : `{\n  ${config.join(",\n  ")},\n}`;

    // Annotated rather than inferred. Without it TypeScript reports TS2883 —
    // the inferred type names `JSX.Element` through the runtime's own copy of
    // solid-js, which is not portable — and the component would ship with no
    // usable prop types at all.
    parts.push(
      `export type ${member}Props = ${propsType(component, slot)};`,
    );
    parts.push(
      `const ${member} = defineComponent(${body}) as unknown as (\n  props: ${member}Props,\n) => JSX.Element;`,
    );
  }

  const members = owned
    .filter((slot) => slot !== "root")
    .map((slot) => `  ${pascal(slot)}: ${memberFor(component, slot)},`);

  const root = memberFor(component, "root");
  const exported =
    members.length > 0
      ? `const ${name} = compound(${root}, {\n${members.join("\n")}\n});`
      : "";

  const names = owned.map((slot) => memberFor(component, slot));

  const aliases = component.axes.map(
    (axis) =>
      `export type ${name}${pascal(axis)} = NonNullable<\n  PropsOf<typeof ${binding}>["${axis}"]\n>;`,
  );
  const rootMember = memberFor(component, "root");
  if (rootMember !== name) {
    aliases.push(`export type ${name}Props = ${rootMember}Props;`);
  }

  return [
    `// Generated by scripts/generate-index.ts. Do not edit.`,
    `//`,
    `// The wiring is mechanical — which slots exist, whether there is a layout,`,
    `// whether there is behaviour to run — so it is generated rather than typed`,
    `// out. Edit the recipe, the layout or the behaviour module instead.`,
    ``,
    imports.join("\n"),
    ``,
    parts.join("\n\n"),
    ``,
    aliases.length > 0 ? aliases.join("\n") : null,
    aliases.length > 0 ? `` : null,
    exported,
    exported ? `` : null,
    `export default ${name};`,
    `export { ${[...new Set([name, ...names])].join(", ")} };`,
    ``,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/** Every declared slot rendered, every rendered slot declared. */
function validate(component: Component): string[] {
  const problems: string[] = [];
  if (component.layouts.length === 0) return problems;

  for (const slot of component.rendered) {
    if (!component.slots.includes(slot)) {
      problems.push(
        `${component.dir}: the layout renders slot "${slot}", which the recipe does not declare`,
      );
    }
  }

  for (const slot of component.slots) {
    if (!component.rendered.includes(slot)) {
      problems.push(
        `${component.dir}: slot "${slot}" is declared but the layout never renders it`,
      );
    }
  }

  return problems;
}

const check = process.argv.includes("--check");
const components = collect();
const convertible = components.filter((c) => !c.legacy);
const problems: string[] = [];
let written = 0;

for (const component of convertible) {
  problems.push(...validate(component));
}

if (problems.length > 0) {
  console.error(`${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

for (const component of convertible) {
  const path = join(COMPONENTS, component.dir, "index.ts");
  const next = generate(component);
  // Generated output does not belong in the source tree. A .gitignore beside it
  // keeps that true without a central list to maintain as components convert.
  writeFileSync(join(COMPONENTS, component.dir, ".gitignore"), "index.ts\n");

  const current = (() => {
    try {
      return read(path);
    } catch {
      return null;
    }
  })();

  if (current === next) continue;
  if (check) {
    console.error(`${component.dir}/index.ts is out of date`);
    process.exitCode = 1;
    continue;
  }
  writeFileSync(path, next);
  written += 1;
}

const skipped = components.length - convertible.length;
console.log(
  check
    ? `checked ${convertible.length} generated index files`
    : `generated ${written} index file(s); ${skipped} component(s) still have a hand-written .tsx`,
);
