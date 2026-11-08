import type { RsbuildPlugin } from "@rsbuild/core";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve, sep } from "node:path";
import { isolatedDeclarationSync } from "oxc-transform";

function sourceFiles(root: string): string[] {
  return ["**/*.ts", "**/*.tsx"]
    .flatMap((pattern) => [...new Bun.Glob(pattern).scanSync({ cwd: root })])
    .map((file) => file.split(sep).join("/"))
    .filter((file) => !file.endsWith(".layout.tsx"))
    .sort();
}

function collectDeclarations(
  root: string,
  files: readonly string[],
): Map<string, string> {
  const declarations = new Map<string, string>();
  const diagnostics: string[] = [];
  for (const file of files) {
    const source = readFileSync(join(root, file), "utf8");
    const authored = file.endsWith(".d.ts");
    const target = authored ? file : file.replace(/\.tsx?$/, ".d.ts");
    if (declarations.has(target)) {
      throw new Error(`More than one source file emits ${target}`);
    }
    if (authored) {
      declarations.set(target, source);
      continue;
    }

    const { code, errors } = isolatedDeclarationSync(file, source);
    for (const error of errors) diagnostics.push(`${file}: ${error.message}`);
    declarations.set(target, code);
  }

  if (diagnostics.length) throw new Error(diagnostics.join("\n"));
  for (const entry of ["index.d.ts", "lab.d.ts", "passwordRules.d.ts"]) {
    if (!declarations.has(entry)) {
      throw new Error(`Missing entry declaration ${entry}`);
    }
  }
  return declarations;
}

export function pluginUiDeclarations(): RsbuildPlugin {
  const name = "ui:declarations";
  return {
    name,
    setup(api) {
      const root = resolve(api.context.rootPath, "src");
      let building = false;
      api.onBeforeBuild(() => {
        building = true;
      });
      api.modifyRspackConfig((config, { rspack }) => {
        (config.plugins ??= []).push({
          apply(compiler) {
            compiler.hooks.thisCompilation.tap(name, (compilation) => {
              if (!building) return;
              compilation.contextDependencies.add(root);
              compilation.hooks.processAssets.tap(
                {
                  name,
                  stage: rspack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
                },
                () => {
                  try {
                    const files = sourceFiles(root);
                    for (const file of files) {
                      compilation.fileDependencies.add(join(root, file));
                    }
                    const declarations = collectDeclarations(root, files);
                    for (const [file, content] of declarations) {
                      compilation.emitAsset(
                        file,
                        new rspack.sources.RawSource(content),
                      );
                    }
                  } catch (error) {
                    compilation.errors.push(
                      error instanceof Error ? error : new Error(String(error)),
                    );
                  }
                },
              );
            });
          },
        });
      });
    },
  };
}

if (import.meta.main) {
  const output = process.argv[2];
  if (!output || !isAbsolute(output)) {
    throw new Error("Usage: bun run declarations:emit /absolute/output/directory");
  }
  const root = resolve("src");
  const outputRoot = resolve(output);
  if (outputRoot === root || outputRoot.startsWith(root + sep)) {
    throw new Error("Write declarations outside the source tree");
  }
  if (
    existsSync(outputRoot) &&
    !new Bun.Glob("**/*.d.ts").scanSync({ cwd: outputRoot }).next().done
  ) {
    throw new Error("Use an output directory without existing declaration files");
  }
  for (const [file, content] of collectDeclarations(root, sourceFiles(root))) {
    const path = join(outputRoot, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
}
