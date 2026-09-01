from PIL import Image
from pathlib import Path
import json

ROOT = Path("apps/web/public/ocean/mascots")
MIN_AREA_RATIO = 0.0012
PADDING = 32
MERGE_DISTANCE = 95

def is_background(r, g, b, a):
    if a < 20:
        return True

    mx = max(r, g, b)
    mn = min(r, g, b)
    sat = mx - mn

    # remove white / light gray / checkerboard preview background
    if mx > 230 and sat < 28:
        return True
    if r > 235 and g > 235 and b > 235:
        return True
    if 175 <= r <= 235 and abs(r-g) < 10 and abs(g-b) < 10:
        return True

    return False

def box_distance(a, b):
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    dx = max(0, max(ax1 - bx2, bx1 - ax2))
    dy = max(0, max(ay1 - by2, by1 - ay2))
    return max(dx, dy)

def merge_boxes(boxes):
    changed = True
    boxes = boxes[:]
    while changed:
        changed = False
        new_boxes = []
        used = [False] * len(boxes)

        for i, a in enumerate(boxes):
            if used[i]:
                continue

            merged = a
            used[i] = True

            for j, b in enumerate(boxes):
                if used[j]:
                    continue

                if box_distance(merged, b) <= MERGE_DISTANCE:
                    merged = (
                        min(merged[0], b[0]),
                        min(merged[1], b[1]),
                        max(merged[2], b[2]),
                        max(merged[3], b[3]),
                    )
                    used[j] = True
                    changed = True

            new_boxes.append(merged)

        boxes = new_boxes

    return boxes

def split_sheet(path: Path):
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    pix = img.load()

    mask = bytearray(w * h)
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if not is_background(r, g, b, a):
                mask[y * w + x] = 1

    visited = bytearray(w * h)
    min_area = max(350, int(w * h * MIN_AREA_RATIO))
    boxes = []

    for y in range(h):
        for x in range(w):
            idx = y * w + x
            if not mask[idx] or visited[idx]:
                continue

            stack = [(x, y)]
            visited[idx] = 1
            count = 0
            x1 = x2 = x
            y1 = y2 = y

            while stack:
                cx, cy = stack.pop()
                count += 1
                x1 = min(x1, cx)
                y1 = min(y1, cy)
                x2 = max(x2, cx)
                y2 = max(y2, cy)

                for nx, ny in ((cx+1, cy), (cx-1, cy), (cx, cy+1), (cx, cy-1)):
                    if 0 <= nx < w and 0 <= ny < h:
                        nidx = ny * w + nx
                        if mask[nidx] and not visited[nidx]:
                            visited[nidx] = 1
                            stack.append((nx, ny))

            if count >= min_area:
                boxes.append((x1, y1, x2, y2))

    boxes = merge_boxes(boxes)
    boxes = sorted(boxes, key=lambda b: (b[1], b[0]))

    out_dir = path.parent / "poses"
    out_dir.mkdir(exist_ok=True)

    prefix = path.parent.name
    exported = []

    for i, box in enumerate(boxes, 1):
        x1, y1, x2, y2 = box
        x1 = max(0, x1 - PADDING)
        y1 = max(0, y1 - PADDING)
        x2 = min(w, x2 + PADDING)
        y2 = min(h, y2 + PADDING)

        crop = img.crop((x1, y1, x2, y2))
        out_name = f"{prefix}-pose-{i:02d}.png"
        out_path = out_dir / out_name
        crop.save(out_path)

        exported.append({
            "file": str(out_path).replace("\\", "/"),
            "publicPath": "/" + str(out_path).replace("\\", "/").split("public/")[-1],
            "box": [x1, y1, x2, y2],
        })

    return exported

def main():
    results = {}

    sheets = []
    for p in ROOT.rglob("*.png"):
        if "poses" in p.parts:
            continue
        if "sheet" in p.name.lower() or p.parent.name in ["poo", "muc-mo", "rua-ri", "cua-quiz", "sua-nghe", "ca-ngua-toc", "sao-nhi"]:
            sheets.append(p)

    for sheet in sheets:
        try:
            exported = split_sheet(sheet)
            if exported:
                results[str(sheet).replace("\\", "/")] = exported
                print(f"OK: {sheet} -> {len(exported)} poses")
            else:
                print(f"SKIP: no poses found in {sheet}")
        except Exception as e:
            print(f"ERROR: {sheet}: {e}")

    map_path = ROOT / "poses-map.json"
    map_path.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    print("")
    print(f"DONE: wrote {map_path}")

if __name__ == "__main__":
    main()
