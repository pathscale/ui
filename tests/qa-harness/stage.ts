/*
 * Stage one component's page as a dist `blitz-preview` can be pointed at.
 *
 * The build emits 71 pages side by side (`button.html` beside `button.js`), but
 * `blitz-preview` reads `index.html` and inlines the first `src=` and `href=`
 * it finds. So a run needs one component's page presented as if it were the
 * whole application, which is exactly the isolation the checks assume.
 *
 * Run: bun run tests/qa-harness/stage.ts <component-id> [destination]
 * Then: BLITZ_PREVIEW_DIST=<destination> agencyzero-blitz-preview --blitz-control
 */
import { COMPONENTS } from "./components";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const id = process.argv[2];
const destination = process.argv[3] ?? join("/tmp", `qa-${id}`);

const spec = COMPONENTS.find((entry) => entry.id === id);
if (!spec) {
  console.error(
    `no component "${id}". Known ids: ${COMPONENTS.map((entry) => entry.id).join(", ")}`,
  );
  process.exit(1);
}

const built = join(import.meta.dir, "dist");
mkdirSync(join(destination, "static", "js"), { recursive: true });
mkdirSync(join(destination, "static", "css"), { recursive: true });

// The page becomes index.html, because that is the only name the preview looks
// for. Its asset references already point at this component's own files.
copyFileSync(join(built, `${id}.html`), join(destination, "index.html"));
copyFileSync(
  join(built, "static", "js", `${id}.js`),
  join(destination, "static", "js", `${id}.js`),
);

try {
  copyFileSync(
    join(built, "static", "css", `${id}.css`),
    join(destination, "static", "css", `${id}.css`),
  );
} catch {
  /*
   * A page with no CSS of its own is not an error: the preview only inlines a
   * stylesheet when index.html references one. Write an empty file so the
   * reference, if present, still resolves rather than failing the whole load.
   */
  const html = readFileSync(join(destination, "index.html"), "utf8");
  const href = /href="([^"]+\.css)"/.exec(html)?.[1];
  if (href) {
    writeFileSync(join(destination, href.replace(/^\//, "")), "");
  }
}

console.log(`${spec.component} staged at ${destination}`);
