import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const buildId = Date.now().toString();
const builtAt = new Date().toISOString();

const publicDir = path.join(rootDir, "public");
const generatedDir = path.join(rootDir, "src", "generated");

fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(generatedDir, { recursive: true });

fs.writeFileSync(
    path.join(publicDir, "version.json"),
    JSON.stringify({ buildId, builtAt }, null, 2),
    "utf8"
);

fs.writeFileSync(
    path.join(generatedDir, "buildMeta.js"),
    `// Auto-generated at build time — do not edit
export const BUILD_ID = ${JSON.stringify(buildId)};
export const BUILT_AT = ${JSON.stringify(builtAt)};
`,
    "utf8"
);

console.log(`✅ Generated app version ${buildId}`);
