import { copyFile, mkdir, readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

async function* findCSSFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* findCSSFiles(fullPath);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".css")) {
      yield fullPath;
    }
  }
}

async function copyTree(sourceDir, targetDir) {
  for await (const cssFile of findCSSFiles(sourceDir)) {
    const relPath = relative(sourceDir, cssFile);
    const outPath = join(targetDir, relPath);
    await mkdir(dirname(outPath), { recursive: true });
    await copyFile(cssFile, outPath);
    console.log(`Copied: ${outPath}`);
  }
}

async function copyCSS() {
  try {
    await mkdir("dist", { recursive: true });
    await copyTree("src/components", "dist");
    await copyTree("src/styles", "dist/styles");
  } catch (error) {
    console.error("Error copying CSS files:", error);
    process.exit(1);
  }
}

copyCSS();
