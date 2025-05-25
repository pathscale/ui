import { defineConfig } from "tsup";
import type { Options } from "tsup";
import { solidPlugin } from "esbuild-plugin-solid";
import { readdirSync } from "fs";
import { join } from "path";

const isTypeGen = process.env.TSUP_TYPE_GEN === "true";
const typePart = process.env.TSUP_TYPE_PART || "all";

function getAllComponentDirs() {
  try {
    return readdirSync(join(process.cwd(), "src/components"));
  } catch (e) {
    console.error("Error reading components directory:", e);
    return [];
  }
}

function getComponentGroups() {
  const allComponents = getAllComponentDirs();
  const totalComponents = allComponents.length;
  const groupSize = Math.ceil(totalComponents / 3);
  
  return {
    group1: allComponents.slice(0, groupSize),
    group2: allComponents.slice(groupSize, groupSize * 2),
    group3: allComponents.slice(groupSize * 2)
  };
}

const baseConfig: Options = {
  target: "esnext",
  platform: "browser",
  format: ["esm"],
  clean: !isTypeGen,
  minify: false,
  sourcemap: false,
  splitting: true,
  outDir: "dist/",
  treeshake: { preset: "smallest" },
  replaceNodeEnv: true,
  esbuildOptions(options) {
    options.jsx = "preserve";
    options.chunkNames = "chunks/chunk-[hash]";
    options.drop = ["console", "debugger"];
    options.legalComments = "none";
    options.treeShaking = true;
  },
};

const codeConfig: Options = {
  ...baseConfig,
  dts: false,
  entry: [
    "src/index.ts",
    "src/index.css",
    "src/components/*/index.ts",
  ],
  esbuildPlugins: [solidPlugin({ solid: { generate: "dom" } })],
};

function getTypeEntries() {
  if (typePart === "core") {
    return ["src/index.ts"];
  } 
  
  const componentGroups = getComponentGroups();
  
  if (typePart === "group1") {
    return componentGroups.group1.map(dir => `src/components/${dir}/index.ts`);
  } else if (typePart === "group2") {
    return componentGroups.group2.map(dir => `src/components/${dir}/index.ts`);
  } else if (typePart === "group3") {
    return componentGroups.group3.map(dir => `src/components/${dir}/index.ts`);
  }
  
  return ["src/index.ts", "src/components/*/index.ts"];
}

const typesConfig: Options = {
  ...baseConfig,
  dts: {
    only: true,
    resolve: true,
  },
  entry: getTypeEntries(),
};

export default defineConfig(isTypeGen ? typesConfig : codeConfig);
