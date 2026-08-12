/**
 * Derive each component's public API from how consumers actually call it.
 *
 * A recipe describes presentation, not the API. It says a component has an
 * `animation` axis; it does not say that callers pass `animationType`, or
 * `dataTheme`, or an `onSelect` the recipe knows nothing about. Wiring a
 * component from its recipe alone therefore silently drops props, which is
 * exactly how the first blanket attempt broke ten components at once.
 *
 * So: read the consumers. Every `<Component prop={...}>` in a real application
 * is a fact about the API that has to survive the port. This script collects
 * those facts and sets them beside what the recipe declares, which turns
 * "what is this component's API?" from a judgement call into a diff.
 *
 * Usage:
 *   bun run scripts/derive-api.ts [--json] [root ...]
 *
 * Defaults to the two consumers we have: js.software (breadth, every component
 * has a showcase) and chuzz (depth, a real application rather than a demo).
 * Where they disagree, chuzz wins: its usage is load-bearing.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import ts from "typescript";

const UI_PACKAGE = "@pathscale/ui";

const DEFAULT_ROOTS = [
  "../js.software/src",
  "../chuzz/apps/chuzz/frontend/src",
];

/** Props every component takes because the runtime gives them away for free. */
const ESCAPE_HATCHES = new Set(["class", "className", "style", "children"]);

/**
 * Attributes that need no decision: they are plain HTML, so the fourth prop
 * bucket carries them to the element untouched. Listing them keeps the report
 * to the props that actually need a human to choose a destination.
 */
const PLAIN_HTML = new Set([
  "id",
  "title",
  "role",
  "tabIndex",
  "lang",
  "dir",
  "hidden",
  "slot",
  "href",
  "target",
  "rel",
  "download",
  "src",
  "alt",
  "srcset",
  "sizes",
  "loading",
  "decoding",
  "width",
  "height",
  "type",
  "name",
  "value",
  "placeholder",
  "checked",
  "selected",
  "multiple",
  "readOnly",
  "required",
  "min",
  "max",
  "step",
  "pattern",
  "autocomplete",
  "autofocus",
  "form",
  "action",
  "method",
  "rows",
  "cols",
  "colSpan",
  "rowSpan",
  "scope",
  "for",
  "list",
  "accept",
  "capture",
  "controls",
  "autoplay",
  "loop",
  "muted",
  "poster",
  "preload",
  "open",
  "draggable",
  "spellcheck",
  "inputmode",
  "enterkeyhint",
  "maxlength",
  "minlength",
  "wrap",
]);

function isPlainHtml(name: string): boolean {
  return (
    PLAIN_HTML.has(name) ||
    name.startsWith("on") ||
    name.startsWith("aria-") ||
    name.startsWith("data-")
  );
}

type Usage = {
  /** How many call sites pass this prop. */
  count: number;
  /** Distinct literal values, capped — enough to infer an axis, not a corpus. */
  values: Set<string>;
  /** True when at least one call site passes an expression rather than a literal. */
  dynamic: boolean;
  /** Which consumer roots this prop was seen in. */
  roots: Set<string>;
};

type ComponentUsage = Map<string, Usage>;

function collectFiles(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) collectFiles(path, out);
    else if (path.endsWith(".tsx")) out.push(path);
  }
  return out;
}

/**
 * The identifiers a file binds to UI components, mapped back to the exported
 * name. Aliased imports (`import { Button as Btn }`) are why this is a map and
 * not a set: the JSX says `Btn`, the API belongs to `Button`.
 */
function uiImports(source: ts.SourceFile): Map<string, string> {
  const bound = new Map<string, string>();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const from = statement.moduleSpecifier;
    if (!ts.isStringLiteral(from) || !from.text.startsWith(UI_PACKAGE))
      continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      bound.set(element.name.text, (element.propertyName ?? element.name).text);
    }
  }
  return bound;
}

/** `Accordion.Item` → `Accordion.Item`; anything stranger is skipped. */
function tagName(node: ts.JsxOpeningLikeElement): string | null {
  const tag = node.tagName;
  if (ts.isIdentifier(tag)) return tag.text;
  if (ts.isPropertyAccessExpression(tag) && ts.isIdentifier(tag.expression)) {
    return `${tag.expression.text}.${tag.name.text}`;
  }
  return null;
}

/** A short, readable stand-in for the value a call site passed. */
function describeValue(initializer: ts.JsxAttribute["initializer"]): {
  value: string;
  dynamic: boolean;
} {
  if (!initializer) return { value: "true", dynamic: false };
  if (ts.isStringLiteral(initializer)) {
    return { value: JSON.stringify(initializer.text), dynamic: false };
  }
  if (ts.isJsxExpression(initializer) && initializer.expression) {
    const expression = initializer.expression;
    if (ts.isStringLiteral(expression)) {
      return { value: JSON.stringify(expression.text), dynamic: false };
    }
    if (expression.kind === ts.SyntaxKind.TrueKeyword) {
      return { value: "true", dynamic: false };
    }
    if (expression.kind === ts.SyntaxKind.FalseKeyword) {
      return { value: "false", dynamic: false };
    }
    if (ts.isNumericLiteral(expression)) {
      return { value: expression.text, dynamic: false };
    }
  }
  return { value: "<expr>", dynamic: true };
}

