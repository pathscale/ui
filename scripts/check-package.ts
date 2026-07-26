/**
 * Pre-publish gate: verify the package we are about to ship is internally consistent.
 *
 * Packs the tarball and checks it against the two things that have actually broken here:
 *
 *   1. Every subpath in `exports` resolves to a file that is really in the tarball.
 *      (`./stores` was declared for months while `dist/stores/` was never shipped.)
 *   2. Every `@pathscale/ui/...` import in the README resolves.
 *      (The README told people to import a compat stylesheet that does not exist.)
 *
 * Run: bun run check:package
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";

type Failure = { rule: string; detail: string };
const failures: Failure[] = [];

// ---------------------------------------------------------------- pack

const packLine = execSync("npm pack --json --silent", { encoding: "utf8" });
const tarball: string = JSON.parse(packLine)[0].filename;

// Paths inside the tarball are prefixed with `package/`.
const entries = new Set(
  execSync(`tar tzf ${tarball}`, { encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .map((l) => l.replace(/^package\//, "").replace(/\/$/, "")),
);

const shipped = (rel: string) => entries.has(rel.replace(/^\.\//, ""));

/**
 * A wildcard target is satisfied if anything in the tarball matches its shape.
 * Note `*` in an `exports` target matches across path segments — it is not a
 * single-segment glob — so it maps to `.+`, not `[^/]+`.
 */
const shippedGlob = (pattern: string) => {
  const rel = pattern.replace(/^\.\//, "");
  const rx = new RegExp(
    `^${rel.split("*").map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".+")}$`,
  );
  for (const e of entries) if (rx.test(e)) return true;
  return false;
};

// ------------------------------------------------------- exports resolve

const pkg = JSON.parse(readFileSync("package.json", "utf8"));

const targetsOf = (value: unknown): string[] => {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object")
    return Object.values(value as Record<string, unknown>).flatMap(targetsOf);
  return [];
};

for (const [subpath, value] of Object.entries(pkg.exports ?? {})) {
  const missing = targetsOf(value).filter(
    (target) => !(target.includes("*") ? shippedGlob(target) : shipped(target)),
  );
  if (missing.length > 0) {
    failures.push({
      rule: "exports entry does not resolve",
      detail: `"${subpath}" is declared in package.json but ${missing.join(", ")} ${
        missing.length > 1 ? "are" : "is"
      } not in the tarball`,
    });
  }
}

// -------------------------------------------------- README imports resolve

if (existsSync("README.md")) {
  const readme = readFileSync("README.md", "utf8");
  const specifiers = new Set(
    [...readme.matchAll(/["'`](@pathscale\/ui(?:\/[^"'`\s]+)?)["'`]/g)].map((m) => m[1]),
  );

  for (const spec of specifiers) {
    const subpath = spec === pkg.name ? "." : `./${spec.slice(pkg.name.length + 1)}`;

    // Find the exports key that would match, honouring a single wildcard segment.
    const key = Object.keys(pkg.exports ?? {}).find((k) => {
      if (k === subpath) return true;
      if (!k.includes("*")) return false;
      const [head, tail] = k.split("*");
      return subpath.startsWith(head) && subpath.endsWith(tail);
    });

    if (!key) {
      failures.push({
        rule: "README imports an unexported subpath",
        detail: `${spec} is not covered by any "exports" key`,
      });
      continue;
    }

    // Resolve the concrete target and confirm the file ships.
    const wildcard = key.includes("*")
      ? subpath.slice(key.split("*")[0].length, subpath.length - key.split("*")[1].length)
      : null;

    const resolved = targetsOf(pkg.exports[key]).map((t) =>
      wildcard ? t.replace("*", wildcard) : t,
    );

    if (resolved.length && !resolved.some(shipped)) {
      failures.push({
        rule: "README imports a file that is not shipped",
        detail: `${spec} -> ${resolved.join(", ")} missing from the tarball`,
      });
    }
  }
}

// ---------------------------------------------------------------- report

rmSync(tarball, { force: true });

if (failures.length > 0) {
  console.error(`\n✖ package check failed — ${failures.length} problem(s)\n`);
  for (const f of failures) console.error(`  ${f.rule}\n    ${f.detail}\n`);
  console.error("These would ship to npm and cannot be unpublished. Fix before releasing.\n");
  process.exit(1);
}

console.log(`✔ package check passed — ${entries.size} files, all exports and README imports resolve`);
