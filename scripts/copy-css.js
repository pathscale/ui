import { copyFile, mkdir, readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'

async function copyCSS() {
	async function* findCSSFiles(dir) {
		try {
			const entries = await readdir(dir, { withFileTypes: true })
			for (const entry of entries) {
				const fullPath = join(dir, entry.name)
				if (entry.isDirectory()) {
					yield* findCSSFiles(fullPath)
				} else if (entry.isFile() && entry.name.endsWith('.css')) {
					yield fullPath
				}
			}
		} catch (error) {
			console.warn(`Skipping directory ${dir}: ${error.message}`)
		}
	}

	try {
		await mkdir('dist', { recursive: true })

		for await (const cssFile of findCSSFiles('src/components')) {
			const relativePath = cssFile.replace('src/components/', '')
			const targetPath = join('dist', relativePath)

			await mkdir(dirname(targetPath), { recursive: true })

			await copyFile(cssFile, targetPath)
			console.log(`Copied: ${relativePath}`)
		}

		const iconsDir = 'src/styles/icons'
		try {
			await mkdir('dist/styles/icons', { recursive: true })

			for await (const cssFile of findCSSFiles(iconsDir)) {
				const relativePath = cssFile.replace('src/', '')
				const targetPath = join('dist', relativePath.replace('src/', ''))

				await mkdir(dirname(targetPath), { recursive: true })

				await copyFile(cssFile, targetPath)
				console.log(`Copied: ${relativePath}`)
			}
		} catch (error) {
			console.warn(`Skipping icons: ${error.message}`)
		}
	} catch (error) {
		console.error('Error copying CSS files:', error)
		process.exit(1)
	}
}

copyCSS()
