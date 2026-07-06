# Catalog data build scripts

These scripts turn the source documents in `CCK Student Hub Docs/` into the
typed reference data under `packages/shared/src/data/`. The generated `.ts`
files are committed — you only re-run these when the source docs change.

## Setup

```sh
pip3 install python-docx openpyxl
```

## Run order

```sh
python3 build-catalog.py     # -> src/data/courses.ts   (+ .cache/courses.json)
python3 build-programs.py    # -> src/data/programs.ts  (reads .cache/courses.json)
python3 build-reference.py   # -> src/data/faculty.ts, src/data/equivalency.ts
```

`extract-docs.py` is a convenience that dumps every source doc to plain text
under `.cache/extracted/` — handy for reading the docs, not part of the build.

## What comes from where

| Generated file        | Source documents |
|-----------------------|------------------|
| `courses.ts`          | Courses Details.xlsx + Course Descriptions.docx + Major Sheets.xlsx (prereqs) |
| `programs.ts`         | Major Sheets.xlsx |
| `faculty.ts`          | Acadamic Staff Data.xlsx + Per-instructor Availability.xlsx + List With Offered Courses By Staff.xlsx |
| `equivalency.ts`      | Equivalency - Courses List - Update 2.xlsx |

`clubs.ts`, `it-helpdesk.ts`, and `src/constants/fees.ts` are hand-authored from
the department docs (small, stable policy data) — not generated.

## Known source-data issues

- **`CST8298` vs `CST8268`** — Courses Details.xlsx labels "Project" `CST8298`;
  Major Sheets and Course Descriptions both use `CST8268`. The build aliases to
  `CST8268` (two-source majority) so the degree-audit join holds.
- **33 courses have no Arabic name** — the IAWD `CST*` and IMD `MTM*` rows in
  Courses Details.xlsx leave `Arabic Name` as `-`. Left `null`, not fabricated.
- **`GED0002`** has no catalog description (only `GED0022` does).
- **IMD and BASc-CS** courses exist in the catalog but have no major sheet, so
  no degree plan is generated for them.
- **Installment split** — 4 of 5 worked examples in Course Installment
  Details.xlsx split the balance 50/25/25; the "Bachelor computer" sheet used
  equal thirds. `fees.ts` uses 50/25/25 pending Finance confirmation.
