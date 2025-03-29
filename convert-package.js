import fs from "fs-extra";
import path from "path";
import {glob} from "glob";
import { execSync } from "child_process";
import esbuild from "esbuild";

// Step 1: Locate the package source folder
const packageName = "@tinymce"; // Change this to the actual package name
const packagePath = path.resolve("./src/vendor", packageName);
const outputPath = path.resolve('./src/vendor', "tinymce");

// Step 2: Copy package files to a new directory
fs.removeSync(outputPath);
fs.copySync(packagePath, outputPath);

console.log(`✅ Copied package files to ${outputPath}`);

// Step 3: Read tsconfig.json (if exists) to find aliases
const tsConfigPath = path.join(outputPath, "tsconfig.json");
let aliasMap = {};

if (fs.existsSync(tsConfigPath)) {
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, "utf-8"));
    if (tsConfig.compilerOptions?.paths) {
        aliasMap = Object.fromEntries(
            Object.entries(tsConfig.compilerOptions.paths).map(([alias, paths]) => [
                alias.replace("/*", ""),
                path.resolve(outputPath, paths[0].replace("/*", "")),
            ])
        );
    }
}

console.log(`🔍 Found aliases:`, aliasMap);

// Step 4: Replace `@` imports with relative paths
glob.sync(`${outputPath}/**/*.{js,ts}`).forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");

    Object.entries(aliasMap).forEach(([alias, realPath]) => {
        const regex = new RegExp(`from ["']${alias}/(.*?)["']`, "g");
        content = content.replace(regex, (_, subPath) => `from "./${path.relative(path.dirname(file), path.join(realPath, subPath))}"`);
    });

    fs.writeFileSync(file, content);
});

console.log(`✅ Replaced alias imports`);

// Step 5: Convert TypeScript files to JavaScript
try {
    execSync(`npx tsc --outDir ${outputPath} --allowJs --skipLibCheck`, { stdio: "inherit" });
    console.log(`✅ Transpiled TypeScript to JavaScript`);
} catch (error) {
    console.error(`❌ Error in TypeScript conversion`, error);
}

// Step 6: Bundle into a single JS file using esbuild
esbuild.buildSync({
    entryPoints: [path.join(outputPath, "tinymce-react/lib/cjs/main/ts/index.js")], // Use ESM entry point
    outfile: path.join(outputPath, "index.js"),
    bundle: true,
    platform: "browser",  // Ensure it's suitable for frontend
    format: "esm",  // ✅ Fix: Output ES Modules
});

console.log(`✅ Bundle created at ${path.join(outputPath, "index.js")}`);
console.log(`🚀 Done! Run "node ${path.join(outputPath, 'index.js')}" to test`);
