/**
 * Turn `style/useImportType` off in every repository that has a `biome.json`.
 *
 * The rule rewrites a recipe's value import to `import type`, because a
 * `.layout.tsx` only ever mentions the symbol in a type position -
 * `Layout<typeof componentRecipe, Props>`. The generated file beside it passes
 * the same symbol to `defineComponent` as a *value*, and Biome never sees that
 * file, so the "fix" typechecks the source and then fails the declaration build:
 *
 *     error TS1361: 'componentRecipe' cannot be used as a value because it was
 *     imported using 'import type'.
 *
 * Applied ahead of need. Only `UI` and `UI-auth` author layouts today, but
 * solid-layouts is going everywhere, and a repository that adopts it after this
 * rule has already reformatted its imports meets the failure with no idea why.
 * Turning it off first costs nothing in a repository with no layouts.
 *
 * Edits the text rather than round-tripping through `JSON.parse`/`stringify`.
 * Re-serialising reformats the whole file - one repository had its `ignore`
 * array expanded from one line to five - which buries a three-line change in
 * noise and makes every reviewer check whether anything else moved.
 *
 * Run from anywhere:  bun run scripts/disable-use-import-type.ts <root> [--write]
 * Without `--write` it reports what it would change and touches nothing.
 */

import { Glob } from "bun";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.argv[2];
const write = process.argv.includes("--write");

if (!root) {
  console.error("usage: disable-use-import-type.ts <root> [--write]");
  process.exit(2);
}

/** The indent of a line, so an inserted line matches what surrounds it. */
function indentOf(line: string): string {
  return line.slice(0, line.length - line.trimStart().length);
}

let changed = 0;
let already = 0;
let skipped = 0;

for await (const relative of new Glob("*/biome.json").scan({ cwd: root })) {
  const path = join(root, relative);
  const source = await readFile(path, "utf8");

  if (/"useImportType"/.test(source)) {
    already += 1;
    continue;
  }

  const lines = source.split("\n");
  const styleIndex = lines.findIndex((line) => /^\s*"style"\s*:\s*\{\s*$/.test(line));

  let next: string[] | null = null;

  if (styleIndex !== -1) {
    // A `style` block already exists: add one entry at the top of it, and give
    // the line that was first a trailing comma.
    const inner = `${indentOf(lines[styleIndex])}  `;
    const following = lines[styleIndex + 1];
    const needsComma = following !== undefined && !/^\s*\}/.test(following);
    next = [
      ...lines.slice(0, styleIndex + 1),
      `${inner}"useImportType": "off"${needsComma ? "," : ""}`,
      ...lines.slice(styleIndex + 1),
    ];
  } else {
    // No `style` block: open one directly under `"rules": {`, which every one
    // of these configs has.
    const rulesIndex = lines.findIndex((line) => /^\s*"rules"\s*:\s*\{\s*$/.test(line));
    if (rulesIndex === -1) {
      /*
       * A one-line `"rules": { "recommended": true }`, which three of these
       * repositories use. Extend it in place rather than reflowing it: the file
       * is written in that style deliberately, and expanding it here would be
       * the same reformatting noise this script exists to avoid.
       */
      const inlineIndex = lines.findIndex((line) => /"rules"\s*:\s*\{[^}]*\}/.test(line));
      if (inlineIndex === -1) {
        console.warn(`skip  ${relative}: no "rules" block to extend`);
        skipped += 1;
        continue;
      }
      const inline = lines[inlineIndex].replace(
        /("rules"\s*:\s*\{)([^}]*)(\})/,
        (_match, open: string, body: string, close: string) => {
          const trimmed = body.trim();
          const separator = trimmed.length > 0 ? `${body.trimEnd()}, ` : " ";
          return `${open}${separator}"style": { "useImportType": "off" } ${close}`;
        },
      );
      next = [...lines.slice(0, inlineIndex), inline, ...lines.slice(inlineIndex + 1)];
      const updatedInline = next.join("\n");
      try {
        JSON.parse(updatedInline);
      } catch (cause) {
        console.warn(`skip  ${relative}: edit would not parse (${String(cause)})`);
        skipped += 1;
        continue;
      }
      if (write) await writeFile(path, updatedInline);
      console.log(`${write ? "wrote" : "would"} ${relative}`);
      changed += 1;
      continue;
    }
    const inner = `${indentOf(lines[rulesIndex])}  `;
    const following = lines[rulesIndex + 1];
    const needsComma = following !== undefined && !/^\s*\}/.test(following);
    next = [
      ...lines.slice(0, rulesIndex + 1),
      `${inner}"style": {`,
      `${inner}  "useImportType": "off"`,
      `${inner}}${needsComma ? "," : ""}`,
      ...lines.slice(rulesIndex + 1),
    ];
  }

  const updated = next.join("\n");

  // Parse the *result*, not the input: a text edit that produced invalid JSON
  // would otherwise be written and only discovered by whoever runs Biome next.
  try {
    JSON.parse(updated);
  } catch (cause) {
    console.warn(`skip  ${relative}: edit would not parse (${String(cause)})`);
    skipped += 1;
    continue;
  }

  if (write) await writeFile(path, updated);
  console.log(`${write ? "wrote" : "would"} ${relative}`);
  changed += 1;
}

console.log(
  `\n${changed} ${write ? "updated" : "to update"}, ${already} already off, ${skipped} skipped`,
);
