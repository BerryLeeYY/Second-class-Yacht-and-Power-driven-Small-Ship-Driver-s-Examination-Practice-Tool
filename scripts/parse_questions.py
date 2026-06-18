"""Parse yacht license question bank PDF text into structured JSON."""
import json
import re
from pathlib import Path

RAW = Path(__file__).resolve().parent.parent / "raw_text.txt"
OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "questions.json"

SECTIONS = [
    ("maritime", "海事法規", [
        ("crew_license", "船員證照資格等"),
        ("ship_survey", "船舶檢丈等"),
        ("pollution_smuggling", "汙染、走私、毒品等"),
        ("marine_conservation", "海洋保育"),
    ]),
    ("colregs", "避碰規則", [
        ("navigation_rules", "各種航法"),
        ("lights_signals", "燈號、號標、號笛、旗號"),
    ]),
    ("navigation", "航海常識", [
        ("driving_knowledge", "特殊性及駕駛知識與作為"),
        ("instruments", "航儀及航路標誌"),
    ]),
    ("weather", "氣（海）象常識", [
        ("weather_basics", "氣（海）象常識"),
    ]),
    ("engine", "船機常識", [
        ("engine_basics", "內燃機基本知識"),
        ("engine_operation", "操作運轉"),
        ("engine_maintenance", "維修保養故障排除"),
    ]),
    ("seamanship", "船藝與操船", [
        ("voyage_planning", "航行規劃與技術"),
        ("boat_knowledge", "小船之認識"),
        ("deck_equipment", "甲板設備與繩索"),
    ]),
    ("communication", "通訊與緊急措施", [
        ("emergency_response", "各種應變"),
        ("emergency_actions", "緊急對策"),
    ]),
]

QUESTION_RE = re.compile(
    r"\(\s*([A-D])\s*\)\s*(\d+)\s+(.+?)(?=\(\s*[A-D]\s*\)\s*\d+\s+|\Z)",
    re.DOTALL,
)
OPTION_RE = re.compile(r"\(([A-D])\)([^\(]+?)(?=\([A-D]\)|$)")


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def parse_options(body: str) -> tuple[str, dict[str, str]]:
    matches = list(OPTION_RE.finditer(body))
    if len(matches) < 4:
        return normalize(body), {}
    stem = normalize(body[: matches[0].start()])
    options: dict[str, str] = {}
    for m in matches:
        letter = m.group(1)
        if letter not in options:
            options[letter] = normalize(m.group(2))
    return stem, options


def find_section_context(lines: list[str], idx: int) -> tuple[str, str, str, str]:
    major_id = major_name = sub_id = sub_name = ""
    for i in range(idx, -1, -1):
        line = lines[i].strip()
        for mid, mname, subs in SECTIONS:
            if mname in line and len(line) < 30:
                major_id, major_name = mid, mname
                break
        for mid, mname, subs in SECTIONS:
            for sid, sname in subs:
                if sname in line and len(line) < 40:
                    sub_id, sub_name = sid, sname
                    if not major_id:
                        major_id, major_name = mid, mname
                    return major_id, major_name, sub_id, sub_name
    return major_id or "unknown", major_name or "未分類", sub_id or "unknown", sub_name or "未分類"


def main():
    text = normalize(RAW.read_text(encoding="utf-8"))
    lines = RAW.read_text(encoding="utf-8").splitlines()

    questions = []
    seen: set[tuple[str, int]] = set()

    for m in QUESTION_RE.finditer(text):
        answer = m.group(1).upper()
        num = int(m.group(2))
        body = m.group(3)
        stem, options = parse_options(body)
        if len(options) < 4:
            continue

        snippet = stem[:20]
        line_idx = 0
        for i, line in enumerate(lines):
            if snippet in line.replace(" ", ""):
                line_idx = i
                break

        major_id, major_name, sub_id, sub_name = find_section_context(lines, line_idx)
        key = (sub_id, num)
        if key in seen:
            continue
        seen.add(key)

        questions.append({
            "id": f"{sub_id}-{num}",
            "number": num,
            "categoryId": major_id,
            "category": major_name,
            "subcategoryId": sub_id,
            "subcategory": sub_name,
            "question": stem,
            "options": [{"key": k, "text": options[k]} for k in ["A", "B", "C", "D"]],
            "answer": answer,
        })

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(questions, ensure_ascii=False, indent=2), encoding="utf-8")

    by_cat: dict[str, int] = {}
    for q in questions:
        by_cat[q["category"]] = by_cat.get(q["category"], 0) + 1

    print(f"Parsed {len(questions)} questions")
    for cat, count in sorted(by_cat.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")


if __name__ == "__main__":
    main()
