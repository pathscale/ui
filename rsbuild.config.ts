import { defineConfig } from "@rsbuild/core";
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginSolid } from "@rsbuild/plugin-solid";
import { readdirSync } from "fs";
import { join, resolve } from "path";
import CompressionPlugin from "compression-webpack-plugin";

const isTypeGen = process.env.RSBUILD_TYPE_GEN === "true";
const typePart = process.env.RSBUILD_TYPE_PART || "all";

function getAllComponentDirs() {
  try {
    return readdirSync(join(process.cwd(), "src/components"), { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
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

function generateEntries() {
  if (isTypeGen) {
    if (typePart === "core") {
      return { index: "./src/index.ts" };
    }
    
    const componentGroups = getComponentGroups();
    const entries: Record<string, string> = {};
    
    if (typePart === "group1") {
      componentGroups.group1.forEach(dir => {
        entries[`components/${dir}/index`] = `./src/components/${dir}/index.ts`;
      });
    } else if (typePart === "group2") {
      componentGroups.group2.forEach(dir => {
        entries[`components/${dir}/index`] = `./src/components/${dir}/index.ts`;
      });
    } else if (typePart === "group3") {
      componentGroups.group3.forEach(dir => {
        entries[`components/${dir}/index`] = `./src/components/${dir}/index.ts`;
      });
    } else {
      entries.index = "./src/index.ts";
      getAllComponentDirs().forEach(dir => {
        entries[`components/${dir}/index`] = `./src/components/${dir}/index.ts`;
      });
    }
    
    return entries;
  } else {
    const entries: Record<string, string> = {
      index: "./src/index.ts",
      "index.css": "./src/index.css",
    };
    
    getAllComponentDirs().forEach(dir => {
      entries[`components/${dir}/index`] = `./src/components/${dir}/index.ts`;
    });
    
    return entries;
  }
}

export default defineConfig({
  plugins: [
    pluginBabel({ include: /\.(?:jsx|tsx)$/ }), 
    pluginSolid(),
  ],
  source: {
    entry: generateEntries(),
    alias: { 
      "~": "./src",
      "@src": "./src" 
    },
    define: {
      "import.meta.env.VERSION": JSON.stringify(
        process.env.GITHUB_RUN_NUMBER || "0.0.1"
      ),
    },
  },
  output: {
    distPath: {
      root: "dist",
      js: ".",
      css: ".",
      html: ".",
      image: "static/image",
      font: "static/font",
      media: "static/media",
    },
    minify: false,
    filenameHash: false,
    filename: {
      js: "[name].js",
      css: "[name].css",
    },
    cleanDistPath: !isTypeGen,
  },
  tools: {
    rspack: {
      target: "web",
      optimization: {
        splitChunks: false,
        runtimeChunk: false,
      },
      plugins: [
        new CompressionPlugin({
          algorithm: "brotliCompress",
          filename: "[path][base].br",
          test: /\.(js|css|html|svg)$/,
        }),
      ],
    },
  },
  performance: {
    buildCache: true,
    printFileSize: true,
  },
  dev: {
    writeToDisk: true,
  },
}); 