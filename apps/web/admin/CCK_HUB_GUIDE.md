# CCK-Hub Admin — Feature Guide

A side-by-side reference: every requirement in **CCK Hub Update.pdf** mapped to the page in the admin website that fulfils it.

---

## How to log in

The admin site mocks SSO with three pre-seeded accounts. All passwords are `admin123`.

| Email | Role | Best for testing |
|---|---|---|
| `dean@cck.edu.kw` | Super Admin | Full access — every workflow + analytics + settings |
| `registrar@cck.edu.kw` | Registration Staff | Requests inbox, withdrawal flows, student warnings |
| `admission@cck.edu.kw` | Admission Staff | Admissions queue, FA screen ("My courses" auto-filters to this user) |

Open <http://localhost:3041/login>, type the email, hit "Sign In" — or click **Quick demo login** (signs in as `registrar@cck.edu.kw`).

Toggle EN ↔ AR via the globe icon at the bottom of the sidebar. The whole UI flips RTL/LTR per the project rule.

---

## Sidebar map

```
Workflows
├── Staff Dashboard         /              ← home
├── Requests                /requests
├── Admissions              /admissions
├── Social Allowance        /social-allowance
├── Appeals                 /appeals
├── FA Screen               /fa-screen
├── Academic Warnings       /warnings
├── Complaints & Suggestions /feedback
├── Sport Discounts         /sport
└── Contact Directory       /directory

Analytics       (engagement, retention, payments, AI advisor)
Management      (communications, users)
Config          (settings, audit log)
```

---

## PDF requirement → admin location

### 1. Student Self-Service & E-Forms Portal *(overview)*

> Students submit requests online → forms auto-validated → admin processes them.

**Admin location:** `/requests` — the central inbox for every student-submitted e-form.

What you can do:
- Filter by request type, status, or search by student name / ID / request #
- Click **Open** on any row to drill into `/requests/[id]`
- Detail page shows: workflow steps, uploaded attachments, comments thread, payment status, assigned staff
- Actions: Assign to me · Mark In Progress · Mark Completed · Send notification email · Cancel request

The 12 supported request types are listed below, all reachable from the same inbox.

---

### 2. TWIMC Workflow Sample

> Creation by student → online payment → registration assignment → in-progress / completed → automated email.

**Admin location:** `/requests` filtered by **TWIMC Letter** (`requestType.twimc`).

How the PDF flow maps to the UI on `/requests/[id]`:
1. Student submits → row appears with status **Pending**, `assignedTo = Unassigned`
2. Online payment → `paymentStatus` shows **Paid online** in the right-hand sidebar
3. Registration staff clicks **Assign to me** → name fills in
4. Workflow step "Assigned to Registration" turns green
5. Comments box at the bottom captures the internal note
6. **Mark Completed** button advances status; **Send notification email** triggers the student email (toast confirms)

---

### 3. Semester Withdrawal Request

> Student uploads signed form → advisor feedback → finance approval → PUC docs (if sponsored) → registration handles it.

**Admin location:** `/requests` filtered by **Semester Withdrawal** (`requestType.semester_withdrawal`).

The detail page's workflow stepper renders all 5 stages exactly as the PDF lists them:
1. Form submitted by student
2. Advisor feedback
3. Finance approval
4. PUC documents (if sponsored) — `نموذج تجميد بعثة + نموذج إيقاف قيد`
5. Registration processing

Try **REQ-2026-0433** (Khalid Al-Rashidi) for a request currently sitting at the PUC step with attachments and an advisor comment already logged.

---

### 4. College Withdrawal Request

> Same structure as semester withdrawal + cancellation option + PUC scholarship-cancel form.

**Admin location:** `/requests` filtered by **College Withdrawal** (`requestType.college_withdrawal`).

Try **REQ-2026-0436** (Fatima Al-Sabah). The detail page exposes a **Cancel request** button (red) per the PDF's "Option for assigned to a member of staff to cancel the request."

