#!/usr/bin/env python3
"""Merge CCK catalog sources into structured JSON for packages/shared.

Run order: build-catalog.py -> build-programs.py -> build-reference.py
Requires: python-docx, openpyxl
"""
import os, re, json, glob
import docx, openpyxl

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
DOCS = os.path.join(REPO, 'CCK Student Hub Docs')
SHARED = os.path.join(REPO, 'packages', 'shared', 'src')
OUT = os.path.join(os.path.dirname(__file__), '.cache')
os.makedirs(OUT, exist_ok=True)

CODE_RE = re.compile(r'\b([A-Z]{2,4})\s?(\d{4})\b')

# Known code typos in source files. Courses Details.xlsx uses CST8298 for
# "Project"; Major Sheets.xlsx and Course Descriptions.docx both use CST8268.
# Canonicalize to the two-source majority so the degree-audit join holds.
CODE_ALIASES = {'CST8298': 'CST8268'}

def norm_code(raw):
    """Normalize a course code: strip spaces, apply known-typo aliases."""
    if raw is None:
        return None
    s = str(raw).strip().replace('​', '')
    m = CODE_RE.search(s.upper().replace(' ', ''))
    if not m:
        return None
    code = m.group(1) + m.group(2)
    return CODE_ALIASES.get(code, code)

# ---- program slugs ----
PROGRAM_SLUGS = {
    'Diploma of Business - Accounting': 'diploma-accounting',
    'Diploma of Business - Marketing': 'diploma-marketing',
    'Diploma of Business - Management & Entrepreneurship': 'diploma-management',
    'Diploma of Computer Programming': 'diploma-cp',
    'Diploma of Internet Applications and Web Development': 'diploma-iawd',
    'Diploma of Interactive Media design': 'diploma-imd',
    'Bachelor of Business Administration (BBA) - Accounting': 'bba-accounting',
    'Bachelor of Business Administration (BBA) - Management & Entrepreneurship': 'bba-management',
    'Bachelor of Business Administration (BBA) - Management & Entrepreneurship (Marketing Stream)': 'bba-marketing',
    'Bachelor of Apllied Science (BASc) in Computer Science - Computer Programming': 'basc-cs',
}
# normalize whitespace in keys so double-spaces in source still match
PROGRAM_SLUGS = {re.sub(r'\s+', ' ', k): v for k, v in PROGRAM_SLUGS.items()}
def prog_slug(raw):
    if not raw:
        return None
    raw = re.sub(r'\s+', ' ', str(raw).strip())
    return PROGRAM_SLUGS.get(raw, raw)

def norm_type(raw):
    s = (raw or '').strip().lower()
    has_lec = 'lecture' in s
    has_lab = 'lab' in s
    if has_lec and has_lab: return 'lecture_lab'
    if has_lab: return 'lab'
    if has_lec: return 'lecture'
    return 'unknown'

def norm_lang(raw):
    s = (raw or '').strip().lower()
    if s in ('english', 'en'): return 'en'
    if s in ('arabic', 'ar'): return 'ar'
    if not s or s == '-': return 'unknown'
    # "English & Arabic", "Bilangual", "ALL"
    return 'bilingual'

# ---- 1. Courses Details.xlsx = canonical catalog ----
wb = openpyxl.load_workbook(os.path.join(DOCS, 'Courses Details.xlsx'), data_only=True)
ws = wb.active
catalog = {}  # code -> entry
for row in ws.iter_rows(min_row=2, values_only=True):
    code_raw, name_en, name_ar, credits, ctype, lang, major = (list(row) + [None]*7)[:7]
    code = norm_code(code_raw)
    if not code:
        continue
    name_en = (name_en or '').strip()
    name_ar = (name_ar or '').strip()
    if name_ar in ('-', ''):
        name_ar = None
    slug = prog_slug(major)
    if code not in catalog:
        catalog[code] = {
            'code': code,
            'name_en': name_en,
            'name_ar': name_ar,
            'credit_hours': int(credits) if isinstance(credits, (int, float)) else None,
            'course_type': norm_type(ctype),
            'language': norm_lang(lang),
            'programs': [],
            'description_en': None,
            'prerequisites': [],
        }
    e = catalog[code]
    if slug and slug not in e['programs']:
        e['programs'].append(slug)
    # fill missing bilingual name / type / lang from later rows
    if not e['name_ar'] and name_ar:
        e['name_ar'] = name_ar
    if e['course_type'] == 'unknown' and norm_type(ctype) != 'unknown':
        e['course_type'] = norm_type(ctype)
    if e['language'] == 'unknown' and norm_lang(lang) != 'unknown':
        e['language'] = norm_lang(lang)
    if e['credit_hours'] is None and isinstance(credits, (int, float)):
        e['credit_hours'] = int(credits)

