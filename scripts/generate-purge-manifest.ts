import { Glob } from "bun";
import { copyFile, cp, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";

const source = "src/components";
const temporary = await mkdtemp(join(tmpdir(), "ui-purge-"));
const components = join(temporary, "components");

try {
  await cp(source, components, { recursive: true });
  await cp("src/lib", join(temporary, "lib"), { recursive: true });
  await writeFile(join(temporary, "lib/layouts/index.ts"), 'export { recipe } from "solid-layouts/recipe";\n');
  for await (const relative of new Glob("**/*.recipe.ts").scan({ cwd: components })) {
    await copyFile(join(components, relative), join(dirname(join(components, relative)), `${basename(relative, ".recipe.ts")}.classes.ts`));
  }
  const child = Bun.spawn([
    "bun",
    "run",
    "node_modules/@pathscale/rsbuild-plugin-ui-css-purge/src/generate-manifest.ts",
    components,
    "--out",
    "dist/purge-manifest.json",
  ], { stdout: "inherit", stderr: "inherit" });
  const exitCode = await child.exited;
  if (exitCode !== 0) process.exit(exitCode);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