---

### 5. Letters to PUC — إعانة تقاضي / عدم تقاضي

**Admin location:** `/requests` filtered by **PUC Letter (Tuition Aid)** or **PUC Letter (No Aid)** (`requestType.puc_letter` / `requestType.puc_no_aid`).

The detail page's attachments section is where the student's uploaded Civil ID lives; status updates trigger the same email-notification flow as TWIMC.

---

### 6. TWIMC Letter for Student Account Balance

**Admin location:** `/requests` filtered by **TWIMC — Account Balance** (`requestType.twimc_balance`).

Same in-progress → completed flow as the standard TWIMC letter; no payment required.

---

### 7. Excused Absence System

> Student logs in → policy displayed → Registration approves → excuse auto-applied to courses in SIS → email to student. Rejection → email with reason.

**Admin location:** `/requests` filtered by **Excused Absence** (`requestType.absence_excuse`).

The 3-step workflow on the detail page:
1. Excuse + medical doc submitted
2. Registration review
3. Excuse applied to courses in SIS

Try **REQ-2026-0434** (Lina Al-Otaibi) — newly submitted with a medical report attached.

> ⚠️ **Open polish item:** rejection currently uses the comment box for the reason. The PDF asks for an automated email with the reason on rejection — this is a one-line addition to make the comment required when cancelling. Flag this if you'd like it tightened.

---

### 8. Staff Dashboard (Registration Staff)

> Tasks icons / lists, tasks assigned to staff, workflow status, alerts deadlines, automated emails.

**Admin location:** `/` — the home page after login.

Layout:
- **Top stats row:** Assigned to me · Open items · Due today · Overdue · Completed this week
- **Workflow status table:** every queue (Requests, Admissions, Social Allowance, Appeals, FA, Feedback) with In-Progress / Pending / Completed counts and a deep-link **Open queue**
- **Deadline alerts:** any request older than 4 days surfaces here; >5 days flips to red "overdue"
- **Recent activity:** running log of the last actions across all queues

---

### 9. Admission-Registration Workflow

> Admission staff creates new student file → category dropdown (Self-funded / PUC sponsored / Other / TC) → TC student flow (Admission → Academic → back to Admission → Registration) → Entry Level from Placement Test → 9 required documents with auto-validation → Acceptance Letter → Registration generates SIS Student ID → comments at every step.

**Admin location:** `/admissions`

