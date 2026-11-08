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
 *      PACKAGE_TARBALL=/path/to/pkg.tgz bun run check:package
 */
import { execFileSync, execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";

type Failure = { rule: string; detail: string };
const failures: Failure[] = [];

// ---------------------------------------------------------------- pack

const pkgJson = JSON.parse(readFileSync("package.json", "utf8"));

const suppliedTarball = process.env.PACKAGE_TARBALL;
const tarball =
  suppliedTarball ?? execSync("bun pm pack --quiet", { encoding: "utf8" }).trim();
if (!tarball || !existsSync(tarball)) throw new Error(`Tarball not found: ${tarball}`);

// Paths inside the tarball are prefixed with `package/`.
const entries = new Set(
  execFileSync("tar", ["tzf", tarball], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .map((l) => l.replace(/^package\//, "").replace(/\/$/, "")),
);

const shipped = (rel: string) => entries.has(rel.replace(/^\.\//, ""));

if (!shipped("dist/responsive-classes.txt")) {
  failures.push({
    rule: "responsive CSS source is missing",
    detail: "dist/responsive-classes.txt must ship so consumer Tailwind builds can discover Grid and Flex breakpoint utilities",
  });
}

/**
 * A wildcard target is satisfied if anything in the tarball matches its shape.
 * Note `*` in an `exports` target matches across path segments — it is not a
 * single-segment glob — so it maps to `.+`, not `[^/]+`.
 */
const targetPattern = (pattern: string, wildcard = ".+") => {
  const rel = pattern.replace(/^\.\//, "");
  const escaped = rel.split("*")
    .map((segment) => segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`^${escaped.join(wildcard)}$`);
};

const shippedGlob = (pattern: string) => {
  const rx = targetPattern(pattern);
  for (const e of entries) if (rx.test(e)) return true;
  return false;
};

// ------------------------------------------------------- exports resolve

const pkg = pkgJson;

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

// Match each shipped JavaScript subpath against its own declaration. Merely
// finding one .d.ts for a wildcard can hide missing declarations elsewhere.
for (const [subpath, value] of Object.entries(pkg.exports ?? {})) {
  if (!subpath.includes("*") || !value || typeof value !== "object") continue;
  const { types, import: runtime } = value as Record<string, unknown>;
  if (
    typeof types !== "string" ||
    typeof runtime !== "string" ||
    !types.includes("*") ||
    runtime.split("*").length !== 2
  ) {
    continue;
  }

  const runtimePattern = targetPattern(runtime, "(.+)");
  for (const entry of entries) {
    const wildcard = runtimePattern.exec(entry)?.[1];
    if (!wildcard) continue;
    const declaration = types.replaceAll("*", () => wildcard);
    if (!shipped(declaration)) {
      failures.push({
        rule: "runtime subpath has no declaration",
        detail: `${subpath.replace("*", () => wildcard)} ships ${entry} but is missing ${declaration}`,
      });
    }
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

    // A specifier containing `*` is prose describing a family of subpaths
    // ("also @pathscale/ui/hooks/*"), not something anyone imports literally.
    // Require that an exports key covers the pattern; do not resolve it to a file.
    if (subpath.includes("*")) {
      if (!Object.keys(pkg.exports ?? {}).includes(subpath)) {
        failures.push({
          rule: "README documents a subpath pattern that is not exported",
          detail: `${spec} has no matching "exports" key`,
        });
      }
      continue;
    }

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

if (suppliedTarball === undefined) rmSync(tarball, { force: true });

if (failures.length > 0) {
  console.error(`\n✖ package check failed — ${failures.length} problem(s)\n`);
  for (const f of failures) console.error(`  ${f.rule}\n    ${f.detail}\n`);
  console.error("These would ship to npm and cannot be unpublished. Fix before releasing.\n");
  process.exit(1);
}

console.log(`✔ package check passed — ${entries.size} files, all exports and README imports resolve`);
