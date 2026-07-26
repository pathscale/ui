/**
 * Consumer smoke test: install the packed tarball into a throwaway app configured
 * the way real consumers are, then typecheck and load it.
 *
 * This replaces @arethetypeswrong/cli, which modelled four TypeScript resolution
 * modes — three of which nothing here ships to — and produced 378 findings with
 * none actionable. This tests the one configuration that matters instead.
 *
 * What it proves:
 *   - the published tarball installs
 *   - types resolve under `moduleResolution: "bundler"`, which is what our apps use
 *   - declared exports actually exist and are importable at runtime
 *   - subpath exports resolve (this is how a stale `./stores` would be caught)
 *
 * What it does not prove: that components render. That needs the Solid JSX
 * pipeline, and a flaky gate is worse than a narrow one.
 *
 * Run: bun run smoke
 *      SMOKE_TARBALL=/path/to/pkg.tgz bun run smoke   # test a specific tarball
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = process.cwd();
const pkgJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

const run = (cmd: string, cwd: string) =>
  execSync(cmd, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

// ------------------------------------------------------------------ tarball

const tarballPath = (): string => {
  const override = process.env.SMOKE_TARBALL;
  if (override) {
    const p = resolve(override);
    if (!existsSync(p)) throw new Error(`SMOKE_TARBALL not found: ${p}`);
    return p;
  }
  const expected = `${String(pkgJson.name).replace(/^@/, "").replace(/\//g, "-")}-${pkgJson.version}.tgz`;
  const stdout = execSync("npm pack --silent", { cwd: root, encoding: "utf8" });
  if (existsSync(join(root, expected))) return join(root, expected);
  const printed = stdout
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.endsWith(".tgz"))
    .pop();
  if (printed && existsSync(join(root, printed))) return join(root, printed);
  throw new Error(`npm pack produced no tarball (expected ${expected})`);
};

const tarball = tarballPath();
const packedHere = !process.env.SMOKE_TARBALL;

// ------------------------------------------------------------------ fixture

const fixture = mkdtempSync(join(tmpdir(), "ui-smoke-"));
mkdirSync(join(fixture, "src"), { recursive: true });

// Peer deps a consumer must install, minus the optional ones. Derived from the
// manifest so this cannot drift from what we declare.
const optional = new Set(Object.keys(pkgJson.peerDependenciesMeta ?? {}));
const peers = Object.fromEntries(
  Object.entries(pkgJson.peerDependencies ?? {}).filter(([name]) => !optional.has(name)),
);

writeFileSync(
  join(fixture, "package.json"),
  JSON.stringify(
    {
      name: "ui-consumer-smoke",
      private: true,
      type: "module",
      dependencies: { ...peers, [pkgJson.name]: `file:${tarball}` },
      devDependencies: { typescript: pkgJson.devDependencies?.typescript ?? "^5" },
    },
    null,
    2,
  ),
);

// Mirrors how our apps are configured: bundler resolution, Solid JSX.
writeFileSync(
  join(fixture, "tsconfig.json"),
  JSON.stringify(
    {
      compilerOptions: {
        target: "ESNext",
        module: "ESNext",
        moduleResolution: "bundler",
        jsx: "preserve",
        jsxImportSource: "solid-js",
        strict: true,
        noEmit: true,
        // true, matching every consumer app in this org. With false, the CSS
        // side-effect imports inside the shipped .d.ts files raise 178 TS2882
        // errors that no real consumer experiences — noise, not signal.
        skipLibCheck: true,
        types: [],
      },
      include: ["src"],
    },
    null,
    2,
  ),
);

// A spread wide enough to touch the root barrel, compound components, hooks,
// exported types and a subpath export.
writeFileSync(
  join(fixture, "src/consumer.tsx"),
  `import {
  Button,
  Card,
  Flex,
  Modal,
  Select,
  Table,
  Toast,
  toast,
  createForm,
  useTableModel,
  type ComponentColor,
  type ComponentSize,
} from "${pkgJson.name}";
import { runMotion } from "${pkgJson.name}/motion";

const color: ComponentColor = "primary";
const size: ComponentSize = "md";

export const App = () => (
  <Flex direction="col" gap="sm">
    <Button color={color} size={size} isDisabled={false}>
      Save
    </Button>
    <Card>
      <Card.Body>body</Card.Body>
    </Card>
  </Flex>
);

// Values must exist, not just types.
export const used = [Modal, Select, Table, Toast, toast, createForm, useTableModel, runMotion];
`,
);

// Runtime load: proves the ESM actually resolves and the barrel is populated.
writeFileSync(
  join(fixture, "src/load.mjs"),
  `const mod = await import("${pkgJson.name}");
const expected = ["Button", "Flex", "Card", "Modal", "toast", "createForm", "useTableModel"];
const missing = expected.filter((k) => mod[k] === undefined);
if (missing.length) {
  console.error("missing exports from the root barrel: " + missing.join(", "));
  process.exit(1);
}
const motion = await import("${pkgJson.name}/motion");
if (typeof motion.runMotion !== "function") {
  console.error("./motion did not export runMotion");
  process.exit(1);
}
console.log("runtime load ok — " + Object.keys(mod).length + " root exports");
`,
);

// ------------------------------------------------------------------ execute

let failed = false;
const step = (label: string, fn: () => string) => {
  try {
    const out = fn();
    console.log(`✔ ${label}`);
    const tail = out.trim().split("\n").slice(-1)[0];
    if (tail) console.log(`    ${tail}`);
  } catch (err: unknown) {
    failed = true;
    const e = err as { stdout?: Buffer | string; stderr?: Buffer | string; message?: string };
    console.error(`✖ ${label}`);
    const detail = String(e.stdout ?? "") + String(e.stderr ?? "") || e.message || "";
    console.error(
      detail
        .trim()
        .split("\n")
        .slice(0, 25)
        .map((l) => `    ${l}`)
        .join("\n"),
    );
  }
};

console.log(`consumer smoke test\n  tarball: ${tarball}\n  fixture: ${fixture}\n`);

step("install the tarball into a fresh consumer", () => run("bun install", fixture));
step("typecheck with moduleResolution: bundler", () =>
  run("./node_modules/.bin/tsc --noEmit", fixture),
);
step("import the package at runtime", () => run("bun src/load.mjs", fixture));

// ------------------------------------------------------------------ cleanup

rmSync(fixture, { recursive: true, force: true });
if (packedHere) rmSync(tarball, { force: true });

if (failed) {
  console.error("\n✖ consumer smoke test failed — a real app would hit this\n");
  process.exit(1);
}
console.log("\n✔ consumer smoke test passed");
