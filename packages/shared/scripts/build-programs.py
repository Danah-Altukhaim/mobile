#!/usr/bin/env python3
"""Parse Major Sheets.xlsx into structured degree plans for packages/shared.

Run after build-catalog.py (reads its .cache/courses.json).
"""
import os, re, json
import openpyxl

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
DOCS = os.path.join(REPO, 'CCK Student Hub Docs')
SHARED = os.path.join(REPO, 'packages', 'shared', 'src')
CACHE = os.path.join(os.path.dirname(__file__), '.cache')

CODE_RE = re.compile(r'\b([A-Z]{2,4})\s?(\d{4})\b')
CODE_ALIASES = {'CST8298': 'CST8268'}

def norm_code(raw):
    if raw is None:
        return None
    s = str(raw).strip().replace('​', '')
    m = CODE_RE.search(s.upper().replace(' ', ''))
    if not m:
        return None
    code = m.group(1) + m.group(2)
    return CODE_ALIASES.get(code, code)


CO_REQ_RE = re.compile(r'CO\s*-?\s*REQUISITE\s*:?', re.IGNORECASE)


def _codes(text, own_code):
    out = []
    for m in CODE_RE.finditer(str(text).replace('​', '').upper()):
        code = CODE_ALIASES.get(m.group(1) + m.group(2), m.group(1) + m.group(2))
        if code != own_code and code not in out:
            out.append(code)
    return out


def parse_prereqs(raw, own_code):
    """Pull course codes out of a PRE REQUISITE cell, in order, deduped.

    The major sheet lists requirements free-form: comma/&/and separated, with
    newlines and occasional "CO REQUISITE:" prefixes. Codes after a
    "CO REQUISITE:" marker are co-requisites, not prerequisites, so they are
    split out into a separate list. Returns (prerequisites, corequisites)."""
    if not raw:
        return [], []
    parts = CO_REQ_RE.split(str(raw), maxsplit=1)
    pre = _codes(parts[0], own_code)
    co = _codes(parts[1], own_code) if len(parts) > 1 else []
    # a code listed as a co-requisite is not also a prerequisite
    pre = [c for c in pre if c not in co]
    return pre, co

# sheet name -> (slug, level)
SHEETS = {
    'DIPLOMA-MAN. & ENTR.': ('diploma-management', 'diploma'),
    'DIPLOMA-MARKETING': ('diploma-marketing', 'diploma'),
    'DIPLOMA-ACCOUNTING': ('diploma-accounting', 'diploma'),
    'DIPLOMA-COMPUTER PROGRAMMING': ('diploma-cp', 'diploma'),
    'DIPLOMA-IAWD': ('diploma-iawd', 'diploma'),
    'BACHELOR-BUSINESS MAN. & ENTR.': ('bba-management', 'bachelor'),
    'BACHELOR-ACCOUNTING': ('bba-accounting', 'bachelor'),
    'BACHELOR-BME (MARKETING STREAM)': ('bba-marketing', 'bachelor'),
}
YEAR_WORDS = {'FIRST': 1, 'SECOND': 2, 'THIRD': 3, 'FOURTH': 4}

# Canonical English names — the source major sheets have typos ("Mamangement")
# and inconsistent wording; align to the program naming in Courses Details.xlsx.
NAME_OVERRIDES = {
    'diploma-management': 'Diploma of Business - Management & Entrepreneurship',
    'diploma-marketing': 'Diploma of Business - Marketing',
    'diploma-accounting': 'Diploma of Business - Accounting',
    'diploma-cp': 'Diploma of Computer Programming',
    'diploma-iawd': 'Diploma of Internet Applications & Web Development',
    'bba-management': 'Bachelor of Business Administration (BBA) - Management & Entrepreneurship',
    'bba-accounting': 'Bachelor of Business Administration (BBA) - Accounting',
    'bba-marketing': 'Bachelor of Business Administration (BBA) - Management & Entrepreneurship (Marketing Stream)',
}

# load catalog for cross-check
with open(os.path.join(CACHE, 'courses.json')) as f:
    catalog = {c['code']: c for c in json.load(f)}

wb = openpyxl.load_workbook(os.path.join(DOCS, 'Major Sheets.xlsx'), data_only=True)
programs = []
unknown_codes = []
credit_mismatches = []

