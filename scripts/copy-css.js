import { readdir, mkdir, copyFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';

async function copyCSS() {
  async function* findCSSFiles(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        yield* findCSSFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.css')) {
        yield fullPath;
      }
    }
  }

  try {
    // Ensure dist directory exists
    await mkdir('dist', { recursive: true });

    for await (const cssFile of findCSSFiles('src/components')) {
      // Get the relative path from src/components
      const relativePath = cssFile.replace('src/components/', '');
      const targetPath = join('dist', relativePath);
      
      // Create the target directory if it doesn't exist
      await mkdir(dirname(targetPath), { recursive: true });
      
      // Copy the file
      await copyFile(cssFile, targetPath);
      console.log(`Copied: ${relativePath}`);
    }
  } catch (error) {
    console.error('Error copying CSS files:', error);
    process.exit(1);
  }
}

copyCSS(); 