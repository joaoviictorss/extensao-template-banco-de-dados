import { copyFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, "..");
const backendDir = __dirname;

const filesToCopy = ["index.html", "app.js", "styles.css"];

console.log("Copiando arquivos estáticos...");

filesToCopy.forEach((file) => {
  const source = join(rootDir, file);
  const dest = join(backendDir, file);

  if (existsSync(source)) {
    copyFileSync(source, dest);
    console.log(`✓ ${file} copiado`);
  } else {
    console.warn(`⚠ ${file} não encontrado em ${source}`);
  }
});

console.log("Arquivos estáticos copiados com sucesso!");

