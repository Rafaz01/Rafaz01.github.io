#!/usr/bin/env node
/**
 * Converts the PNG screenshots in public/images to resized, compressed WebP
 * files under public/images/optimized (mirroring the source folder layout).
 *
 * - Project screenshots: resized to a 900px max width, WebP quality 82.
 * - rafasprofile6.png (hero profile photo): resized to 600x600, WebP quality 85.
 * - .svg and .webp files are copied over unchanged.
 * - Originals in public/images are left untouched (kept as a backup).
 *
 * Usage: node scripts/convert-images.mjs   (or: npm run images)
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "public", "images");
const OUT_DIR = path.join(SRC_DIR, "optimized");

const PROFILE_FILENAME = "rafasprofile6.png";
const PROFILE_SIZE = 600;
const PROFILE_QUALITY = 85;

const SCREENSHOT_MAX_WIDTH = 900;
const SCREENSHOT_QUALITY = 82;

function toKB(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (full === OUT_DIR) continue; // don't descend into our own output
    if (entry.isDirectory()) {
      files = files.concat(await walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

/**
 * A PNG exported from a screenshot/design tool often carries an alpha
 * channel even when every pixel is fully opaque. Trusting metadata().hasAlpha
 * alone would push nearly every screenshot down the lossless path and defeat
 * the point of the conversion, so check whether the alpha channel actually
 * varies (min < 255) before treating the image as "has real transparency".
 */
async function hasRealTransparency(filePath) {
  const stats = await sharp(filePath).stats();
  const alpha = stats.channels[3];
  return Boolean(alpha) && alpha.min < 255;
}

async function convertPng(filePath, relPath) {
  const outRelPath = relPath.replace(/\.png$/i, ".webp");
  const outPath = path.join(OUT_DIR, outRelPath);
  await fs.mkdir(path.dirname(outPath), { recursive: true });

  const isProfile = path.basename(filePath) === PROFILE_FILENAME;
  const lossless = await hasRealTransparency(filePath);

  let pipeline = sharp(filePath);
  pipeline = isProfile
    ? pipeline.resize(PROFILE_SIZE, PROFILE_SIZE, { withoutEnlargement: true })
    : pipeline.resize({ width: SCREENSHOT_MAX_WIDTH, withoutEnlargement: true });

  pipeline = pipeline.webp(
    lossless
      ? { lossless: true }
      : { quality: isProfile ? PROFILE_QUALITY : SCREENSHOT_QUALITY },
  );

  const originalSize = (await fs.stat(filePath)).size;
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  await fs.writeFile(outPath, data);

  console.log(
    `${relPath}: ${toKB(originalSize)} → ${toKB(data.length)}  ` +
      `(${info.width}x${info.height}${lossless ? ", lossless" : ""})`,
  );

  return { originalSize, newSize: data.length };
}

async function copyAsIs(filePath, relPath) {
  const outPath = path.join(OUT_DIR, relPath);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.copyFile(filePath, outPath);
  const size = (await fs.stat(filePath)).size;
  console.log(`${relPath}: ${toKB(size)} (copied as-is)`);
  return { originalSize: size, newSize: size };
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const files = await walk(SRC_DIR);

  // A .png being converted always wins its output filename. If a .webp with
  // the same basename sits next to it (e.g. a leftover from a previous
  // conversion, or an old hand-optimized file the .png is meant to replace),
  // copying that .webp afterwards would silently overwrite the fresh
  // conversion. Build the set of output paths the PNG pass will produce so
  // the copy pass can skip anything that would collide with it.
  const pngOutputPaths = new Set(
    files
      .filter((f) => path.extname(f).toLowerCase() === ".png")
      .map((f) => path.relative(SRC_DIR, f).replace(/\.png$/i, ".webp")),
  );

  let totalOriginal = 0;
  let totalNew = 0;

  for (const filePath of files) {
    const relPath = path.relative(SRC_DIR, filePath);
    const ext = path.extname(filePath).toLowerCase();

    let result;
    if (ext === ".png") {
      result = await convertPng(filePath, relPath);
    } else if (ext === ".svg" || ext === ".webp") {
      if (ext === ".webp" && pngOutputPaths.has(relPath)) {
        console.log(
          `${relPath}: skipped — a .png with the same name is being converted to this ` +
            `exact output; delete the stale .webp to silence this`,
        );
        continue;
      }
      result = await copyAsIs(filePath, relPath);
    } else {
      continue;
    }

    totalOriginal += result.originalSize;
    totalNew += result.newSize;
  }

  const saved = totalOriginal - totalNew;
  const savedPct = totalOriginal ? ((saved / totalOriginal) * 100).toFixed(1) : "0.0";

  console.log("");
  console.log(
    `Total: ${toKB(totalOriginal)} → ${toKB(totalNew)}  (ahorrado ${toKB(saved)}, ${savedPct}%)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
