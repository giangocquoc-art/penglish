import csv
import re
import subprocess
from pathlib import Path

ROOT = Path("_source/foundation48")
CSV = ROOT / "foundation48-folders.csv"
RAW = ROOT / "raw-rclone"
REPORT_DIR = ROOT / "reports"
REPORT = REPORT_DIR / "rclone-download-report.md"
SUMMARY = REPORT_DIR / "rclone-download-summary.csv"
REMOTE = "gdrive"

def extract_folder_id(url):
    m = re.search(r"/folders/([a-zA-Z0-9_-]+)", url)
    if not m:
        raise ValueError(f"Cannot extract folder id from: {url}")
    return m.group(1)

def safe_slug(text):
    text = text.lower()
    replacements = {
        "đ":"d","á":"a","à":"a","ả":"a","ã":"a","ạ":"a","ă":"a","ắ":"a","ằ":"a","ẳ":"a","ẵ":"a","ặ":"a","â":"a","ấ":"a","ầ":"a","ẩ":"a","ẫ":"a","ậ":"a",
        "é":"e","è":"e","ẻ":"e","ẽ":"e","ẹ":"e","ê":"e","ế":"e","ề":"e","ể":"e","ễ":"e","ệ":"e",
        "í":"i","ì":"i","ỉ":"i","ĩ":"i","ị":"i",
        "ó":"o","ò":"o","ỏ":"o","õ":"o","ọ":"o","ô":"o","ố":"o","ồ":"o","ổ":"o","ỗ":"o","ộ":"o","ơ":"o","ớ":"o","ờ":"o","ở":"o","ỡ":"o","ợ":"o",
        "ú":"u","ù":"u","ủ":"u","ũ":"u","ụ":"u","ư":"u","ứ":"u","ừ":"u","ử":"u","ữ":"u","ự":"u",
        "ý":"y","ỳ":"y","ỷ":"y","ỹ":"y","ỵ":"y"
    }
    for a,b in replacements.items():
        text = text.replace(a,b)
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text.strip())
    return text[:80] or "lesson"

def run(cmd):
    return subprocess.run(
        cmd,
        text=True,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
        timeout=7200,
    )

def count_files(folder):
    files = [p for p in folder.rglob("*") if p.is_file()]
    counts = {
        "total": len(files),
        "pdf": 0,
        "mp3": 0,
        "audio": 0,
        "video": 0,
        "doc": 0,
        "ppt": 0,
        "sheet": 0,
        "other": 0,
    }
    for p in files:
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
        else:
            counts["other"] += 1
    return counts, files

RAW.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)

rows = []
with CSV.open("r", encoding="utf-8-sig") as f:
    reader = csv.reader(f)
    for row in reader:
        if len(row) >= 3:
            rows.append({
                "day": int(row[0]),
                "title": row[1].strip(),
                "url": row[2].strip(),
                "folderId": extract_folder_id(row[2].strip())
            })

logs = []
summary = []

for item in rows:
    day = item["day"]
    title = item["title"]
    url = item["url"]
    folder_id = item["folderId"]
    out_dir = RAW / f"day-{day:02d}-{safe_slug(title)}"
    out_dir.mkdir(parents=True, exist_ok=True)

    day_log = REPORT_DIR / f"rclone-day-{day:02d}.log"

    logs.append(f"## Day {day:02d} — {title}\n")
    logs.append(f"- URL: {url}\n")
    logs.append(f"- Folder ID: {folder_id}\n")
    logs.append(f"- Output: `{out_dir}`\n")

    list_cmd = [
        "rclone", "lsf", f"{REMOTE}:",
        "--drive-root-folder-id", folder_id,
        "--recursive",
        "--files-only",
        "--format", "pst",
        "--drive-shared-with-me",
        "--drive-acknowledge-abuse"
    ]

    list_result = run(list_cmd)
    remote_files = [x for x in list_result.stdout.splitlines() if x.strip()]
    logs.append(f"- Remote visible files: {len(remote_files)}\n")

    copy_cmd = [
        "rclone", "copy", f"{REMOTE}:", str(out_dir),
        "--drive-root-folder-id", folder_id,
        "--drive-shared-with-me",
        "--drive-acknowledge-abuse",
        "--drive-export-formats", "pdf,docx,xlsx,pptx,txt",
        "--create-empty-src-dirs",
        "--transfers", "4",
        "--checkers", "8",
        "--retries", "8",
        "--low-level-retries", "30",
        "--stats", "15s",
        "--progress",
        "--log-file", str(day_log),
        "--log-level", "INFO"
    ]

    result = run(copy_cmd)
    logs.append(f"- Copy exit code: {result.returncode}\n")

    if result.stderr:
        logs.append("```txt\n" + result.stderr[-5000:] + "\n```\n")

    counts, files = count_files(out_dir)
    logs.append(f"- Local total files: {counts['total']}\n")
    logs.append(f"- PDF: {counts['pdf']}\n")
    logs.append(f"- MP3: {counts['mp3']}\n")
    logs.append(f"- Audio: {counts['audio']}\n")
    logs.append(f"- Video: {counts['video']}\n")
    logs.append(f"- DOC/DOCX: {counts['doc']}\n")
    logs.append(f"- PPT/PPTX: {counts['ppt']}\n")
    logs.append(f"- XLS/XLSX: {counts['sheet']}\n")
    logs.append(f"- Other: {counts['other']}\n")

    if counts["total"] < len(remote_files):
        logs.append(f"- WARNING: local files lower than remote visible files. Check `{day_log}`\n")

    logs.append("\n")

    summary.append([
        day, title, folder_id, url, len(remote_files),
        counts["total"], counts["pdf"], counts["mp3"], counts["audio"],
        counts["video"], counts["doc"], counts["ppt"], counts["sheet"],
        counts["other"], str(out_dir)
    ])

REPORT.write_text("\n".join(logs), encoding="utf-8")

with SUMMARY.open("w", encoding="utf-8-sig", newline="") as f:
    f.write("day,title,folderId,url,remoteVisibleFiles,localTotalFiles,pdf,mp3,audio,video,doc,ppt,sheet,other,outDir\n")
    for row in summary:
        f.write(",".join('"' + str(x).replace('"','""') + '"' for x in row) + "\n")

print("DONE")
print(f"Report: {REPORT}")
print(f"Summary: {SUMMARY}")
print(f"Raw: {RAW}")
