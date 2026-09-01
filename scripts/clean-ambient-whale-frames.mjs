import { existsSync } from 'node:fs';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const inputDir = path.join(repoRoot, 'apps', 'web', 'public', 'ocean', 'ambient-whale', 'frames');
const outputDir = path.join(repoRoot, 'apps', 'web', 'public', 'ocean', 'ambient-whale', 'frames-clean');

function isLikelyCheckerboard(r, g, b, a) {
  if (a < 255) return true;

  const lightTile = r >= 216 && g >= 216 && b >= 216 && Math.max(r, g, b) - Math.min(r, g, b) <= 18;
  const midTile = r >= 165 && r <= 205 && g >= 165 && g <= 205 && b >= 165 && b <= 205 && Math.max(r, g, b) - Math.min(r, g, b) <= 18;
  const purpleTile = r >= 160 && r <= 218 && g >= 130 && g <= 190 && b >= 175 && b <= 232;

  return lightTile || midTile || purpleTile;
}

function isEdgeReachableBackground({ data, width, height }, x, y, visited) {
  const key = y * width + x;
  if (visited[key]) return false;
  visited[key] = 1;

  const stack = [[x, y]];
  let reachable = false;

  while (stack.length > 0) {
    const [cx, cy] = stack.pop();
    const index = (cy * width + cx) * 4;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const a = data[index + 3];

    if (!isLikelyCheckerboard(r, g, b, a)) continue;
    if (cx === 0 || cy === 0 || cx === width - 1 || cy === height - 1) reachable = true;

    for (const [nx, ny] of [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ]) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const nextKey = ny * width + nx;
      if (!visited[nextKey]) {
        visited[nextKey] = 1;
        stack.push([nx, ny]);
      }
    }
  }

  return reachable;
}

async function loadSharp() {
  try {
    const module = await import('sharp');
    return module.default;
  } catch (error) {
    console.error('[ambient-whale-clean] sharp is not installed. Install it with: npm install -D sharp');
    console.error('[ambient-whale-clean] Original frames were not modified.');
    process.exitCode = 1;
    return null;
  }
}

async function main() {
  console.log(`[ambient-whale-clean] Reading frames from ${inputDir}`);

  if (!existsSync(inputDir)) {
    throw new Error(`Input directory does not exist: ${inputDir}`);
  }

  const sharp = await loadSharp();
  if (!sharp) return;

  await mkdir(outputDir, { recursive: true });
  const entries = (await readdir(inputDir)).filter((name) => /^frame-\d+\.png$/i.test(name)).sort();

  if (entries.length === 0) {
    console.log('[ambient-whale-clean] No frame-XX.png files found.');
    return;
  }

  for (const entry of entries) {
    const inputPath = path.join(inputDir, entry);
    const outputPath = path.join(outputDir, entry);
    const image = sharp(inputPath).ensureAlpha();
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    const visited = new Uint8Array(info.width * info.height);
    let transparentPixels = 0;

    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const pixelIndex = y * info.width + x;
        const byteIndex = pixelIndex * 4;
        if (visited[pixelIndex]) continue;

        const r = data[byteIndex];
        const g = data[byteIndex + 1];
        const b = data[byteIndex + 2];
        const a = data[byteIndex + 3];
        if (!isLikelyCheckerboard(r, g, b, a)) {
          visited[pixelIndex] = 1;
          continue;
        }

        const before = visited.slice();
        const removable = isEdgeReachableBackground({ data, width: info.width, height: info.height }, x, y, visited);
        if (!removable) continue;

        for (let i = 0; i < visited.length; i += 1) {
          if (visited[i] && !before[i]) {
            data[i * 4 + 3] = 0;
            transparentPixels += 1;
          }
        }
      }
    }

    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(outputPath);
    console.log(`[ambient-whale-clean] Wrote ${path.relative(repoRoot, outputPath)} (${transparentPixels} edge checkerboard pixels removed)`);
  }

  console.log('[ambient-whale-clean] Done. Original frames were preserved. Review frames-clean before replacing app frames.');
}

main().catch((error) => {
  console.error('[ambient-whale-clean] Failed:', error);
  process.exitCode = 1;
});
