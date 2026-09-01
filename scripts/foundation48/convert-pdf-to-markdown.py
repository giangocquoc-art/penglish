import json
import re
from pathlib import Path

import pymupdf4llm

ROOT = Path("_source/foundation48")
RAW = ROOT / "raw"
MD_ROOT = ROOT / "markdown"
REPORT = ROOT / "reports" / "pdf-to-markdown-report.md"
JSON_OUT = ROOT / "foundation48-pdf-index.json"

def clean_name(s):
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE)
    s = re.sub(r"\s+", "-", s.strip().lower())
    return s[:100] or "pdf"

index = []
logs = []

for day_dir in sorted(RAW.glob("day-*")):
    if not day_dir.is_dir():
        continue

    day_match = re.search(r"day-(\d+)", day_dir.name)
    day = int(day_match.group(1)) if day_match else None
    out_day = MD_ROOT / day_dir.name
    out_day.mkdir(parents=True, exist_ok=True)

    pdfs = sorted(day_dir.rglob("*.pdf"))
    logs.append(f"## {day_dir.name}\n")
    logs.append(f"- PDF files: {len(pdfs)}\n")

    day_items = []
    for pdf in pdfs:
        rel = pdf.relative_to(ROOT)
        md_name = clean_name(pdf.stem) + ".md"
        md_path = out_day / md_name

        try:
            md = pymupdf4llm.to_markdown(str(pdf))
            md_path.write_text(md, encoding="utf-8")
            word_count = len(md.split())
            ok = word_count > 20
            logs.append(f"- OK `{rel}` → `{md_path.relative_to(ROOT)}` words={word_count}\n")
            day_items.append({
                "sourcePdf": str(rel).replace("\\", "/"),
                "markdown": str(md_path.relative_to(ROOT)).replace("\\", "/"),
                "wordCount": word_count,
                "needsOcrReview": not ok
            })
        except Exception as e:
            logs.append(f"- ERROR `{rel}`: {repr(e)}\n")
            day_items.append({
                "sourcePdf": str(rel).replace("\\", "/"),
                "markdown": None,
                "wordCount": 0,
                "needsOcrReview": True,
                "error": repr(e)
            })

    index.append({
        "dayNumber": day,
        "dayFolder": day_dir.name,
        "items": day_items
    })
    logs.append("\n")

MD_ROOT.mkdir(parents=True, exist_ok=True)
REPORT.parent.mkdir(parents=True, exist_ok=True)
REPORT.write_text("\n".join(logs), encoding="utf-8")
JSON_OUT.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")

print(f"Done. Markdown root: {MD_ROOT}")
print(f"Index: {JSON_OUT}")
print(f"Report: {REPORT}")
