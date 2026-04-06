#!/usr/bin/env bun
/**
 * Split daisy-primitives.css into per-component CSS files.
 *
 * Parses the single monolithic file, identifies component boundaries by class
 * prefix, and emits one file per component inside components/.  Each file is
 * wrapped in `@layer components { … }`.  An index.css that @imports everything
 * is generated, and daisy-primitives.css is rewritten to just import it.
 */

import postcss, { type Root, type ChildNode, type AtRule, type Rule, type Declaration, type Comment } from "postcss";
import selectorParser from "postcss-selector-parser";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SRC = join(import.meta.dir, "../src/styles/compat/daisy-primitives.css");
const OUT_DIR = join(import.meta.dir, "../src/styles/compat/components");

// Class-prefix → filename overrides (when automatic kebab-case isn't right)
const PREFIX_TO_FILE: Record<string, string> = {};

// Prefixes that should be merged into a parent component file
const PREFIX_ALIASES: Record<string, string> = {
  "tabs": "tab",
  "steps": "step",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract the primary class prefix from a selector string. */
function extractPrefix(selector: string): string | null {
  let found: string | null = null;

  selectorParser((selectors) => {
    selectors.walk((node) => {
      if (found) return;
      if (node.type === "class") {
        // e.g. "btn-primary" → "btn", "modal" → "modal"
        const raw = node.value; // e.g. "btn-primary"
        const dash = raw.indexOf("-");
        found = dash > 0 ? raw.slice(0, dash) : raw;
      }
    });
  }).astSync(selector);

  return found;
}

/** Given a postcss node, collect all primary prefixes it references. */
function prefixesForNode(node: ChildNode): Set<string> {
  const prefixes = new Set<string>();

  if (node.type === "rule") {
    const rule = node as Rule;
    for (const sel of rule.selectors) {
      const p = extractPrefix(sel);
      if (p) prefixes.add(p);
    }
  } else if (node.type === "atrule") {
    const at = node as AtRule;
    // Walk children for nested rules
    at.walk((child) => {
      if (child.type === "rule") {
        for (const sel of (child as Rule).selectors) {
          const p = extractPrefix(sel);
          if (p) prefixes.add(p);
        }
      }
    });
  }

  return prefixes;
}

/** Resolve aliases and return canonical component name. */
function canonicalize(prefix: string): string {
  return PREFIX_ALIASES[prefix] ?? prefix;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const css = readFileSync(SRC, "utf8");
const root = postcss.parse(css, { from: SRC });

// The whole file is wrapped in `@layer components { … }` — unwrap it.
let layerNode: AtRule | null = null;
for (const child of root.nodes) {
  if (child.type === "atrule" && (child as AtRule).name === "layer") {
    layerNode = child as AtRule;
    break;
  }
}

if (!layerNode) {
  console.error("Expected the file to be wrapped in @layer components { … }");
  process.exit(1);
}

// Bucket: component name → array of CSS nodes (stringified)
const buckets = new Map<string, string[]>();

function addToBucket(name: string, css: string) {
  const canon = canonicalize(name);
  if (!buckets.has(canon)) buckets.set(canon, []);
  buckets.get(canon)!.push(css);
}

// Miscellaneous bucket for things we can't classify
const MISC = "_misc";

for (const node of layerNode.nodes) {
  if (node.type === "comment" || node.type === "decl") {
    // Top-level comments / declarations go to misc
    addToBucket(MISC, node.toString());
    continue;
  }

  const prefixes = prefixesForNode(node);

  if (prefixes.size === 0) {
    addToBucket(MISC, node.toString());
    continue;
  }

  // If all prefixes canonicalize to the same component, file it there.
  const canonicals = new Set([...prefixes].map(canonicalize));

  if (canonicals.size === 1) {
    addToBucket([...canonicals][0], node.toString());
  } else {
    // Compound rule referencing multiple components — pick the first class prefix
    // from the first selector (the "primary" component).
    const first = [...prefixes][0];
    addToBucket(first, node.toString());
  }
}

// ---------------------------------------------------------------------------
// Write output
// ---------------------------------------------------------------------------

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

const fileNames: string[] = [];

for (const [component, chunks] of [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const fileName = PREFIX_TO_FILE[component] ?? `${component}.css`;
  fileNames.push(fileName);

  const body = chunks.join("\n\n");
  // Indent the body by 2 spaces inside the @layer block
  const indented = body
    .split("\n")
    .map((line) => (line.trim() === "" ? "" : `  ${line}`))
    .join("\n");

  const content = `@layer components {\n${indented}\n}\n`;
  const outPath = join(OUT_DIR, fileName);
  writeFileSync(outPath, content, "utf8");
  console.log(`  wrote ${fileName} (${chunks.length} rules)`);
}

// index.css
const imports = fileNames.map((f) => `@import "./${f}";`).join("\n");
const indexPath = join(OUT_DIR, "index.css");
writeFileSync(indexPath, imports + "\n", "utf8");
console.log(`  wrote index.css (${fileNames.length} imports)`);

// Rewrite daisy-primitives.css for backward compat
writeFileSync(SRC, `@import "./components/index.css";\n`, "utf8");
console.log(`  rewrote daisy-primitives.css → @import "./components/index.css"`);

console.log("\nDone.");
