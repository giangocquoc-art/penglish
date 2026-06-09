const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const ROOT = path.join("apps", "web", "public", "ocean", "mascots");
const MASCOTS = ["poo", "muc-mo", "rua-ri", "cua-quiz", "sua-nghe", "ca-ngua-toc", "sao-nhi"];

const PADDING = 28;
const MIN_AREA = 450;
const MERGE_DISTANCE = 80;

function isBackground(r, g, b, a) {
  if (a < 20) return true;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max - min;

  // white / gray / checkerboard-like preview background
  if (max > 228 && sat < 35) return true;
  if (r > 235 && g > 235 && b > 235) return true;
  if (r >= 175 && r <= 240 && Math.abs(r - g) < 14 && Math.abs(g - b) < 14) return true;

  return false;
}

function boxDistance(a, b) {
  const dx = Math.max(0, Math.max(a.x1 - b.x2, b.x1 - a.x2));
  const dy = Math.max(0, Math.max(a.y1 - b.y2, b.y1 - a.y2));
  return Math.max(dx, dy);
}

function mergeBoxes(boxes) {
  let changed = true;
  while (changed) {
    changed = false;
    const used = new Array(boxes.length).fill(false);
    const out = [];

    for (let i = 0; i < boxes.length; i++) {
      if (used[i]) continue;
      let m = { ...boxes[i] };
      used[i] = true;

      for (let j = 0; j < boxes.length; j++) {
        if (used[j]) continue;
        if (boxDistance(m, boxes[j]) <= MERGE_DISTANCE) {
          m = {
            x1: Math.min(m.x1, boxes[j].x1),
            y1: Math.min(m.y1, boxes[j].y1),
            x2: Math.max(m.x2, boxes[j].x2),
            y2: Math.max(m.y2, boxes[j].y2),
            area: m.area + boxes[j].area,
          };
          used[j] = true;
          changed = true;
        }
      }

      out.push(m);
    }

    boxes = out;
  }
  return boxes;
}

function cropPng(source, box) {
  const w = box.x2 - box.x1 + 1;
  const h = box.y2 - box.y1 + 1;
  const out = new PNG({ width: w, height: h });

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = box.x1 + x;
      const sy = box.y1 + y;
      const si = (source.width * sy + sx) << 2;
      const oi = (w * y + x) << 2;
      out.data[oi] = source.data[si];
      out.data[oi + 1] = source.data[si + 1];
      out.data[oi + 2] = source.data[si + 2];
      out.data[oi + 3] = source.data[si + 3];
    }
  }

  return out;
}

function splitFile(filePath, mascotName) {
  const buffer = fs.readFileSync(filePath);
  const png = PNG.sync.read(buffer);
  const { width, height, data } = png;

  const mask = new Uint8Array(width * height);
  const visited = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (width * y + x) << 2;
      const bg = isBackground(data[i], data[i + 1], data[i + 2], data[i + 3]);
      if (!bg) mask[width * y + x] = 1;
    }
  }

  let boxes = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const start = width * y + x;
      if (!mask[start] || visited[start]) continue;

      const stack = [[x, y]];
      visited[start] = 1;

      let x1 = x, y1 = y, x2 = x, y2 = y, area = 0;

      while (stack.length) {
        const [cx, cy] = stack.pop();
        area++;
        if (cx < x1) x1 = cx;
        if (cy < y1) y1 = cy;
        if (cx > x2) x2 = cx;
        if (cy > y2) y2 = cy;

        const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const ni = width * ny + nx;
          if (mask[ni] && !visited[ni]) {
            visited[ni] = 1;
            stack.push([nx, ny]);
          }
        }
      }

      if (area >= MIN_AREA) {
        boxes.push({ x1, y1, x2, y2, area });
      }
    }
  }

  boxes = mergeBoxes(boxes)
    .map((b) => ({
      x1: Math.max(0, b.x1 - PADDING),
      y1: Math.max(0, b.y1 - PADDING),
      x2: Math.min(width - 1, b.x2 + PADDING),
      y2: Math.min(height - 1, b.y2 + PADDING),
      area: b.area,
    }))
    .sort((a, b) => (a.y1 - b.y1) || (a.x1 - b.x1));

  const outDir = path.join(path.dirname(filePath), "poses");
  fs.mkdirSync(outDir, { recursive: true });

  const exported = [];
  boxes.forEach((box, idx) => {
    const crop = cropPng(png, box);
    const outName = `${mascotName}-pose-${String(idx + 1).padStart(2, "0")}.png`;
    const outPath = path.join(outDir, outName);
    fs.writeFileSync(outPath, PNG.sync.write(crop));

    const publicPath = "/" + outPath.replaceAll("\\", "/").split("public/").pop();
    exported.push({ file: outPath.replaceAll("\\", "/"), publicPath, box });
  });

  return exported;
}

function findPngFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== "poses") out.push(...findPngFiles(full));
    } else if (item.name.toLowerCase().endsWith(".png")) {
      out.push(full);
    }
  }
  return out;
}

const result = {};

for (const mascot of MASCOTS) {
  const dir = path.join(ROOT, mascot);
  const files = findPngFiles(dir);

  for (const file of files) {
    try {
      const exported = splitFile(file, mascot);
      if (exported.length) {
        result[file.replaceAll("\\", "/")] = exported;
        console.log(`OK: ${file} -> ${exported.length} poses`);
      } else {
        console.log(`SKIP: ${file} -> no poses`);
      }
    } catch (err) {
      console.error(`ERROR: ${file}`);
      console.error(err.message);
    }
  }
}

const mapPath = path.join(ROOT, "poses-map.json");
fs.writeFileSync(mapPath, JSON.stringify(result, null, 2), "utf8");
console.log("");
console.log(`DONE: wrote ${mapPath}`);
