import csv
import os
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path("_source/foundation48")
CSV = ROOT / "foundation48-folders.csv"
RAW = ROOT / "raw"
REPORT = ROOT / "reports" / "download-report.md"
SUMMARY = ROOT / "reports" / "download-summary.csv"

FILE_EXTS = [
    ".pdf",
    ".mp3",
    ".wav",
    ".m4a",
    ".aac",
    ".ogg",
    ".flac",
    ".mp4",
    ".mov",
    ".mkv",
    ".webm",
    ".docx",
    ".doc",
    ".pptx",
    ".ppt",
    ".xlsx",
    ".xls",
    ".txt",
    ".srt",
    ".vtt",
]

def safe_slug(text):
    text = text.lower()
    replacements = {
        "đ": "d",
        "á": "a", "à": "a", "ả": "a", "ã": "a", "ạ": "a",
        "ă": "a", "ắ": "a", "ằ": "a", "ẳ": "a", "ẵ": "a", "ặ": "a",
        "â": "a", "ấ": "a", "ầ": "a", "ẩ": "a", "ẫ": "a", "ậ": "a",
        "é": "e", "è": "e", "ẻ": "e", "ẽ": "e", "ẹ": "e",
        "ê": "e", "ế": "e", "ề": "e", "ể": "e", "ễ": "e", "ệ": "e",
        "í": "i", "ì": "i", "ỉ": "i", "ĩ": "i", "ị": "i",
        "ó": "o", "ò": "o", "ỏ": "o", "õ": "o", "ọ": "o",
        "ô": "o", "ố": "o", "ồ": "o", "ổ": "o", "ỗ": "o", "ộ": "o",
        "ơ": "o", "ớ": "o", "ờ": "o", "ở": "o", "ỡ": "o", "ợ": "o",
        "ú": "u", "ù": "u", "ủ": "u", "ũ": "u", "ụ": "u",
        "ư": "u", "ứ": "u", "ừ": "u", "ử": "u", "ữ": "u", "ự": "u",
        "ý": "y", "ỳ": "y", "ỷ": "y", "ỹ": "y", "ỵ": "y",
    }
    for a, b in replacements.items():
        text = text.replace(a, b)
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text.strip())
    return text[:80] or "lesson"

def count_files(out_dir):
    all_files = [p for p in out_dir.rglob("*") if p.is_file()]
    counts = {
        "totalFiles": len(all_files),
        "pdf": 0,
        "mp3": 0,
        "audio": 0,
        "video": 0,
        "doc": 0,
        "ppt": 0,
        "sheet": 0,
        "subtitle": 0,
        "other": 0,
    }

    for p in all_files:
        ext = p.suffix.lower()
        if ext == ".pdf":
            counts["pdf"] += 1
        elif ext == ".mp3":
            counts["mp3"] += 1
            counts["audio"] += 1
        elif ext in [".wav", ".m4a", ".aac", ".ogg", ".flac"]:
            counts["audio"] += 1
        elif ext in [".mp4", ".mov", ".mkv", ".webm"]:
            counts["video"] += 1
        elif ext in [".doc", ".docx"]:
            counts["doc"] += 1
        elif ext in [".ppt", ".pptx"]:
            counts["ppt"] += 1
        elif ext in [".xls", ".xlsx"]:
            counts["sheet"] += 1
        elif ext in [".srt", ".vtt"]:
            counts["subtitle"] += 1
        else:
            counts["other"] += 1

    return counts, all_files

def run_gdown(url, out_dir):
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUTF8"] = "1"

    cmd = [
        sys.executable,
        "-m",
        "gdown",
        "--folder",
        "--continue",
        "--no-cookies",
        url,
        "-O",
        str(out_dir),
    ]

    return subprocess.run(
        cmd,
        text=True,
        capture_output=True,
        timeout=1800,
        encoding="utf-8",
        errors="replace",
        env=env,
    )

rows = []
with CSV.open("r", encoding="utf-8-sig") as f:
    reader = csv.reader(f)
    for row in reader:
        if len(row) >= 3:
            rows.append({
                "day": int(row[0]),
                "title": row[1].strip(),
                "url": row[2].strip(),
            })

logs = []
summary_rows = []

for item in rows:
    day = item["day"]
    title = item["title"]
    url = item["url"]

    out_dir = RAW / f"day-{day:02d}-{safe_slug(title)}"
    out_dir.mkdir(parents=True, exist_ok=True)

    logs.append(f"## Day {day:02d} — {title}\n")
    logs.append(f"- URL: {url}\n")
    logs.append(f"- Output: `{out_dir}`\n")

    result = None
    for attempt in range(1, 4):
        logs.append(f"- Attempt: {attempt}\n")
        try:
            result = run_gdown(url, out_dir)
            logs.append(f"- Exit code: {result.returncode}\n")

            if result.stdout:
                logs.append("```txt\n" + result.stdout[-6000:] + "\n```\n")
            if result.stderr:
                logs.append("```txt\n" + result.stderr[-6000:] + "\n```\n")

            counts, files = count_files(out_dir)

            # Nếu đã có file thì không retry nữa, kể cả gdown exit code 1 do lỗi in tên file.
            if counts["totalFiles"] > 0:
                logs.append("- Download status: files detected, stop retry.\n")
                break

            time.sleep(2)
        except Exception as e:
            logs.append(f"- ERROR attempt {attempt}: {repr(e)}\n")
            time.sleep(2)

    counts, files = count_files(out_dir)

    logs.append(f"- Total files: {counts['totalFiles']}\n")
    logs.append(f"- PDF count: {counts['pdf']}\n")
    logs.append(f"- MP3 count: {counts['mp3']}\n")
    logs.append(f"- Audio count: {counts['audio']}\n")
    logs.append(f"- Video count: {counts['video']}\n")
    logs.append(f"- DOC/DOCX count: {counts['doc']}\n")
    logs.append(f"- PPT/PPTX count: {counts['ppt']}\n")
    logs.append(f"- XLS/XLSX count: {counts['sheet']}\n")
    logs.append(f"- Subtitle count: {counts['subtitle']}\n")

    if files:
        logs.append("- First files:\n")
        for p in files[:20]:
            logs.append(f"  - `{p}`\n")

    logs.append("\n")

    summary_rows.append([
        day,
        title,
        url,
        str(out_dir),
        counts["totalFiles"],
        counts["pdf"],
        counts["mp3"],
        counts["audio"],
        counts["video"],
        counts["doc"],
        counts["ppt"],
        counts["sheet"],
        counts["subtitle"],
    ])

REPORT.parent.mkdir(parents=True, exist_ok=True)
REPORT.write_text("\n".join(logs), encoding="utf-8")

with SUMMARY.open("w", encoding="utf-8-sig", newline="") as f:
    f.write("day,title,url,outDir,totalFiles,pdf,mp3,audio,video,doc,ppt,sheet,subtitle\n")
    for row in summary_rows:
        safe = []
        for cell in row:
            text = str(cell).replace('"', '""')
            safe.append(f'"{text}"')
        f.write(",".join(safe) + "\n")

print(f"Done.")
print(f"Report: {REPORT}")
print(f"Summary: {SUMMARY}")
