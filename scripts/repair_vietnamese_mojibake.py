from __future__ import annotations

import argparse
import re
from pathlib import Path

MOJIBAKE_MARKERS = ("Ã", "Â", "Ä", "Æ", "áº", "á»", "â€", "â€“", "â€”", "â€¢", "â€œ", "â€\u009d", "â€¦", "â\u00ad")
MOJI_RE = re.compile(r"Ã|Â|Ä|Æ|áº|á»|â€|â€“|â€”|â€¢|â€œ|â€\u009d|â€¦|â\u00ad")
STRING_RE = re.compile(r"(?P<prefix>['\"`])(?P<body>(?:\\.|(?!\1).)*?)(?P=prefix)", re.DOTALL)

# Windows-1252 bytes represented by their Unicode code points. This also handles
# C1 controls such as U+0090 in strings like "Ä\u0090" because those are literal
# Latin-1 byte values preserved in the source file.
CP1252_EXTRA = {
    "€": 0x80,
    "‚": 0x82,
    "ƒ": 0x83,
    "„": 0x84,
    "…": 0x85,
    "†": 0x86,
    "‡": 0x87,
    "ˆ": 0x88,
    "‰": 0x89,
    "Š": 0x8A,
    "‹": 0x8B,
    "Œ": 0x8C,
    "Ž": 0x8E,
    "‘": 0x91,
    "’": 0x92,
    "“": 0x93,
    "”": 0x94,
    "•": 0x95,
    "–": 0x96,
    "—": 0x97,
    "˜": 0x98,
    "™": 0x99,
    "š": 0x9A,
    "›": 0x9B,
    "œ": 0x9C,
    "ž": 0x9E,
    "Ÿ": 0x9F,
}


def mojibake_char_to_byte(ch: str) -> int | None:
    code = ord(ch)
    if code <= 0xFF:
        return code
    return CP1252_EXTRA.get(ch)


def decode_mojibake(candidate: str) -> str | None:
    data = bytearray()
    for ch in candidate:
        b = mojibake_char_to_byte(ch)
        if b is None:
            return None
        data.append(b)
    try:
        fixed = bytes(data).decode("utf-8")
    except UnicodeError:
        return None
    if "�" in fixed:
        return None
    # Do not convert legitimate Vietnamese words such as "Âm". A valid repair of
    # mojibake almost always removes marker characters from the decoded output.
    if fixed == candidate or MOJI_RE.search(fixed):
        return None
    return fixed


def repair_suspicious_runs(text: str) -> str:
    """Decode byte-like mojibake runs without touching normal Vietnamese.

    The first pass repairs pure high-byte runs, e.g. "áº¯" -> "ắ",
    "Ä\u0091" -> "đ", "â€”" -> "—". The second pass repairs larger words or
    phrases when they can be decoded safely as a whole, e.g. "Báº¯t" -> "Bắt".
    """
    if not MOJI_RE.search(text):
        return text

    # Pure byte runs are the most reliable and repair many mixed strings while
    # preserving surrounding ASCII text.
    byte_run = re.compile(r"[\u0080-\u00FF€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]+")
    text = byte_run.sub(lambda m: decode_mojibake(m.group(0)) or m.group(0), text)

    # Repair remaining mixed ASCII + byte phrases where a whole phrase can decode.
    # Boundaries avoid JSX/code delimiters, while keeping spaces and punctuation.
    mixed_run = re.compile(r"[^\n\r'\"`<>={}]*?(?:Ã|Â|Ä|Æ|áº|á»|â€|â€“|â€”|â€¢|â€œ|â€\u009d|â€¦|â\u00ad)[^\n\r'\"`<>={}]*")

    def repl(match: re.Match[str]) -> str:
        chunk = match.group(0)
        fixed = decode_mojibake(chunk)
        return fixed if fixed is not None else chunk

    return mixed_run.sub(repl, text)


def fix_text_segment(text: str) -> str:
    return repair_suspicious_runs(text)


def fix_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8-sig")

    # Run the safe byte-run repair over the whole file so JSX text children and
    # regex literals are covered too. The decoder only rewrites byte sequences
    # that can round-trip to UTF-8 without leaving mojibake markers, so valid
    # Vietnamese such as "Âm" or uppercase labels such as "CÂU" remain intact.
    fixed = fix_text_segment(original)

    def replace_literal(match: re.Match[str]) -> str:
        quote = match.group("prefix")
        body = match.group("body")
        fixed_body = fix_text_segment(body)
        return f"{quote}{fixed_body}{quote}"

    fixed = STRING_RE.sub(replace_literal, fixed)
    if fixed != original:
        path.write_text(fixed, encoding="utf-8", newline="")
        return True
    return False


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="+")
    args = parser.parse_args()
    changed = []
    for raw in args.paths:
        path = Path(raw)
        if fix_file(path):
            changed.append(str(path))
    print("changed=" + str(len(changed)))
    for item in changed:
        print(item)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