# ---- 2. Course Descriptions.docx -> description + prereq text ----
d = docx.Document(os.path.join(DOCS, 'Course Descriptions.docx'))
# code may be followed by space or hyphen ("GEN2003-Healthy Lifestyle")
desc_line_re = re.compile(r'^([A-Z]{2,4}\s?\d{4})[-\s\t]+(.+?)[\s\t]+(\d+)\s+Credits?\s*$')
cur = None
descriptions = {}  # code -> {title, credits, desc}
for para in d.paragraphs:
    line = re.sub(r'[ \t]+', ' ', para.text.strip())
    if not line:
        continue
    # skip combined-header lines listing several slash-joined codes
    # ("GED2234/GED0022/GEN2003 General Education Elective")
    if re.match(r'^([A-Z]{2,4}\s?\d{4}\s*/\s*)+[A-Z]{2,4}\s?\d{4}\b', line):
        cur = None
        continue
    m = desc_line_re.match(line)
    if m:
        code = norm_code(m.group(1))
        cur = code
        descriptions[code] = {'title': m.group(2).strip(), 'credits': int(m.group(3)), 'desc': ''}
        continue
    # header detection: no lowercase letters at all -> section header, reset
    if not any(c.islower() for c in line):
        cur = None
        continue
    if cur:
        descriptions[cur]['desc'] += (' ' if descriptions[cur]['desc'] else '') + line

PREREQ_RE = re.compile(r'Prerequisite\(s\)\s*:?\s*(.+?)(?:\.|$)', re.IGNORECASE)
def parse_prereqs(text):
    if not text:
        return []
    m = PREREQ_RE.search(text)
    if not m:
        return []
    codes = []
    for cm in CODE_RE.finditer(m.group(1).upper().replace(' ', '')):
        c = cm.group(1) + cm.group(2)
        if c not in codes:
            codes.append(c)
    return codes

for code, info in descriptions.items():
    if code in catalog:
        catalog[code]['description_en'] = info['desc'] or None

# ---- 3. Major Sheets.xlsx -> structured prerequisites ----
wb2 = openpyxl.load_workbook(os.path.join(DOCS, 'Major Sheets.xlsx'), data_only=True)
prereq_map = {}  # code -> set of prereq codes
for sheet in wb2.worksheets:
    for row in sheet.iter_rows(values_only=True):
        cells = [str(c).strip() if c is not None else '' for c in row]
        # rows look like: '', COURSE, TITLE, CR, PRE, '', COURSE, TITLE, CR, PRE
        for base in (1, 6):
            if base + 3 < len(cells):
                code = norm_code(cells[base])
                prereq_cell = cells[base + 4] if base + 4 < len(cells) else ''
                if code:
                    found = set()
                    for cm in CODE_RE.finditer(prereq_cell.upper().replace(' ', '')):
                        found.add(cm.group(1) + cm.group(2))
                    if found:
                        prereq_map.setdefault(code, set()).update(found)

# merge prereqs: prefer major-sheet structured, fall back to description text
for code, e in catalog.items():
    prereqs = set(prereq_map.get(code, set()))
    if not prereqs and code in descriptions:
        prereqs.update(parse_prereqs(descriptions[code]['desc']))
    # drop self-references and unknown codes are kept (may be cross-program)
    prereqs.discard(code)
    e['prerequisites'] = sorted(prereqs)