for sheet in wb.worksheets:
    name = sheet.title.strip()
    if name not in SHEETS:
        print(f"  ! unmapped sheet: {name}")
        continue
    slug, level = SHEETS[name]
    rows = [[c for c in row] for row in sheet.iter_rows(values_only=True)]

    prog_name = None
    total_credits = None
    cur_year = None
    # semester number lives in the SEMESTER marker; left col + right col
    sem_left = sem_right = None
    semesters = {}  # number -> {year, courses:[], total_credits}
    collecting = False

    for row in rows:
        cells = ['' if c is None else str(c).strip() for c in row]
        joined = ' '.join(cells)
        b = cells[1] if len(cells) > 1 else ''

        if prog_name is None and b and 'Diploma' not in b[:1] and len(b) > 10 and (
            'Diploma' in b or 'Bachelor' in b):
            prog_name = re.sub(r'\s+', ' ', b)
            continue
        # program total
        mt = re.search(r'Program Total Credits:\s*(\d+)', joined)
        if mt:
            total_credits = int(mt.group(1))
            continue
        # year marker
        ym = re.match(r'(FIRST|SECOND|THIRD|FOURTH)\s+YEAR', b.upper())
        if ym:
            cur_year = YEAR_WORDS[ym.group(1)]
            continue
        # semester markers (left in B, right in G)
        g = cells[6] if len(cells) > 6 else ''
        ml = re.match(r'SEMESTER\s+(\d+)', b.upper())
        mr = re.match(r'SEMESTER\s+(\d+)', g.upper())
        if ml or mr:
            sem_left = int(ml.group(1)) if ml else None
            sem_right = int(mr.group(1)) if mr else None
            for s in (sem_left, sem_right):
                if s is not None:
                    semesters.setdefault(s, {'year': cur_year, 'courses': [],
                                             'prerequisites': {}, 'corequisites': {},
                                             'total_credits': 0})
            collecting = True
            continue
        if not collecting:
            continue
        # total row ends a semester block's accumulation but keep collecting next
        # course rows: left = idx1..4, right = idx6..9
        for code_i, cr_i, sem in ((1, 3, sem_left), (6, 8, sem_right)):
            if sem is None:
                continue
            code = norm_code(cells[code_i]) if len(cells) > code_i else None
            if not code:
                continue
            cr_raw = cells[cr_i] if len(cells) > cr_i else ''
            try:
                cr = int(float(cr_raw))
            except (ValueError, TypeError):
                cr = None
            if code not in semesters[sem]['courses']:
                semesters[sem]['courses'].append(code)
            if cr is not None:
                semesters[sem]['total_credits'] += cr
            prereq_i = code_i + 3
            prereqs, coreqs = parse_prereqs(
                cells[prereq_i] if len(cells) > prereq_i else '', code)
            if prereqs:
                semesters[sem]['prerequisites'][code] = prereqs
            if coreqs:
                semesters[sem]['corequisites'][code] = coreqs
            # cross-check
            if code not in catalog:
                unknown_codes.append((slug, sem, code))
            elif cr is not None and catalog[code]['credit_hours'] != cr:
                credit_mismatches.append(
                    (slug, code, f"sheet={cr} catalog={catalog[code]['credit_hours']}"))

    sem_list = [
        {'number': n, 'year': semesters[n]['year'],
         'courses': semesters[n]['courses'],
         'prerequisites': semesters[n]['prerequisites'],
         'corequisites': semesters[n]['corequisites'],
         'total_credits': semesters[n]['total_credits']}
        for n in sorted(semesters)
    ]
    computed_total = sum(s['total_credits'] for s in sem_list)
    programs.append({
        'slug': slug, 'level': level,
        'name_en': NAME_OVERRIDES.get(slug, prog_name or slug),
        'name_ar': None,
        'total_credits': total_credits or computed_total,
        'semesters': sem_list,
    })

# ---- emit programs.ts ----
def ts_str(v):
    return 'null' if v is None else json.dumps(v, ensure_ascii=False)

def ts_arr(v):
    return '[' + ', '.join(ts_str(x) for x in v) + ']'

def ts_prereqs(v):
    if not v:
        return '{}'
    return '{ ' + ', '.join(f'{ts_str(k)}: {ts_arr(x)}' for k, x in v.items()) + ' }'

lines = [
    '// AUTO-GENERATED from CCK Student Hub Docs — do not edit by hand.',
    '// Source: Major Sheets.xlsx',
    '// Regenerate: python3 packages/shared/scripts/build-programs.py',
    "import type { DegreeProgram } from '../types/catalog';",
    '',
    f'/** The {len(programs)} CCK degree plans with a published major sheet.',
    ' *  (Interactive Media Design and BASc Computer Science courses exist in',
    ' *  the catalog but have no semester plan in the source documents yet.) */',
    'export const PROGRAMS: DegreeProgram[] = [',
]
for p in programs:
    lines.append('  {')
    lines.append(f'    slug: {ts_str(p["slug"])},')
    lines.append(f'    level: {ts_str(p["level"])},')
    lines.append(f'    name_en: {ts_str(p["name_en"])},')
    lines.append(f'    name_ar: {ts_str(p["name_ar"])},')
    lines.append(f'    total_credits: {p["total_credits"]},')
    lines.append('    semesters: [')
    for s in p['semesters']:
        lines.append(
            f'      {{ number: {s["number"]}, year: {s["year"]}, '
            f'total_credits: {s["total_credits"]},')
        lines.append(f'        courses: {ts_arr(s["courses"])},')
        lines.append(f'        prerequisites: {ts_prereqs(s["prerequisites"])},')
        lines.append(f'        corequisites: {ts_prereqs(s["corequisites"])} }},')
    lines.append('    ],')
    lines.append('  },')
lines += [
    '];',
    '',
    'const BY_SLUG: Record<string, DegreeProgram> = Object.fromEntries(',
    '  PROGRAMS.map((p) => [p.slug, p]),',
    ');',
    '',
    '/** Look up a degree plan by its program slug. */',
    'export function getProgram(slug: string): DegreeProgram | undefined {',
    '  return BY_SLUG[slug];',
    '}',
    '',
    '/** Every course code in a program, flattened across all semesters. */',
    'export function programCourseCodes(slug: string): string[] {',
    '  const p = BY_SLUG[slug];',
    '  return p ? p.semesters.flatMap((s) => s.courses) : [];',
    '}',
    '',
]
with open(os.path.join(SHARED, 'data', 'programs.ts'), 'w') as f:
    f.write('\n'.join(lines))

print(f"Programs: {len(programs)}")
for p in programs:
    print(f"  {p['slug']:20s} {len(p['semesters'])} semesters, "
          f"total {p['total_credits']} cr  ({p['name_en']})")
print(f"\nunknown codes (in sheet, not in catalog): {len(unknown_codes)}")
for u in unknown_codes:
    print(f"  {u}")
print(f"\ncredit mismatches (sheet vs catalog): {len(credit_mismatches)}")
for m in sorted(set(credit_mismatches)):
    print(f"  {m}")
print("  -> wrote packages/shared/src/data/programs.ts")
