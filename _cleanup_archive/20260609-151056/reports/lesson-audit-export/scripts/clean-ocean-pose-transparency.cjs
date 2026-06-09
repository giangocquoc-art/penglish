const fs = require('node:fs');
const path = require('node:path');
const { PNG } = require('pngjs');

const rootDir = path.resolve(__dirname, '..');
const mascotsDir = path.join(rootDir, 'apps', 'web', 'public', 'ocean', 'mascots');
const mapPath = path.join(mascotsDir, 'poses-clean-map.json');

function isDirectory(fullPath) {
  try {
    return fs.statSync(fullPath).isDirectory();
  } catch {
    return false;
  }
}

function listPoseFiles() {
  const files = [];
  for (const mascot of fs.readdirSync(mascotsDir)) {
    const mascotDir = path.join(mascotsDir, mascot);
    const posesDir = path.join(mascotDir, 'poses');
    if (!isDirectory(mascotDir) || !isDirectory(posesDir)) continue;
    for (const file of fs.readdirSync(posesDir)) {
      if (file.toLowerCase().endsWith('.png')) {
        files.push({ mascot, file, inputPath: path.join(posesDir, file), outputDir: path.join(mascotDir, 'poses-clean'), outputPath: path.join(mascotDir, 'poses-clean', file) });
      }
    }
  }
  return files.sort((a, b) => a.inputPath.localeCompare(b.inputPath));
}

function pixelAt(png, x, y) {
  const idx = (png.width * y + x) << 2;
  return {
    r: png.data[idx],
    g: png.data[idx + 1],
    b: png.data[idx + 2],
    a: png.data[idx + 3],
  };
}

function luminance({ r, g, b }) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function saturation({ r, g, b }) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function isGreyWhiteCheckerPixel(pixel) {
  if (pixel.a < 8) return true;
  const max = Math.max(pixel.r, pixel.g, pixel.b);
  const min = Math.min(pixel.r, pixel.g, pixel.b);
  const lum = luminance(pixel);
  const sat = saturation(pixel);

  return (
    sat <= 0.075 &&
    max - min <= 18 &&
    lum >= 172 &&
    lum <= 255
  );
}

function isVeryLightFringe(pixel) {
  const max = Math.max(pixel.r, pixel.g, pixel.b);
  const min = Math.min(pixel.r, pixel.g, pixel.b);
  const lum = luminance(pixel);
  const sat = saturation(pixel);
  return sat <= 0.055 && max - min <= 14 && lum >= 214;
}

function neighborCheckerRatio(png, x, y, radius = 1) {
  let total = 0;
  let checker = 0;
  for (let yy = Math.max(0, y - radius); yy <= Math.min(png.height - 1, y + radius); yy += 1) {
    for (let xx = Math.max(0, x - radius); xx <= Math.min(png.width - 1, x + radius); xx += 1) {
      total += 1;
      if (isGreyWhiteCheckerPixel(pixelAt(png, xx, yy))) checker += 1;
    }
  }
  return total ? checker / total : 0;
}

function hasMascotColoredNeighbor(png, x, y, radius = 2) {
  for (let yy = Math.max(0, y - radius); yy <= Math.min(png.height - 1, y + radius); yy += 1) {
    for (let xx = Math.max(0, x - radius); xx <= Math.min(png.width - 1, x + radius); xx += 1) {
      const p = pixelAt(png, xx, yy);
      if (p.a < 24) continue;
      const sat = saturation(p);
      const lum = luminance(p);
      if (sat > 0.12 && lum < 246) return true;
      if (lum < 150) return true;
    }
  }
  return false;
}

function cleanPng(inputPath, outputPath) {
  const png = PNG.sync.read(fs.readFileSync(inputPath));
  const out = new PNG({ width: png.width, height: png.height });
  png.data.copy(out.data);

  let transparentPixels = 0;
  let softenedPixels = 0;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const idx = (png.width * y + x) << 2;
      const pixel = pixelAt(png, x, y);
      const checker = isGreyWhiteCheckerPixel(pixel);
      const fringe = isVeryLightFringe(pixel);
      const checkerRatio = neighborCheckerRatio(png, x, y, 1);
      const coloredNeighbor = hasMascotColoredNeighbor(png, x, y, 2);

      if (checker && (!coloredNeighbor || checkerRatio >= 0.55)) {
        out.data[idx + 3] = 0;
        transparentPixels += 1;
        continue;
      }

      if (fringe && checkerRatio >= 0.45 && !coloredNeighbor) {
        out.data[idx + 3] = 0;
        transparentPixels += 1;
        continue;
      }

      if (fringe && checkerRatio >= 0.35 && coloredNeighbor) {
        out.data[idx + 3] = Math.min(out.data[idx + 3], 150);
        softenedPixels += 1;
      }
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, PNG.sync.write(out));

  return { width: png.width, height: png.height, transparentPixels, softenedPixels };
}

function toPublicPath(fullPath) {
  return `/${path.relative(path.join(rootDir, 'apps', 'web', 'public'), fullPath).replace(/\\/g, '/')}`;
}

function main() {
  const files = listPoseFiles();
  const map = {
    generatedAt: new Date().toISOString(),
    source: 'scripts/clean-ocean-pose-transparency.cjs',
    note: 'Original /poses files are preserved. UI should prefer /poses-clean files and use /poses only as fallback.',
    mascots: {},
  };

  let totalTransparentPixels = 0;
  let totalSoftenedPixels = 0;

  for (const item of files) {
    const stats = cleanPng(item.inputPath, item.outputPath);
    totalTransparentPixels += stats.transparentPixels;
    totalSoftenedPixels += stats.softenedPixels;
    const poseName = path.basename(item.file, '.png');
    map.mascots[item.mascot] ??= { folder: item.mascot, posesCleanDir: toPublicPath(item.outputDir), poses: {} };
    map.mascots[item.mascot].poses[poseName] = {
      source: toPublicPath(item.inputPath),
      clean: toPublicPath(item.outputPath),
      width: stats.width,
      height: stats.height,
      transparentPixels: stats.transparentPixels,
      softenedPixels: stats.softenedPixels,
    };
    console.log(`[clean-ocean-pose-transparency] ${item.mascot}/${item.file}: transparent=${stats.transparentPixels}, softened=${stats.softenedPixels}`);
  }

  fs.writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
  console.log(`[clean-ocean-pose-transparency] Cleaned ${files.length} pose files`);
  console.log(`[clean-ocean-pose-transparency] Transparent pixels: ${totalTransparentPixels}`);
  console.log(`[clean-ocean-pose-transparency] Softened edge pixels: ${totalSoftenedPixels}`);
  console.log(`[clean-ocean-pose-transparency] Map written: ${path.relative(rootDir, mapPath)}`);
}

main();
