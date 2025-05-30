import { locate, lookupCollections } from '@iconify/json'
import { getIconData, iconToHTML, iconToSVG } from '@iconify/utils'
import { exec } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { optimize } from 'svgo'

const targetDir = 'src/styles/icons'

const INCLUDE_FULL_SETS = ['mdi-light', 'material-symbols']
const MAX_ICONS_PER_SET = 200

if (!fs.existsSync(targetDir)) {
	fs.mkdirSync(targetDir, { recursive: true })
}

let iconCSS = `
.iconify {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: currentColor;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}

.iconify-color {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
`

function optimizeSVG(svgString) {
	try {
		const result = optimize(svgString, {
			plugins: [
				{
					name: 'preset-default',
					params: {
						overrides: {
							removeViewBox: false,
							removeUselessStrokeAndFill: false,
							inlineStyles: false,
						},
					},
				},
				'removeXMLNS',
				{ name: 'collapseGroups' },
				{ name: 'removeEmptyAttrs' },
				{ name: 'removeEmptyContainers' },
				{ name: 'mergePaths' },
				{ name: 'convertPathData' },
				{ name: 'cleanupNumericValues' },
				{ name: 'sortAttrs' },
			],
		})
		return result.data
	} catch (error) {
		console.warn('Error optimizing SVG:', error)
		return svgString
	}
}

function compressCSS(inputFile, outputFile) {
	return new Promise((resolve, reject) => {
		exec(
			`npx postcss ${inputFile} --use cssnano --no-map -o ${outputFile}`,
			(error, stdout, stderr) => {
				if (error) {
					console.error(`Error compressing CSS: ${error.message}`)
					reject(error)
					return
				}
				if (stderr) {
					console.error(`stderr: ${stderr}`)
				}
				const originalSize = fs.statSync(inputFile).size
				const compressedSize = fs.statSync(outputFile).size
				const savings = ((1 - compressedSize / originalSize) * 100).toFixed(2)
				console.log(
					`CSS сжат: ${(originalSize / 1024).toFixed(2)} KB -> ${(
						compressedSize / 1024
					).toFixed(2)} KB (экономия ${savings}%)`
				)
				resolve()
			}
		)
	})
}

async function generateIcons() {
	const usedIcons = findUsedIcons()
	console.log(`Found ${usedIcons.size} unique icons in code`)

	const iconSets = await lookupCollections()
	const prefixes = Object.keys(iconSets)
	console.log(`Found ${prefixes.length} icon sets in @iconify/json`)

	let totalProcessedSets = 0
	let totalProcessedIcons = 0

	for (const iconSet of prefixes) {
		try {
			const includeFullSet = INCLUDE_FULL_SETS.includes(iconSet)

			if (!includeFullSet && !hasIconsWithPrefix(usedIcons, iconSet)) {
				continue
			}

			const jsonPath = locate(iconSet)
			if (!jsonPath) {
				console.warn(`Icon set ${iconSet} not found. Skipping.`)
				continue
			}

			const iconSetData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
			let setProcessedIcons = 0

			const iconNames = Object.keys(iconSetData.icons)

			const iconsToProcess = includeFullSet
				? iconNames.slice(0, MAX_ICONS_PER_SET)
				: iconNames

			for (const iconName of iconsToProcess) {
				const fullIconName = `${iconSet}--${iconName}`
				const cssIconName = `icon-[${iconSet}--${iconName}]`

				if (
					!includeFullSet &&
					!usedIcons.has(cssIconName) &&
					!usedIcons.has(fullIconName)
				) {
					continue
				}

				const iconData = getIconData(iconSetData, iconName)
				if (!iconData) continue

				const { attributes, body } = iconToSVG(iconData, { height: 'auto' })
				let svg = iconToHTML(body, attributes)

				svg = optimizeSVG(svg)

				const dataURI = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

				iconCSS += `.icon-[${iconSet}--${iconName}] {
  --svg: ${dataURI};
}
.icon-[${iconSet}--${iconName}].iconify {
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
}
.icon-[${iconSet}--${iconName}].iconify-color {
  background-image: var(--svg);
}

`
				setProcessedIcons++
				totalProcessedIcons++

				if (totalProcessedIcons >= 1000) {
					console.warn(
						'Icon limit (1000) reached. Other icons will be skipped.'
					)
					break
				}
			}

			if (setProcessedIcons > 0) {
				console.log(`Processed icon set ${iconSet}: ${setProcessedIcons} icons`)
				totalProcessedSets++
			}

			if (totalProcessedIcons >= 1000) {
				break
			}
		} catch (error) {
			console.error(`Error processing icon set ${iconSet}:`, error)
		}
	}

	console.log(
		`Total: processed ${totalProcessedIcons} icons from ${totalProcessedSets} sets`
	)

	const rawCSSFile = path.join(targetDir, 'generated-icons.css')

	fs.writeFileSync(rawCSSFile, iconCSS)
	console.log(`CSS file with icons saved in ${rawCSSFile}`)

	const optimizedCSSFile = path.join(targetDir, 'generated-icons.min.css')

	await compressCSS(rawCSSFile, optimizedCSSFile)

	fs.copyFileSync(optimizedCSSFile, rawCSSFile)
	fs.unlinkSync(optimizedCSSFile)
	console.log(`Compressed CSS file saved as ${rawCSSFile}`)
}

function hasIconsWithPrefix(icons, prefix) {
	for (const icon of icons) {
		if (icon.includes(prefix)) {
			return true
		}
	}
	return false
}

function findUsedIcons() {
	const icons = new Set()

	const iconPattern = /icon-\[([\w-]+)]/g
	const solidIconPattern = /name="([\w-]+)"/g

	function searchInDirectory(dir) {
		try {
			const files = fs.readdirSync(dir, { withFileTypes: true })

			for (const file of files) {
				const fullPath = path.join(dir, file.name)

				if (file.isDirectory()) {
					searchInDirectory(fullPath)
				} else if (/\.(jsx?|tsx?|css|scss)$/.test(file.name)) {
					const content = fs.readFileSync(fullPath, 'utf8')

					let match
					while ((match = iconPattern.exec(content)) !== null) {
						icons.add(`icon-[${match[1]}]`)
					}

					iconPattern.lastIndex = 0
					while ((match = solidIconPattern.exec(content)) !== null) {
						icons.add(match[1])
					}
				}
			}
		} catch (error) {
			console.warn(`Error reading directory ${dir}: ${error.message}`)
		}
	}

	searchInDirectory('src')

	return icons
}

generateIcons().catch(error => {
	console.error('Error generating icons:', error)
	process.exit(1)
})
