import { Glob } from "bun";
import { copyFile, cp, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { breakpoints } from "../src/components/types";

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
  // Responsive prefixes are composed at runtime, so Tailwind cannot discover
  // them in the compiled JS. Keep a scanner input in the published package,
  // derived from the same maps and breakpoints the components actually use.
  const responsiveClasses = new Set<string>();
  for (const component of ["grid/Grid", "flex/Flex"]) {
    const { CLASSES } = await import(join(components, `${component}.classes.ts`));
    for (const [prop, values] of Object.entries(CLASSES)) {
      if (prop === "base") continue;
      for (const value of Object.values(values as Record<string, string>)) {
        for (const breakpoint of breakpoints) {
          responsiveClasses.add(breakpoint === "base" ? value : `${breakpoint}:${value}`);
        }
      }
    }
  }
  await writeFile("dist/responsive-classes.txt", [...responsiveClasses].sort().join("\n") + "\n");
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
