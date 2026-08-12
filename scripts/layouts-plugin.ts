import type { RsbuildPlugin } from "@rsbuild/core";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execute = promisify(execFile);

export const pluginLayouts = (): RsbuildPlugin => ({
  name: "pathscale:layouts",
  setup(api) {
    const generate = async () => {
      await execute("bun", ["run", "scripts/compile-layouts.ts"], {
        cwd: api.context.rootPath,
      });
    };

    api.onBeforeBuild(generate);
    api.onBeforeDevCompile(generate);
    api.modifyRsbuildConfig((config) => ({
      ...config,
      dev: {
        ...config.dev,
        watchFiles: [
          ...(Array.isArray(config.dev?.watchFiles) ? config.dev.watchFiles : config.dev?.watchFiles ? [config.dev.watchFiles] : []),
          { paths: "src/components/**/*.layout.tsx", type: "reload-server" },
          { paths: "src/components/**/*.recipe.ts", type: "reload-server" },
        ],
      },
    }));
  },
});