function scan(roots: string[]): Map<string, ComponentUsage> {
  const usage = new Map<string, ComponentUsage>();

  for (const root of roots) {
    const absolute = resolve(root);
    for (const file of collectFiles(absolute)) {
      const text = readFileSync(file, "utf8");
      const source = ts.createSourceFile(
        file,
        text,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      const bound = uiImports(source);
      if (bound.size === 0) continue;

      const visit = (node: ts.Node): void => {
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
          const tag = tagName(node);
          const owner = tag?.split(".")[0];
          const exported = owner ? bound.get(owner) : undefined;
          if (tag && exported) {
            // Report under the exported name, so an alias in one file and the
            // real name in another land in the same bucket.
            const name = tag.includes(".")
              ? `${exported}.${tag.split(".").slice(1).join(".")}`
              : exported;
            let component = usage.get(name);
            if (!component) {
              component = new Map();
              usage.set(name, component);
            }
            for (const attribute of node.attributes.properties) {
              if (!ts.isJsxAttribute(attribute)) continue;
              const propName = attribute.name.getText(source);
              let entry = component.get(propName);
              if (!entry) {
                entry = {
                  count: 0,
                  values: new Set(),
                  dynamic: false,
                  roots: new Set(),
                };
                component.set(propName, entry);
              }
              const { value, dynamic } = describeValue(attribute.initializer);
              entry.count += 1;
              entry.roots.add(root);
              if (dynamic) entry.dynamic = true;
              else if (entry.values.size < 12) entry.values.add(value);
            }
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
  }

  return usage;
}

/**
 * The props a component takes *today*, read from its own source.
 *
 * This is the arbiter. Consumer usage is evidence of what callers rely on, but
 * it can be stale — js.software is pinned to an older release, so it still
 * passes `color` to a Button whose prop has since been renamed `variant`.
 * Taking usage as gospel would resurrect a dead API; taking the recipe as
 * gospel would drop a live one. The component's own prop list settles it.
 */
function readComponentApi(): Map<string, Set<string>> {
  const api = new Map<string, Set<string>>();
  const componentsDir = resolve("src/components");

  for (const dir of readdirSync(componentsDir)) {
    const full = join(componentsDir, dir);
    if (!statSync(full).isDirectory()) continue;
    for (const file of readdirSync(full)) {
      if (!file.endsWith(".tsx") || file.endsWith(".layout.tsx")) continue;
      const name = file.slice(0, -".tsx".length);
      const text = readFileSync(join(full, file), "utf8");
      const source = ts.createSourceFile(
        file,
        text,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      const props = api.get(name) ?? new Set<string>();

      const visit = (node: ts.Node): void => {
        // `splitProps(props, ["a", "b"])` — the names the component handles
        // itself rather than forwarding.
        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === "splitProps"
        ) {
          for (const argument of node.arguments) {
            if (!ts.isArrayLiteralExpression(argument)) continue;
            for (const element of argument.elements) {
              if (ts.isStringLiteral(element)) props.add(element.text);
            }
          }
        }
        // `type XProps = ... & { foo?: Bar }` — the declared surface.
        //
        // Scoped to declarations whose name ends in `Props`, because a
        // component file is full of other type literals: the object type of a
        // compound export (`Modal.Root`), a context shape (`registerTab`), an
        // internal row type. Collecting those made almost every component look
        // as though it had behaviour to preserve.
        if (
          (ts.isTypeAliasDeclaration(node) ||
            ts.isInterfaceDeclaration(node)) &&
          node.name.text.endsWith("Props")
        ) {
          const lists: ts.NodeArray<ts.TypeElement>[] = [];
          if (ts.isInterfaceDeclaration(node)) lists.push(node.members);
          else {
            const collect = (inner: ts.Node): void => {
              if (ts.isTypeLiteralNode(inner)) lists.push(inner.members);
              ts.forEachChild(inner, collect);
            };
            collect(node.type);
          }
          for (const list of lists) {
            for (const member of list) {
              if (ts.isPropertySignature(member) && member.name) {
                props.add(
                  member.name.getText(source).replace(/^["']|["']$/g, ""),
                );
              }
            }
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(source);

      if (props.size > 0) api.set(name, props);
    }
  }
  return api;
}

/** What a recipe declares, read as source rather than imported. */
type Declared = {
  props: Set<string>;
  state: Set<string>;
  slots: Set<string>;
};

function readRecipes(): Map<string, Declared> {
  const declared = new Map<string, Declared>();
  const componentsDir = resolve("src/components");
  for (const dir of readdirSync(componentsDir)) {
    const full = join(componentsDir, dir);
    if (!statSync(full).isDirectory()) continue;
    for (const file of readdirSync(full)) {
      if (!file.endsWith(".recipe.ts")) continue;
      const name = file.slice(0, -".recipe.ts".length);
      const text = readFileSync(join(full, file), "utf8");
      declared.set(name, {
        props: keysOfBlock(text, "props"),
        state: keysOfBlock(text, "state"),
        slots: keysOfBlock(text, "slots"),
      });
    }
  }
  return declared;
}

/**
 * The top-level keys of one `label: { ... }` block, found by brace counting.
 * A parser would be sturdier, but recipes are generated and uniform, and this
 * keeps the script to one dependency.
 */
function keysOfBlock(text: string, label: string): Set<string> {
  const keys = new Set<string>();
  const start = text.indexOf(`\n  ${label}: {`);
  if (start === -1) return keys;
  let depth = 0;
  let index = text.indexOf("{", start);
  const open = index;
  for (; index < text.length; index += 1) {
    const char = text[index];
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  const body = text.slice(open + 1, index);
  let nested = 0;
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (nested === 0) {
      const match = trimmed.match(/^"?([A-Za-z_][\w-]*)"?\s*:/);
      if (match) keys.add(match[1]);
    }
    nested += (line.match(/\{/g) ?? []).length;
    nested -= (line.match(/\}/g) ?? []).length;
  }
  return keys;
}

/**
 * Which components are actually switched over.
 *
 * Read from the source rather than kept in a list, because a hand-maintained
 * list of "what is ported" is wrong the first time someone ports something and
 * forgets to edit it. A component is wired when its own `.tsx` calls
 * `defineComponent`, and has lost its class map when `.classes.ts` is gone.
 */
function readPortState(): Map<string, { wired: boolean; classMap: boolean }> {
  const state = new Map<string, { wired: boolean; classMap: boolean }>();
  const componentsDir = resolve("src/components");

  for (const dir of readdirSync(componentsDir)) {
    const full = join(componentsDir, dir);
    if (!statSync(full).isDirectory()) continue;
    const files = readdirSync(full);
    for (const file of files) {
      if (!file.endsWith(".recipe.ts")) continue;
      const name = file.slice(0, -".recipe.ts".length);
      const own = files.find((f) => f === `${name}.tsx`);
      const wired = own
        ? readFileSync(join(full, own), "utf8").includes("defineComponent")
        : false;
      state.set(name, {
        wired,
        classMap: files.includes(`${name}.classes.ts`),
      });
    }
  }
  return state;
}

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const asStatus = args.includes("--status");
const roots = args.filter((arg) => !arg.startsWith("--"));
const usage = scan(roots.length > 0 ? roots : DEFAULT_ROOTS);
const declared = readRecipes();
const current = readComponentApi();

type Report = {
  component: string;
  callSites: number;
  presentation: string[];
  /** Plain HTML, carried by the fourth bucket. No decision needed. */
  html: string[];
  /** Neither presentation nor HTML: each one needs a destination chosen. */
  undecided: { name: string; count: number; values: string[]; live: boolean }[];
  /**
   * Props the component declares that no consumer happens to pass, and that
   * neither the recipe nor the HTML bucket covers. A port driven by usage
   * alone would drop these silently: nothing in the corpus fails, and the prop
   * stops working for whoever does use it.
   */
  behaviour: string[];
  unusedAxes: string[];
  hasRecipe: boolean;
};

const report: Report[] = [];

for (const [component, props] of [...usage].sort()) {
  const base = component.split(".")[0];
  const recipe = declared.get(base);
  const presentation: string[] = [];
  const html: string[] = [];
  const undecided: Report["undecided"] = [];
  let callSites = 0;

  for (const [name, entry] of props) {
    callSites = Math.max(callSites, entry.count);
    if (ESCAPE_HATCHES.has(name)) continue;
    if (recipe?.props.has(name) || recipe?.state.has(name)) {
      presentation.push(name);
    } else if (isPlainHtml(name)) {
      html.push(name);
    } else {
      undecided.push({
        name,
        count: entry.count,
        values: [...entry.values].sort(),
        live: Boolean(current.get(base)?.has(name)),
      });
    }
  }

  undecided.sort((a, b) => b.count - a.count);

  const behaviour = [...(current.get(base) ?? [])]
    .filter(
      (name) =>
        !ESCAPE_HATCHES.has(name) &&
        !isPlainHtml(name) &&
        !recipe?.props.has(name) &&
        !recipe?.state.has(name) &&
        !props.has(name),
    )
    .sort();

  report.push({
    component,
    callSites,
    presentation: presentation.sort(),
    html: html.sort(),
    undecided,
    behaviour: component.includes(".") ? [] : behaviour,
    // Only the root reports unused axes. A sub-component shares its parent's
    // recipe, so repeating them there says the same thing once per slot.
    unusedAxes:
      recipe && !component.includes(".")
        ? [...recipe.props].filter((axis) => !props.has(axis)).sort()
        : [],
    hasRecipe: Boolean(recipe),
  });
}

if (asStatus) {
  const state = readPortState();
  const byComponent = new Map(report.map((entry) => [entry.component, entry]));
  const rows = [...state].sort(([a], [b]) => a.localeCompare(b));

  /**
   * The props a port has to preserve, computed for every component rather than
   * only the ones a consumer happens to render.
   *
   * Deriving this from the usage report alone made ComboBox, Popover and Slider
   * look finished: nothing exercises them, so nothing was measured, so nothing
   * was owed. The component's own declared props are the contract whether or
   * not anyone in the corpus calls it.
   */
  const owed = (name: string): string[] => {
    const recipe = declared.get(name);
    const seen = byComponent.get(name);
    return [...(current.get(name) ?? [])]
      .filter(
        (prop) =>
          prop !== "dataTheme" &&
          !ESCAPE_HATCHES.has(prop) &&
          !isPlainHtml(prop) &&
          !recipe?.props.has(prop) &&
          !recipe?.state.has(prop),
      )
      .concat(
        (seen?.undecided ?? [])
          .filter((prop) => prop.live)
          .map((prop) => prop.name),
      )
      .filter((prop, index, all) => all.indexOf(prop) === index)
      .sort();
  };

  /** Whether any consumer renders it, and so whether a port can be verified. */
  const covered = (name: string): boolean =>
    [...byComponent.keys()].some(
      (used) => used === name || used.startsWith(`${name}.`),
    );

  const done = rows.filter(([, s]) => s.wired);
  const lines = [
    "# Port status",
    "",
    "Generated by `bun run scripts/derive-api.ts --status`. Do not edit by hand —",
    "it is read from the source, so it cannot drift from what is actually wired.",
    "",
    `**${done.length} of ${rows.length} components wired.**`,
    "",
    "`props to keep` is what the component's own type declares that neither the",
    "recipe nor the plain-HTML bucket covers: the contract a port has to preserve.",
    "`dataTheme` is excluded — the runtime handles it for every component.",
    "",
    "`shown` is whether js.software or chuzz renders it. A port of something with",
    "no consumer cannot be verified in a browser, only typechecked, so those are",
    "the ones to be careful with rather than the ones to do first.",
    "",
    `${rows.filter(([name]) => !covered(name)).length} of them have no consumer.`,
    "",
    "| component | wired | class map gone | shown | props to keep |",
    "| --- | --- | --- | --- | --- |",
  ];

  for (const [name, s] of rows) {
    const keep = owed(name);
    lines.push(
      `| ${name} | ${s.wired ? "yes" : "—"} | ${s.classMap ? "—" : "yes"} | ` +
        `${covered(name) ? "yes" : "—"} | ` +
        `${keep.length > 0 ? keep.join(", ") : "—"} |`,
    );
  }

  console.log(lines.join("\n"));
} else if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const live = report.reduce(
    (n, e) => n + e.undecided.filter((p) => p.live).length,
    0,
  );
  const stale = report.reduce(
    (n, e) => n + e.undecided.filter((p) => !p.live).length,
    0,
  );
  console.log(
    `${report.length} components used across the consumers\n` +
      `${live} live props to preserve, ${stale} stale call sites\n\n` +
      `  →  the component still declares it: the port must keep it\n` +
      `  ×  the component no longer declares it: the caller is out of date\n`,
  );
  for (const entry of report) {
    // A component whose every prop is presentation or plain HTML needs no
    // decisions, so printing it would only bury the ones that do.
    if (entry.undecided.length === 0 && entry.hasRecipe) continue;
    const missing = entry.hasRecipe ? "" : "  (no recipe)";
    console.log(`${entry.component}${missing}`);
    if (entry.presentation.length > 0) {
      console.log(`  presentation: ${entry.presentation.join(", ")}`);
    }
    if (entry.html.length > 0) {
      console.log(`  plain html:   ${entry.html.join(", ")}`);
    }
    if (entry.unusedAxes.length > 0) {
      console.log(`  axes unused:  ${entry.unusedAxes.join(", ")}`);
    }
    for (const prop of entry.undecided) {
      const values =
        prop.values.length > 0 ? `  ${prop.values.slice(0, 6).join(" ")}` : "";
      console.log(
        `  ${prop.live ? "→" : "×"} ${prop.name} (${prop.count})${values}`,
      );
    }
    console.log();
  }
}
