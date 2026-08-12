import { transformSync, type PluginObj } from "@babel/core";
import { Glob } from "bun";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const components = resolve("src/components");
const check = process.argv.includes("--check");
const globals = new Set([
  "Array", "Boolean", "Date", "Error", "JSON", "Map", "Math", "Number", "Object",
  "Promise", "Record", "RegExp", "Set", "String", "Symbol", "URL", "console", "document",
  "globalThis", "undefined", "window",
]);

const plugin = (): PluginObj => ({
  visitor: {
    VariableDeclarator(path) {
      const annotation = path.node.id.typeAnnotation?.typeAnnotation;
      if (annotation?.type !== "TSTypeReference" || annotation.typeName.type !== "Identifier" || annotation.typeName.name !== "Layout") return;
      if (path.node.init?.type !== "ArrowFunctionExpression") throw path.buildCodeFrameError("a Layout must be an arrow function");
      if (path.node.init.params.length !== 0) throw path.buildCodeFrameError("Layout syntax takes no parameters; the compiler creates them");

      const typeParameters = annotation.typeParameters?.params;
      const recipeType = typeParameters?.[0];
      if (recipeType?.type !== "TSTypeQuery" || recipeType.exprName.type !== "Identifier") {
        throw path.buildCodeFrameError("Layout must name its recipe as Layout<typeof recipe>");
      }
      const recipeBinding = path.scope.getBinding(recipeType.exprName.name);
      if (!recipeBinding || recipeBinding.path.parentPath?.node.type !== "ImportDeclaration") {
        throw path.buildCodeFrameError(`recipe ${recipeType.exprName.name} is not imported`);
      }
      const source = recipeBinding.path.parentPath.node.source.value;
      const recipeFile = resolve(dirname(this.file.opts.filename ?? ""), `${source}.ts`);
      try {
        readFileSync(recipeFile, "utf8");
      } catch {
        throw path.buildCodeFrameError(`recipe source not found: ${recipeFile}`);
      }

      const usedSlots = new Set<string>();
      path.get("init").traverse({
        MemberExpression(member) {
          if (member.node.object.type !== "Identifier" || member.node.object.name !== "slot") return;
          if (!member.node.computed && member.node.property.type === "Identifier") usedSlots.add(member.node.property.name);
          if (member.node.computed && member.node.property.type === "StringLiteral") usedSlots.add(member.node.property.value);
        },
      });
      const legacy = usedSlots.size === 0;
      path.get("init").traverse({
        TSType(typePath) {
          typePath.skip();
        },
        MemberExpression(member) {
          if (member.node.object.type === "Identifier" && member.node.object.name === "local" && !member.scope.hasBinding("local")) {
            member.node.object = { type: "Identifier", name: "p" };
          }
        },
        ReferencedIdentifier(identifier) {
          const name = identifier.node.name;
          if (name === "props" || name === "rawProps") {
            identifier.replaceWith({ type: "Identifier", name: "p" });
            return;
          }
          if (legacy) return;
          if (name === "slot" || name === "children" || name === "local" || name === "p" || globals.has(name) || identifier.scope.hasBinding(name)) return;
          identifier.replaceWith({
            type: "MemberExpression",
            object: { type: "Identifier", name: "p" },
            property: { type: "Identifier", name },
            computed: false,
          });
        },
      });

      if (usedSlots.size === 0) {
        const propsType = typeParameters?.[1];
        const parameter = { type: "Identifier", name: "p" } as const;
        if (propsType) {
          Object.assign(parameter, {
            typeAnnotation: { type: "TSTypeAnnotation", typeAnnotation: structuredClone(propsType) },
          });
        }
        path.node.init.params = [parameter];
        path.node.id.typeAnnotation = undefined;
      } else {
        path.node.init.params = [
          {
            type: "ObjectPattern",
            properties: ["slot", "children"].map((name) => ({
              type: "ObjectProperty",
              key: { type: "Identifier", name },
              value: { type: "Identifier", name },
              computed: false,
              shorthand: true,
            })),
          },
          { type: "Identifier", name: "p" },
        ];
      }
    },
  },
});

let changed = 0;
for await (const relative of new Glob("*/*.layout.tsx").scan({ cwd: components })) {
  const input = resolve(components, relative);
  const output = input.replace(/\.layout\.tsx$/, ".generated.tsx");
  const source = readFileSync(input, "utf8");
  const recipeMatches = [...source.matchAll(/Layout<\s*typeof\s+([A-Za-z_$][\w$]*)/g)];
  const recipeImports = [...source.matchAll(/import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+["']([^"']+\.recipe)["']/g)];
  for (const recipeName of new Set(recipeMatches.map((match) => match[1]))) {
    const recipeImport = recipeImports.find((candidate) =>
      candidate[1].split(",").some((name) => name.trim().split(/\s+as\s+/).at(-1) === recipeName),
    );
    if (!recipeImport) throw new Error(`${input}: recipe ${recipeName} is not imported from a .recipe file`);
    const recipeFile = resolve(dirname(input), `${recipeImport[2]}.ts`);
    const module = await import(`${recipeFile}?layouts=${Date.now()}`);
    const declaredSlots = new Set(Object.keys(module[recipeName]?.config?.slots ?? {}));
    if (declaredSlots.size === 0) throw new Error(`${input}: recipe ${recipeName} has no declared slots`);
    const layoutSource = recipeMatches
      .map((match, index) => ({ match, end: recipeMatches[index + 1]?.index ?? source.length }))
      .filter(({ match }) => match[1] === recipeName)
      .map(({ match, end }) => source.slice(match.index, end))
      .join("\n");
    const renderedSlots = new Set([...layoutSource.matchAll(/\bslot(?:\.([A-Za-z_$][\w$]*)|\[["']([^"']+)["']\])/g)].map((slot) => slot[1] ?? slot[2]));
    for (const slot of layoutSource.matchAll(/data-slot\s*=\s*["']([^"']+)["']/g)) renderedSlots.add(slot[1]);
    for (const slot of renderedSlots) {
      if (!declaredSlots.has(slot)) throw new Error(`${input}: slot ${slot} is not declared by ${recipeName}`);
    }
  }
  const result = transformSync(source, {
    filename: input,
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: ["typescript", "jsx"] },
    plugins: [plugin],
    generatorOpts: { retainLines: true },
  });
  if (!result?.code) throw new Error(`Layouts produced no output for ${input}`);
  const next = `${result.code}\n`;
  let current = "";
  try { current = readFileSync(output, "utf8"); } catch {}
  if (current === next) continue;
  if (check) throw new Error(`${output} is stale; run bun run layouts:generate`);
  writeFileSync(output, next);
  changed += 1;
}

console.log(check ? "Layouts generated output is current" : `generated ${changed} Layout file(s)`);
