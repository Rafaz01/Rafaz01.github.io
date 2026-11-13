#!/usr/bin/env node
/**
 * Generates 1200x630 JPG Open Graph images (the preview shown when a page is
 * shared on LinkedIn, Facebook, WhatsApp, X...) into public/images/og/.
 *
 * - default.jpg   — home page and fallback for any page without its own image
 * - about-me.jpg  — About Me page
 * - <slug>.jpg    — one per project in src/pages/portfolio/projects/*.md
 *
 * Each image is an HTML card rendered with headless Chrome, so it uses the
 * site's own font and colors. Social platforms don't reliably support WebP,
 * so the output is JPG.
 *
 * Re-run after adding a project or changing the profile photo:
 *   npm run og        (set CHROME_PATH if Chrome isn't in a default location)
 */
import { promises as fs, existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT_DIR = path.join(PUBLIC_DIR, "images", "og");
const PROJECTS_DIR = path.join(ROOT, "src", "pages", "portfolio", "projects");
const PROFILE_IMAGE = "/images/optimized/profile-glasses.webp";
const FONT_FILE = path.join(
  ROOT,
  "node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2",
);

const WIDTH = 1200;
const HEIGHT = 630;
const JPG_QUALITY = 85;

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

function findChrome() {
  const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!chrome) throw new Error("Chrome not found — set CHROME_PATH to your Chrome/Edge executable.");
  return chrome;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Reads the few frontmatter fields we need without pulling in a YAML parser. */
function readFrontmatter(source) {
  const block = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  const field = (re) => block.match(re)?.[1]?.trim();
  return {
    title: field(/^title:\s*['"]?(.+?)['"]?\s*$/m),
    // Indented `url:` under `image:` — not a top-level `url:` some projects also have.
    image: field(/^[ \t]+url:\s*['"]?(.+?)['"]?\s*$/m),
  };
}

/** Shrinks the title so its longest word still fits the text column. */
function titleFontSize(title) {
  const plain = title.replace(/<[^>]+>/g, "");
  const longestWord = Math.max(...plain.split(/\s+/).map((w) => w.length));
  const fitsWord = Math.floor(500 / (longestWord * 0.7));
  return Math.min(plain.length > 22 ? 58 : 72, fitsWord);
}

function cardHtml({ eyebrow, title, subtitle, image, imageShape }) {
  const fileUrl = (p) => pathToFileURL(path.join(PUBLIC_DIR, p)).href;
  const media =
    imageShape === "circle"
      ? `<div class="photo" style="background-image:url('${fileUrl(image)}')"></div>`
      : `<img class="shot" src="${fileUrl(image)}" alt="">`;

  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: "Montserrat"; src: url("${pathToFileURL(FONT_FILE).href}") format("woff2"); font-weight: 100 900; }
  * { margin: 0; box-sizing: border-box; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  body {
    font-family: "Montserrat", sans-serif; color: #fff; display: flex; align-items: center; gap: 56px; padding: 0 72px;
    background:
      radial-gradient(circle at 85% 15%, rgba(13,188,130,.35), transparent 45%),
      radial-gradient(circle at 10% 100%, rgba(18,186,168,.25), transparent 50%),
      #0E0E11;
  }
  .text { flex: 1; display: flex; flex-direction: column; gap: 22px; min-width: 0; }
  .eyebrow { display: inline-flex; align-items: center; gap: 10px; font-size: 22px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #6ce9b7; }
  .eyebrow::before { content: ""; width: 12px; height: 12px; border-radius: 50%; background: #31d69a; }
  h1 { font-size: ${titleFontSize(title)}px; line-height: 1.05; font-weight: 800; letter-spacing: -.02em; }
  h1 span { background: linear-gradient(90deg, #5cecd5, #a4f4cf); -webkit-background-clip: text; color: transparent; }
  .subtitle { font-size: 26px; line-height: 1.4; font-weight: 500; color: #d4d4d8; }
  .domain { margin-top: 18px; font-size: 24px; font-weight: 700; color: #a4f4cf; }
  .photo { width: 400px; height: 400px; flex: none; border-radius: 50%; background: center top / cover; border: 6px solid #0dbc82; box-shadow: 0 0 80px rgba(13,188,130,.35); }
  .shot { width: 560px; flex: none; border-radius: 18px; border: 2px solid rgba(108,233,183,.35); box-shadow: 0 30px 80px rgba(0,0,0,.6); }
</style></head><body>
  <div class="text">
    <div class="eyebrow">${escapeHtml(eyebrow)}</div>
    <h1>${title}</h1>
    <p class="subtitle">${escapeHtml(subtitle)}</p>
    <div class="domain">rafaelgomez.dev</div>
  </div>
  ${media}
</body></html>`;
}

async function render(chrome, tmpDir, slug, card) {
  const htmlPath = path.join(tmpDir, `${slug}.html`);
  const pngPath = path.join(tmpDir, `${slug}.png`);
  await fs.writeFile(htmlPath, cardHtml(card));

  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--allow-file-access-from-files",
    "--force-device-scale-factor=1",
    `--window-size=${WIDTH},${HEIGHT}`,
    "--virtual-time-budget=3000",
    `--screenshot=${pngPath}`,
    pathToFileURL(htmlPath).href,
  ], { stdio: "ignore" });

  const outPath = path.join(OUT_DIR, `${slug}.jpg`);
  await sharp(pngPath)
    .resize(WIDTH, HEIGHT, { position: "top" })
    .jpeg({ quality: JPG_QUALITY, mozjpeg: true })
    .toFile(outPath);
  console.log(`og/${slug}.jpg: ${((await fs.stat(outPath)).size / 1024).toFixed(0)} KB`);
}

async function main() {
  const chrome = findChrome();
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "og-images-"));
  await fs.mkdir(OUT_DIR, { recursive: true });

  const cards = [
    ["default", {
      eyebrow: "Available for work",
      title: "Rafael <span>Gomez</span>",
      subtitle: "Frontend Developer — WordPress, Shopify & custom websites. Based in Florida · Bilingual EN/ES.",
      image: PROFILE_IMAGE,
      imageShape: "circle",
    }],
    ["about-me", {
      eyebrow: "About me",
      title: "Hey, I'm <span>Rafael</span>",
      subtitle: "Frontend Developer and co-founder of JG Graphic LLC, building websites for real businesses.",
      image: PROFILE_IMAGE,
      imageShape: "circle",
    }],
  ];

  for (const file of (await fs.readdir(PROJECTS_DIR)).filter((f) => f.endsWith(".md"))) {
    const { title, image } = readFrontmatter(await fs.readFile(path.join(PROJECTS_DIR, file), "utf8"));
    if (!title || !image) {
      console.warn(`${file}: skipped — missing title or image.url in frontmatter`);
      continue;
    }
    cards.push([path.basename(file, ".md"), {
      eyebrow: "Project",
      title: escapeHtml(title),
      subtitle: "Web project by Rafael Gomez",
      image,
      imageShape: "screenshot",
    }]);
  }

  try {
    for (const [slug, card] of cards) await render(chrome, tmpDir, slug, card);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