# ---- 4. add description-only courses (in catalog docx but missing from xlsx) ----
for code, info in descriptions.items():
    if code not in catalog:
        catalog[code] = {
            'code': code,
            'name_en': info['title'],
            'name_ar': None,
            'credit_hours': info['credits'],
            'course_type': 'unknown',
            'language': 'unknown',
            'programs': [],
            'description_en': info['desc'] or None,
            'prerequisites': sorted(set(parse_prereqs(info['desc']))),
        }

# ---- report ----
courses = sorted(catalog.values(), key=lambda x: x['code'])
missing_ar = [c['code'] for c in courses if not c['name_ar']]
missing_desc = [c['code'] for c in courses if not c['description_en']]
missing_credit = [c['code'] for c in courses if c['credit_hours'] is None]
desc_only = sorted(set(descriptions) - set(catalog))

with open(os.path.join(OUT, 'courses.json'), 'w') as f:
    json.dump(courses, f, ensure_ascii=False, indent=2)

# ---- emit packages/shared/src/data/courses.ts ----
def ts_str(v):
    if v is None:
        return 'null'
    return json.dumps(v, ensure_ascii=False)

def ts_arr(v):
    return '[' + ', '.join(ts_str(x) for x in v) + ']'

lines = [
    '// AUTO-GENERATED from CCK Student Hub Docs — do not edit by hand.',
    '// Sources: Courses Details.xlsx + Course Descriptions.docx + Major Sheets.xlsx',
    '// Regenerate: python3 packages/shared/scripts/build-catalog.py',
    "import type { CatalogCourse } from '../types/catalog';",
    '',
    f'/** The CCK course catalog — {len(courses)} courses across 10 programs. */',
    'export const COURSES: CatalogCourse[] = [',
]
for c in courses:
    fields = [
        f'code: {ts_str(c["code"])}',
        f'name_en: {ts_str(c["name_en"])}',
        f'name_ar: {ts_str(c["name_ar"])}',
        f'credit_hours: {c["credit_hours"]}',
        f'course_type: {ts_str(c["course_type"])}',
        f'language: {ts_str(c["language"])}',
        f'programs: {ts_arr(c["programs"])}',
        f'prerequisites: {ts_arr(c["prerequisites"])}',
        f'description_en: {ts_str(c["description_en"])}',
    ]
    lines.append('  { ' + ', '.join(fields) + ' },')
lines += [
    '];',
    '',
    'const BY_CODE: Record<string, CatalogCourse> = Object.fromEntries(',
    '  COURSES.map((c) => [c.code, c]),',
    ');',
    '',
    '/** Look up a single catalog course by its code (e.g. "ACC2201"). */',
    'export function getCourse(code: string): CatalogCourse | undefined {',
    '  return BY_CODE[code];',
    '}',
    '',
    "/** All catalog courses belonging to a given program slug. */",
    'export function coursesByProgram(program: string): CatalogCourse[] {',
    '  return COURSES.filter((c) => c.programs.includes(program as never));',
    '}',
    '',
]
os.makedirs(os.path.join(SHARED, 'data'), exist_ok=True)
with open(os.path.join(SHARED, 'data', 'courses.ts'), 'w') as f:
    f.write('\n'.join(lines))

print(f"Catalog: {len(courses)} courses")
print(f"  -> wrote packages/shared/src/data/courses.ts")
print(f"  missing name_ar ({len(missing_ar)}): {missing_ar}")
print(f"  missing description ({len(missing_desc)}): {missing_desc}")
print(f"  missing credit_hours ({len(missing_credit)}): {missing_credit}")
print(f"  in descriptions but not catalog ({len(desc_only)}): {desc_only}")
print(f"  programs seen: {sorted(set(p for c in courses for p in c['programs']))}")
print(f"  with prereqs: {sum(1 for c in courses if c['prerequisites'])}")