Left side = applicant queue with category badges; right side = detail panel showing:
- **Category** (with TC's `transferred_from` field surfaced when applicable)
- **Major** · **Semester admitted** · **Entry Level** (from Placement Test)
- **Workflow stage** badge — one of *Admission Review · Academic Review (TC) · Admission Approval · Registration Enrolment · Completed*
- **Documents checklist** — all 9 items from the PDF, each with a coloured dot:
  - 🟢 Uploaded — 🟡 Quality issue — 🔴 Missing
  - List: Civil ID · Passport · Equivalency from PAAET / University · High School Certificate · Father's Civil ID · Declaration Form (إقرار وتعهد) · Payment Proof — 150 KWD · PUC Declaration · Placement Test Result
- **Decision panel** at bottom: comment field (required), **Approve** / **Reject** buttons, plus **Generate Acceptance Letter** (disabled until docs are clean)

Sample applicants:
- **ADM-2026-103** Dana Al-Khalifa — TC student transferred from Kuwait University; sitting in Academic Review
- **ADM-2026-101** Hessa Al-Mansour — at Admission Approval, missing PUC Declaration and a flagged Placement Test
- **ADM-2026-104** Talal Al-Kandari — Completed; acceptance letter generated

---

### 10. Social Allowance

> A screen for new and existing students to apply, categorised. Per-category required documents. Quality check on each upload. Status pending / in-progress / rejected / completed. Automated email + send to PUC.

**Admin location:** `/social-allowance`

Top filter chips switch between the four PDF categories + Bank Change. Each application card shows:
- Application # · Student name + ID · Category badge
- Status badge (Pending · In Progress · Rejected · Completed) and **Sent to PUC** badge when applicable
- Per-category required-document list (🟢 Acceptable · 🔴 Re-upload required) — exactly the docs from the PDF for each category:

| Category | Required documents |
|---|---|
| **Kuwaiti Student** | Civil ID · Social Security Cert (Sahel) · Ministry of Social Affairs Cert (Sahel) · Salary Transfer Cert |
| **Son/Daughter of Kuwaiti Mother** | Civil ID · Manpower Cert · Social Affairs Cert · Mother Nationality (Sahel) · Mother Civil ID · Birth Cert · Salary Transfer · TWIMC for Mother |
| **Disabled Student** | Disability Certificate — PADP |
| **Married Student** | Marriage Cert · Marriage Continuity · Wife Civil ID |
| **Bank Change** | Civil ID · Salary Transfer · CCK Change-of-Bank-Details Form |

Action buttons per card: **Mark In Progress** (disabled if any quality issue) · **Mark Completed** · **Mark as sent to PUC** · **Reject**.

---

### 11. Change of Bank Details for Allowance

**Admin location:** `/social-allowance` → filter chip **Change of Bank Details**.

Same UI as social allowance, separate document checklist as above.

---

### 12. Appeals

> Tab activated after release of results. Student downloads Appeal Form → fills → uploads → submitted → routed to designated faculty.

**Admin location:** `/appeals`

Top of page has a **Results release** banner with a toggle:
- *Released — appeals open* (green)
- *Not released — appeals locked* (grey)

Below is the appeal queue: course code, current grade, assigned faculty, submission date. Try toggling the release status — that's the gate the PDF describes.

---

### 13. Student ID

The PDF lists two Student-ID services:

**a. Lost Student ID** (`requestType.lost_id`)
- Flow: student → Finance → IT → Registration → email to student
- **Admin location:** `/requests` filter **Lost Student ID**
- Try **REQ-2026-0439** — workflow stepper shows "Finance — replacement fee" completed, "IT prints new card" current

**b. Update Student ID Photo** (`requestType.update_id_photo`)
- **Admin location:** same `/requests` inbox

---

### 14. Contact Numbers Directory

> Contains all emails of Faculties / Departments.

**Admin location:** `/directory`

Read-only table of department contacts (Registration · Admission · Finance · Student Life · IT · Faculty of Business · Faculty of Engineering Tech). Email column is `mailto:` linked.

---

### 15. Academic announcements to a specific class

> Academic can send a message to students within a specific class.

**Admin location:** `/communications` *(existing analytics module — pre-CCK rebrand)*

> ⚠️ **Open polish item:** the page currently targets *all_students / at_risk / freshmen / graduating* with major/year filters, but doesn't yet have **per-course-section** targeting. This is a one-screen extension if you want it added.

---

### 16. Complaints

> A dedicated screen — students submit directly to the relevant department, comments box with tracking until resolved.

**Admin location:** `/feedback` → **Complaints** tab.

Each entry shows: subject · body · routed-to department · tracking ID · status (open · in-progress · resolved). **Mark resolved** button per entry.

---

### 17. Suggestions

**Admin location:** `/feedback` → **Suggestions** tab.

Same model as Complaints; routed to the relevant department, tracked through to resolved.

---

### 18. Industrial Certificate

> Admission team creates a request → Registration prepares letter to PUC.

**Admin location:** `/requests` filtered by **Industrial Certificate** (`requestType.industrial_cert`).

Try **REQ-2026-0438** (Saad Al-Hajri) — currently in progress with an industrial certificate PDF attached and a comment from Admission ("Forwarded to Registration to draft PUC acceptance letter").

> ⚠️ **Open polish item:** the PDF wants the Admission team to *create* this request. Today it's modelled as a student request type; turning it into an admin-initiated entry from `/admissions` is a small addition.

---

### 19. Academic Warning

> Student with academic warning gets pop-up + email → must visit Registration to be advised and sign warning notice.

**Admin location:** `/warnings`

Table of students under warning: name · GPA · warning semester · notification date. Per row:
- If signed: green badge **✓ Signed · {date}**
- If not signed: **Mark as signed** (green) and **Re-send notification** (grey) buttons

The pop-up + email on the student side is mobile-app territory; this is the registration-staff side that captures the in-office sign-off.

---

### 20. FA (Fail for Absence) Screen

> Each academic staff sees their courses → all students with FA → attendance % + total + per-assessment scores + total grade → SIS-linked profile → faculty chooses **Remove Absence** OR **Admit FA** → both flow to Registration → email warning generated via SIS link.

**Admin location:** `/fa-screen`

Matches the PDF spec point-for-point:
- **Top toggle:** *My courses* (default — auto-filters to the signed-in instructor's sections) vs *All courses*
- **Per-course tables** grouped by section + instructor
- Columns: student (with `→ View academic profile` link to `/retention/[id]`) · attendance % (red <65) · absences · per-assessment scores · total grade · decision
- Decision buttons: **Remove Absence** (green) and **Admit FA** (red)
- After either decision: row shows the action *plus* `→ Go to Registration` (matches the diagram in the PDF)
- After **Admit FA** specifically: extra row badge `✉ Warning email sent via SIS link`

Login as `admission@cck.edu.kw` (Ahmed Al-Ghamdi) to see the My-courses scope auto-filter to BUS 201 + BUS 305.

---

### 21. Sport Students

> Apply for sport-related discount → upload club ID / proof → routed to Student Life.

**Admin location:** `/sport`

Queue listing: student · activity / club · proof document · discount % · status. Per row: **Approve discount** (green) or **Reject** (red). Sample row sp1 (Yousef Al-Mutairi, Kuwait national youth team) is sitting at pending awaiting decision.

---

## Open polish items — at-a-glance

The audit (see chat history) flagged four small enhancements on top of full PDF coverage:

1. **Rejection reason for excused absence** — make the comment box required when cancelling, then surface it in the notification email.
2. **Per-class targeting in `/communications`** — add a "by course section" target option for academic-staff announcements.
3. **Admission-initiated Industrial Certificate** — add a "Create Industrial Cert request" button on `/admissions` detail.
4. **Per-stage comment log in admissions** — record the comment alongside every stage transition, not just the final approve/reject.

Each is a focused, single-page addition. Ping when you want any of them done.

---

## Where things live in the codebase

```
apps/web/admin/src/
├── app/                           ← every URL is a folder here
│   ├── page.tsx                   ← / (Staff Dashboard)
│   ├── requests/
│   │   ├── page.tsx               ← /requests inbox
│   │   └── [id]/page.tsx          ← /requests/REQ-2026-0431 detail
│   ├── admissions/page.tsx
│   ├── social-allowance/page.tsx
│   ├── appeals/page.tsx
│   ├── fa-screen/page.tsx
│   ├── warnings/page.tsx
│   ├── feedback/page.tsx
│   ├── sport/page.tsx
│   ├── directory/page.tsx
│   └── (existing analytics: engagement, retention, payments, ai-monitoring,
│        communications, users, settings, audit-log)
├── components/                    ← AppShell, Sidebar, Card, Skeleton, etc.
└── lib/
    ├── api.ts                     ← all mock data + API methods
    ├── i18n.tsx                   ← every EN/AR string
    └── auth.tsx                   ← mock SSO with the 3 demo accounts
```

The site is a standalone Next.js app — no backend wired yet. All data lives in `lib/api.ts` as typed mocks; swapping in real endpoints later is a one-file change.

---

*Last updated: 2026-04-27 · CCK-Hub Admin*
