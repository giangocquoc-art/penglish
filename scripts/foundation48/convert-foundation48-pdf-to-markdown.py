import json
import re
from pathlib import Path

import pymupdf4llm

PROJECT = Path(r"C:\Users\nltn0\OneDrive\Máy tính\PSVip_RELEASE_KH")
RAW = PROJECT / "_source" / "foundation48" / "raw-normalized"
MD_ROOT = PROJECT / "_source" / "foundation48" / "markdown"
REPORT = PROJECT / "_source" / "foundation48" / "reports" / "foundation48-convert-report.md"
INDEX = PROJECT / "_source" / "foundation48" / "foundation48-source-index.json"

def safe_name(name: str) -> str:
    name = name.lower()
    name = re.sub(r"[^\w\s-]", "", name, flags=re.UNICODE)
    name = re.sub(r"\s+", "-", name.strip())
    return name[:100] or "document"

def classify_pdf(filename: str) -> str:
    lower = filename.lower()
    if "đáp án" in lower or "dap an" in lower:
        return "answer"
    if "bài thi" in lower or "bài kiểm" in lower or "online" in lower or "test" in lower:
        return "test"
    return "lesson"

items = []
logs = []

for day_dir in sorted(RAW.glob("day-*")):
    if not day_dir.is_dir():
        continue

    m = re.search(r"day-(\d+)", day_dir.name)
    day = int(m.group(1)) if m else None

    out_day = MD_ROOT / day_dir.name
    out_day.mkdir(parents=True, exist_ok=True)

    pdfs = sorted(day_dir.rglob("*.pdf"))
    mp3s = sorted(day_dir.rglob("*.mp3"))
    mp4s = sorted(day_dir.rglob("*.mp4"))

    logs.append(f"## {day_dir.name}\n")
    logs.append(f"- PDF: {len(pdfs)}\n")
    logs.append(f"- MP3: {len(mp3s)}\n")
    logs.append(f"- MP4: {len(mp4s)}\n")

    pdf_items = []
    for pdf in pdfs:
        kind = classify_pdf(pdf.name)
        md_path = out_day / f"{kind}-{safe_name(pdf.stem)}.md"

        try:
            md = pymupdf4llm.to_markdown(str(pdf))
            md_path.write_text(md, encoding="utf-8")
            word_count = len(md.split())

            logs.append(f"- OK {kind}: `{pdf.name}` → `{md_path.name}`, words={word_count}\n")

            pdf_items.append({
                "kind": kind,
                "sourcePdf": str(pdf.relative_to(PROJECT)).replace("\\", "/"),
                "markdown": str(md_path.relative_to(PROJECT)).replace("\\", "/"),
                "wordCount": word_count,
                "needsReview": word_count < 30
            })
        except Exception as e:
            logs.append(f"- ERROR `{pdf.name}`: {repr(e)}\n")
            pdf_items.append({
                "kind": kind,
                "sourcePdf": str(pdf.relative_to(PROJECT)).replace("\\", "/"),
                "markdown": None,
                "wordCount": 0,
                "needsReview": True,
                "error": repr(e)
            })

    items.append({
        "dayNumber": day,
        "dayFolder": day_dir.name,
        "pdfCount": len(pdfs),
        "mp3Count": len(mp3s),
        "mp4Count": len(mp4s),
        "pdfs": pdf_items,
        "audioFiles": [str(p.relative_to(PROJECT)).replace("\\", "/") for p in mp3s],
        "videoFiles": [str(p.relative_to(PROJECT)).replace("\\", "/") for p in mp4s]
    })

    logs.append("\n")

MD_ROOT.mkdir(parents=True, exist_ok=True)
REPORT.parent.mkdir(parents=True, exist_ok=True)

REPORT.write_text("\n".join(logs), encoding="utf-8")
INDEX.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")

print("DONE")
print(f"Markdown: {MD_ROOT}")
print(f"Index: {INDEX}")
print(f"Report: {REPORT}")
