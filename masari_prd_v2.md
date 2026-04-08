PRODUCT REQUIREMENTS DOCUMENT

__Masari__

مساري

The Arabic\-First AI Student Platform for GCC Universities

Unifying academics, payments, campus life, and AI advising in a single white\-labeled mobile experience

__Version__

2\.0 — Complete

__Date__

April 7, 2026

__Classification__

Confidential

__Status__

Final Draft

__Pages__

18 sections

# 1\. Executive summary

Masari \(مساري, "my path/journey"\) is an Arabic\-first, AI\-powered student engagement platform designed for GCC universities\. It consolidates the fragmented student digital experience — academics, payments, campus life, social, and AI advising — into a single white\-labeled mobile application, delivered as B2B SaaS to university provosts and academic leadership\.

No Arabic\-first, all\-in\-one student mobile platform exists in the GCC today\. Students at typical GCC universities juggle 5–8 disconnected portals for grades, payments, schedules, and communications\. Global platforms like Blackboard and Ellucian were built English\-first and treat Arabic as a secondary localization layer\. Blackboard’s parent company filed for bankruptcy in 2025, creating institutional uncertainty across the region\. This convergence of unmet need, market disruption, and government\-mandated digital transformation spending creates a rare entry window\.

## 1\.1 Product name rationale

"Masari" \(مساري\) means "my path" or "my journey" in Arabic, with the possessive suffix ي \(\-i\) making it deeply personal\. The word captures the student’s entire educational journey — from enrollment through graduation — while being easy to pronounce in both Arabic and English\. It signals aspiration and forward movement, aligning with the GCC’s national vision narratives around progress and transformation, and distinguishes the brand from institutional\-sounding competitors\.

## 1\.2 Key metrics at a glance

__Metric__

__Value__

Target market

2\.75M students across 200\+ GCC institutions

TAM

$13\.75M–$41\.25M annually \(per\-student pricing\)

V1 price point

$5–$8 per student per year

Pilot market

Kuwait \(private universities first\)

Scale market

Saudi Arabia \(80% of GCC students\)

Tech stack

React Native \(Expo\), AWS Bahrain \(me\-south\-1\)

Launch timeline

9–12 months to production pilot

Distribution

White\-labeled per university

Primary buyer

Provost / Academic leadership

Estimated dev cost

$1\.5M–$2\.1M \(12\-month build\)

# 2\. Problem statement

## 2\.1 The fragmented student experience

GCC university students currently navigate a disjointed ecosystem of disconnected digital tools\. A typical student’s daily workflow involves logging into separate systems for course schedules \(SIS portal\), grades and transcripts \(often a different SIS interface\), LMS assignments and content \(Blackboard/Canvas\), payment of tuition and fees \(university finance portal\), campus events and club activities \(student affairs website or social media\), library resources, and university communications \(email, SMS, notice boards\)\.

Each system has its own credentials, its own mobile optimization \(or lack thereof\), and its own notification scheme\. The result is a cognitive tax that disproportionately affects first\-generation students and those less comfortable navigating bureaucratic systems — precisely the population most at risk of dropping out\.

## 2\.2 The Arabic\-first gap

Every major platform operating in GCC higher education was built English\-first\. Blackboard, Ellucian, Canvas, Ready Education, and Modo Labs all treat Arabic as a secondary localization layer\. This manifests in broken RTL layouts, poor Arabic typography, inconsistent Hijri calendar support, missing prayer time integration, and culturally disconnected UX patterns\. For the 2\.75 million students whose primary language is Arabic, these platforms feel foreign — a friction that compounds over years of use\.

## 2\.3 The market disruption window

- Anthology \(Blackboard’s parent\) filed Chapter 11 bankruptcy in September 2025 with $1\.7B in debt, creating institutional uncertainty across the 25\+ Saudi universities on its national license
- Ellucian is expanding aggressively in the region \(Banner SaaS on AWS UAE in 2025\) but focuses on back\-office SIS/ERP, not student\-facing engagement
- GCC governments have collectively allocated tens of billions to education digitization under their national vision programs \(Saudi Vision 2030 alone: SAR 195B for education in 2024\)
- No regional player combines academics, payments, campus life, and AI in a unified mobile experience
- 98% smartphone penetration in Kuwait means zero hardware barriers to mobile\-first adoption

# 3\. Target users and personas

## 3\.1 Primary buyer: Provost / Academic leadership

The provost and academic leadership team are the primary decision\-makers for Masari adoption\. Their core concerns center on student retention \(a 1% improvement at a 10,000\-student university paying $20K/year tuition preserves $2M in annual revenue\), accreditation requirements for digital transformation, institutional rankings \(which increasingly weight student experience metrics\), and demonstrating innovation to boards and government stakeholders\.

### Decision\-making criteria

__Criterion__

__Weight__

__Masari positioning__

Retention impact evidence

Critical

AI\-powered at\-risk detection with 80%\+ accuracy target, modeled on Georgia State’s proven 21\.4% melt reduction

Integration with existing systems

Critical

Complements \(not replaces\) existing LMS/SIS via LTI 1\.3 and API adapters

Data privacy compliance

Critical

Saudi PDPL as baseline, AWS Bahrain hosting, ISO 27001 certification on roadmap

Arabic\-first experience

High

Only platform designed Arabic\-first; competitors treat Arabic as localization layer

Total cost of ownership

High

$5–8/student/year vs\. $10–40 for LMS, $20–200\+ for ERP

Implementation timeline

Medium

4–8 weeks from contract to student\-facing launch

Vendor stability

Medium

GCC\-headquartered, no bankruptcy risk \(unlike Anthology/Blackboard\)

## 3\.2 End user personas

### Persona A: Noura — The overwhelmed freshman

__Demographics: __19, Saudi, first\-generation university student at a private Kuwaiti university

__Context: __First in her family to attend university\. Parents supportive but unable to help navigate institutional systems\. Shy about visiting offices in person\.

__Daily digital touchpoints: __Instagram \(2hr\), WhatsApp \(1\.5hr\), TikTok \(1hr\), university portal \(10min\)\. Checks phone 85\+ times/day\.

__Pain points: __Lost in 6 different portals, missed a tuition deadline because the reminder went to an email she rarely checks, unclear on degree requirements, intimidated by academic advising offices\.

__Masari value: __Single app for everything, AI advisor available 24/7 in Arabic, proactive payment reminders via push notification, clear degree progress visualization, no office visits needed for basic advising\.

__Success metric: __Noura opens Masari 3\+ times daily and never misses a deadline again\.

### Persona B: Ahmed — The engaged senior

__Demographics: __22, Kuwaiti, computer science major, president of the coding club, mentors 3 freshman students informally

__Pain points: __Manages club events through WhatsApp groups \(loses messages\), no centralized way to promote events campus\-wide, wants to mentor freshmen but no platform facilitates matching\.

__Masari value: __Campus life module for club management, event promotion to full student body, social feed, peer mentoring matching\.

__Success metric: __Ahmed’s club events get 3x attendance through Masari discovery vs\. WhatsApp\-only promotion\.

### Persona C: Dr\. Al\-Mutairi — The data\-hungry dean

__Demographics: __48, Dean of Student Affairs, reports to the provost, manages a team of 12 academic advisors

__Pain points: __No unified dashboard for student engagement, dropout signals are invisible until too late, retention reports require manual data compilation from 4\+ systems, cannot prove ROI of student affairs programs\.

__Masari value: __Admin dashboard with AI\-powered retention alerts, real\-time engagement analytics, automated at\-risk identification, intervention tracking for advisors\.

__Success metric: __Dr\. Al\-Mutairi identifies at\-risk students 6 weeks earlier than current process and reduces dropout by 1%\+\.

### Persona D: IT Director Fahad — The cautious gatekeeper

__Demographics: __40, IT Director, responsible for all university systems, 15\-person IT team

__Pain points: __Every new system creates integration headaches, vendors promise easy setup but require months of custom work, worried about data security with cloud tools, already managing Blackboard \+ Banner \+ custom systems\.

__Masari value: __LTI 1\.3 standard integration \(no custom API work\), adapter pattern that works with existing SIS, ISO 27001 certification, data stays in AWS Bahrain, dedicated integration support\.

__Success metric: __Integration completed in under 8 weeks with zero disruption to existing systems\.

# 4\. Product vision and design principles

Masari aspires to be the operating system for student life at GCC universities — the single app students open first every morning and the platform administrators trust for actionable intelligence on student success\.

## 4\.1 Design principles

1. __Arabic\-first, not Arabic\-also: __Every screen, interaction, and notification is designed for Arabic readers first\. English is the localization layer, not the other way around\. RTL is the default, not an afterthought\.
2. __One app, zero context\-switching: __Students should never need to leave Masari to complete a university\-related task\. If they must \(e\.g\., final course registration in SIS\), Masari deep\-links them directly to the right screen\.
3. __AI that advises, not just answers: __The AI advisor proactively reaches out with degree planning suggestions, retention nudges, and financial aid reminders — not just responds to queries\.
4. __University\-branded, platform\-powered: __Each institution gets a white\-labeled app with their colors, logo, and name\. Masari is invisible to students; the university is the hero\.
5. __Privacy as foundation: __Student data is encrypted, region\-hosted \(AWS Bahrain\), and governed by Saudi PDPL as baseline\. We assume the strictest standard applies everywhere\.
6. __Graceful degradation: __If an integration fails or data is unavailable, the app surfaces what it can with clear messaging — never a blank screen or cryptic error\.

# 5\. Feature specification

The V1 product comprises five core modules, a university admin dashboard, and shared platform infrastructure\. Features are prioritized as P0 \(must\-have for pilot launch\), P1 \(required within first semester\), and P2 \(planned for V1\.1 or V2\)\.

## 5\.1 Module A: Academics

The academics module serves as the student’s daily command center, pulling data from the university’s SIS and LMS via integration adapters\.

__Feature__

__Description__

__Priority__

__Data source__

Schedule view

Weekly/daily class schedule with room locations, professor names, real\-time conflict detection, Hijri date display

P0

SIS

Grade dashboard

Current and historical grades, GPA calculation, grade trend visualization, academic standing indicator

P0

SIS

Attendance tracker

Per\-course attendance record, absence count warnings relative to university policy thresholds

P0

SIS

Assignment feed

Unified feed of LMS assignments/deadlines across all courses, sorted by due date with reminders

P0

LMS

Academic calendar

University calendar with Hijri overlay, exam periods, registration windows, holiday breaks

P0

SIS \+ manual

Course registration helper

Browse sections, check prerequisites, view seat availability, deep\-link to SIS for enrollment

P1

SIS

Degree audit / progress

Visual completion tracker mapping courses to requirements, highlighting remaining credits

P1

SIS

Transcript request

Request official transcripts digitally, track status, receive push notification on readiness

P2

SIS

## 5\.2 Module B: Payments

Facilitates tuition and fee payments through Tap Payments, routing funds directly to university bank accounts\. Masari never holds student funds, avoiding Central Bank e\-payment licensing requirements\.

__Feature__

__Description__

__Priority__

Tuition balance and history

View current balance, payment history, upcoming installment deadlines

P0

KNET / mada payment

Pay via KNET \(Kuwait\), mada \(Saudi\), or other GCC debit schemes through Tap Payments SDK

P0

Payment reminders

Push notifications for upcoming due dates, overdue balances, successful confirmations

P0

Fee breakdown

Itemized view: tuition, lab fees, housing, meal plans, other charges

P1

Installment plans

View and manage university\-offered installment schedules

P1

Receipt download

Generate and download official payment receipts as PDF

P1

Financial aid status

View scholarship/aid status, required document checklist, disbursement timeline

P2

Refund tracking

Track refund requests and status through to bank settlement

P2

## 5\.3 Module C: AI advisor

The differentiating intelligence layer combining a conversational chatbot, predictive retention analytics, and course recommendations\.

### C\.1: AI chatbot advisor \(student\-facing\)

- Available 24/7 in Arabic and English with automatic language detection
- Handles schedule queries, policy FAQs, deadline reminders, degree planning conversations
- RAG\-powered: answers grounded in the specific university’s policies, catalog, and student handbook
- Cost\-tiered model routing: budget models \(Gemini Flash\-Lite at $0\.10/1M tokens\) for simple lookups, premium models \(Claude Sonnet at $3/1M tokens\) for complex advising
- Confidence scoring: if confidence < 70%, chatbot says "I’m not sure" and offers escalation to human advisor
- Escalation path transfers full conversation context to human advisors with one tap
- Proactive nudges: AI initiates conversations for upcoming deadlines, registration windows, at\-risk indicators

### C\.2: Retention alerts \(admin\-facing\)

- Predictive model analyzing: attendance patterns, grade trajectories, LMS engagement frequency, payment behavior, app usage patterns
- At\-risk students flagged on admin dashboard with confidence scores \(0–100\) and top 3 contributing factors
- Benchmark: Georgia State’s Pounce achieved 21\.4% reduction in summer melt; Civitas Learning models reach 82% Day\-1 accuracy
- Alerts routed to assigned academic advisors with recommended intervention actions and priority levels \(critical / warning / watch\)
- Intervention tracking: advisors log actions taken, enabling closed\-loop outcome measurement

### C\.3: Course recommendations \(student\-facing\)

- Suggests courses based on: degree requirements remaining, schedule availability, historical grade distributions, professor ratings
- Considers workload balance across the semester \(flags heavy\-load combinations\)
- Surfaces courses that historically correlate with improved outcomes for similar student profiles
- "Students like you" collaborative filtering model trained on anonymized historical enrollment/outcome data

## 5\.4 Module D: Campus life

__Feature__

__Description__

__Priority__

Events calendar

Centralized calendar for campus events, club activities, workshops, guest lectures with RSVP and reminders

P0

Club directory

Browse/join student clubs and organizations, view activities and announcements

P0

Prayer times

Integrated display based on campus location with optional notification reminders

P0

Campus map

Interactive map with building search, room navigation, current class location

P1

News feed

University announcements and news, filterable by department and topic

P1

Dining / services

Campus dining menus, operating hours, library hours, service directories

P2

Lost and found

Post and search for lost items on campus

P2

## 5\.5 Module E: Social

__Feature__

__Description__

__Priority__

Campus feed

University\-scoped social feed for peer posts, questions, study group formation; content moderation

P1

Direct messaging

Secure in\-app messaging between students and with university staff/advisors

P1

Study groups

Create/join course\-based study groups with shared resources and scheduling

P2

Peer mentoring

Senior\-to\-freshman mentoring matching facilitated through the platform

P2

Anonymous Q&A

Anonymous question board for sensitive academic/wellbeing topics with moderator oversight

P2

## 5\.6 University admin dashboard \(web\)

Web application for university administrators providing institutional intelligence and platform management\.

__Feature__

__Description__

__Priority__

Engagement analytics

Real\-time dashboard: DAU/MAU, feature usage heatmaps, engagement trends by cohort/major/year

P0

Retention risk dashboard

AI\-generated at\-risk student list with risk scores, contributing factors, intervention recommendations

P0

Communication tools

Targeted push notifications by cohort, major, year, or custom segment; scheduled sends

P0

White\-label configuration

Upload branding \(logo, colors, fonts\), configure enabled modules, customize onboarding

P0

User management

Admin role assignment, student data import/export, SSO configuration, bulk operations

P0

Content management

Manage events, news, club approvals, campus directory information

P1

Payment analytics

Tuition collection rates, outstanding balances by cohort, payment method distribution

P1

AI advisor monitoring

Chatbot conversation logs, escalation rates, topic distribution, satisfaction scores

P1

Integration health

Real\-time status of SIS/LMS data sync, error logs, last sync timestamps

P1

Audit log

Complete log of admin actions for compliance and accountability

P1

# 6\. Core user flows

The following screen\-by\-screen flows describe the five highest\-priority student journeys and two critical admin journeys in Masari V1\. Each flow identifies the screens involved, user actions, system responses, edge cases, and error states\.

## 6\.1 Flow 1: First launch and onboarding

__Trigger: __Student downloads the white\-labeled app from App Store / Google Play

__Goal: __Authenticated, personalized home screen within 90 seconds

1. __Welcome screen: __University\-branded splash with logo and tagline\. Language selector \(Arabic default, English toggle\)\. Single "Get Started" CTA\.
2. __SSO authentication: __Redirect to university’s identity provider \(SAML/OIDC\)\. Student logs in with existing university credentials\. No separate Masari account creation\.
3. __Data sync loading: __Animated progress indicator while fetching schedule, grades, and balance from SIS/LMS adapters\. Skeleton UI shows layout structure\. Timeout after 15s with partial data \+ retry option\.
4. __Notification permission: __iOS permission prompt with context: "Get deadline reminders and payment alerts\." Dismissible — can be enabled later from settings\.
5. __Home screen: __Personalized dashboard: today’s classes, upcoming deadlines \(next 48hr\), balance due \(if any\), AI advisor greeting\. Bottom tab navigation: Home, Academics, Payments, Campus, Profile\.

__Edge cases: __SSO failure → retry with clear error message \+ IT help desk contact\. Partial data sync → show available modules, gray out unavailable ones with "Syncing\.\.\." label\. Returning user → skip onboarding, go to home\.

__Success criteria: __90% of students complete onboarding in under 2 minutes\. Zero students blocked by authentication failures \(fallback to email\-based verification if SSO unavailable\)\.

## 6\.2 Flow 2: Checking grades

__Trigger: __Student taps "Academics" tab → "Grades"

__Goal: __View current semester grades and cumulative GPA within 2 taps from home

1. __Academics tab: __Section cards: Schedule \(today’s classes\), Grades, Attendance, Assignments, Calendar\. Grade card shows mini GPA badge\.
2. __Grades overview: __Current semester at top: cumulative GPA \(large\), semester GPA, credit hours completed\. Course list with course code, name, current grade, and trend arrow \(↑↓→\)\.
3. __Course detail: __Tap any course → grade breakdown: assignments, midterm, participation, final \(if posted\)\. Each component shows weight, score, and class average for context\.
4. __Historical view: __Toggle to view previous semesters\. GPA trend line chart across all semesters\. Semester selector dropdown\.

__Edge cases: __Grade not yet posted → "Pending" badge\. SIS sync delayed → show last\-synced timestamp \+ pull\-to\-refresh\. Grade dispute → deep\-link to university grade appeal form\.

## 6\.3 Flow 3: Making a KNET payment

__Trigger: __Student taps "Payments" tab or push notification for upcoming due date

__Goal: __Complete tuition payment via KNET in under 60 seconds

1. __Payment dashboard: __Balance due \(large, prominent\), due date with countdown, itemized fee breakdown expandable, payment history below\.
2. __Payment method selection: __Tap "Pay Now" → amount confirmation screen\. Payment method grid: KNET \(default/prominent in Kuwait\), Apple Pay, Visa/MC\. Amount is pre\-filled; partial payment option if university allows\.
3. __Tap Payments redirect: __In\-app WebView opens Tap Payments checkout\. Student enters KNET card details \(card number, PIN\)\. Tap handles 3DS/OTP verification with bank\.
4. __Confirmation: __Success screen with: amount paid, transaction reference, receipt download button \(PDF\), updated remaining balance\. Push notification \+ email receipt sent simultaneously\.

__Edge cases: __Payment failure → clear error message \("Bank declined" vs\. "Network timeout"\) \+ retry button\. Partial payment → updated remaining balance shown\. Duplicate payment prevention → idempotency key per transaction\. WebView crash → webhook reconciliation confirms payment even if app\-side confirmation missed\.

__Security: __No card data stored in Masari\. PCI compliance handled entirely by Tap Payments\. Fund flow: student → Tap → university bank account \(Masari never touches funds\)\.

## 6\.4 Flow 4: Chatting with the AI advisor

__Trigger: __Student taps AI advisor icon \(persistent floating button\) or receives proactive nudge notification

__Goal: __Get accurate, university\-specific answer in Arabic within one conversational turn

1. __Chat interface: __Full\-screen chat with RTL layout\. Suggested quick prompts: "ما جدولي بكرة؟" \(What’s my schedule tomorrow?\), "كم باقي علي؟" \(How much do I owe?\), "وش المواد اللي أقدر أسجلها؟" \(What courses can I register for?\)\.
2. __Query processing: __Language auto\-detected\. Model router selects: budget model for schedule/FAQ lookups, premium model for degree planning/complex advising\. RAG retrieves relevant university policy chunks\.
3. __Response delivery: __Streaming response with typing indicator\. Structured cards for schedule/grade data \(not just text\)\. Source attribution: "Based on \[University Policy Manual, Section 4\.2\]" with link to full document\.
4. __Escalation \(if needed\): __If confidence < 70% or student requests human help: "I’m not 100% sure about this\. Would you like me to connect you with an advisor?" One tap sends conversation context to human advisor queue\.

__Edge cases: __Ambiguous query → clarifying question before answering\. Harmful/inappropriate content → content filter blocks response \+ suggests appropriate university resource \(counseling, etc\.\)\. System overload → queue with estimated wait time\. No RAG match → "I don’t have information about that\. Here’s the Student Affairs office contact\."

## 6\.5 Flow 5: Discovering and RSVPing to a campus event

__Trigger: __Student taps "Campus" tab or receives event recommendation notification

__Goal: __Find interesting event and RSVP within 3 taps

1. __Campus tab: __Featured events carousel \(personalized by major/interests\), prayer times widget, quick links to clubs and map\.
2. __Event detail: __Tap event card → full details: title, description, date/time \(Hijri \+ Gregorian\), location with map pin, organizer \(club or department\), attendee count, photo gallery\.
3. __RSVP: __Single "RSVP" button\. Confirmation with "Add to Calendar" option \(syncs to device calendar\)\. Reminder notification set for 1 hour before\.

__Edge cases: __Event full → waitlist option with position number\. Event cancelled → push notification \+ calendar removal\. Conflicting class → warning badge on event card\.

## 6\.6 Admin flow: Responding to a retention alert

__Trigger: __Advisor receives notification that a student has been flagged as at\-risk

1. __Alert dashboard: __Sorted by risk score \(critical > warning > watch\)\. Each card: student name, ID, risk score \(0–100\), top 3 contributing factors \(e\.g\., "3 consecutive absences in CS101", "GPA dropped 0\.4 this semester", "No LMS login in 14 days"\)\.
2. __Student profile: __Click student → full profile: academic history, attendance record, payment status, app engagement timeline, previous interventions log\.
3. __Intervention action: __Advisor selects action: "Send in\-app message", "Schedule meeting", "Refer to counseling", "Contact parent/guardian", "Custom note"\. Action logged with timestamp for outcome tracking\.
4. __Outcome tracking: __30\-day follow\-up reminder auto\-created\. Risk score recalculated weekly\. Advisor marks outcome: "Resolved", "Ongoing", "Escalated", "Withdrew"\. Data feeds into model retraining\.

# 7\. Technical architecture

## 7\.1 System overview

Masari follows a modular microservices architecture with clear separation between the mobile client, API gateway, service layer, integration adapters, and data stores\. All services are containerized \(Docker/Kubernetes\) and deployed on AWS Bahrain \(me\-south\-1\) for GCC data residency compliance\.

## 7\.2 Mobile client

__Component__

__Technology__

__Rationale__

Framework

React Native \(Expo\)

Mature RTL support via I18nManager, single codebase for iOS/Android, Expo simplifies white\-label builds via EAS Build profiles

i18n

react\-i18next \+ expo\-localization

Handles Arabic’s 6 CLDR plural categories natively \(zero, one, two, few, many, other\)

Typography

Cairo or Tajawal font family

Harmonious Arabic/Latin character sets with multiple weights \(300–700\)

State management

Zustand \+ React Query \(TanStack\)

Zustand for UI state, React Query for server cache with offline support

Navigation

React Navigation v6\+

RTL\-aware drawer and tab navigation, deep linking support

Storage

MMKV

Fast key\-value storage for preferences and offline cache \(10x faster than AsyncStorage\)

Payments

Tap Payments React Native SDK

goSellSDK\-ReactNative for KNET/mada, BenefitPay\-React\-Native for Bahrain

Push notifications

expo\-notifications \+ FCM/APNs

Cross\-platform push with rich notification support

### RTL design requirements

- App configured with supportsRTL: true and forcesRTL: true in app\.json; RTL changes require app restart \(Updates\.reloadAsync\(\)\)
- Arabic body text minimum 16px, line height 1\.6–1\.8x, zero letter\-spacing \(breaks cursive connections\)
- Icon mirroring rules: MIRROR back/forward arrows, chevrons, progress bars, text alignment icons\. DO NOT MIRROR search, camera, media playback, brand marks, checkmarks
- Navigation: drawer slides from right, home tab far\-right of tab bar, hamburger menu top\-right
- Hijri calendar via Intl\.DateTimeFormat\('ar\-SA\-u\-ca\-islamic'\) or moment\-hijri; week starts Saturday or Sunday; use full Arabic day names \(abbreviations are ambiguous\)
- Eastern Arabic numerals \(٠, ١, ٢\) and Western Arabic \(0, 1, 2\) — never mix systems within same interface; use Intl\.NumberFormat\('ar\-SA'\)
- Mixed\-direction content \(e\.g\., "CS101" in Arabic text\): Unicode Bidi Algorithm handles automatically; use writingDirection: 'ltr' for explicit overrides

## 7\.3 Backend services

__Service__

__Responsibility__

__Technology__

API Gateway

Auth, rate limiting, routing, request validation

AWS API Gateway \+ WAF

Auth service

SSO federation, JWT issuance, role management, session management

OAuth 2\.0, SAML 2\.0, OIDC

Academic service

Schedule, grades, attendance, degree audit, calendar

Node\.js, Redis cache, PostgreSQL

Payment service

Payment orchestration, receipt generation, webhook processing

Node\.js, Tap Payments SDK

AI service

Chatbot, retention scoring, course recommendations, model routing

Python, RAG pipeline, vector DB

Campus service

Events, clubs, maps, prayer times, news, dining

Node\.js, PostGIS for spatial

Social service

Feed, messaging, groups, moderation queue

Node\.js, WebSocket \(Socket\.io\)

Notification service

Push, email, SMS orchestration, scheduling, templates

Node\.js, FCM, APNs, AWS SES/SNS

Admin service

Dashboard APIs, analytics, config, white\-label management

Node\.js, analytics pipeline

Integration engine

SIS/LMS adapter management, data sync, conflict resolution

Node\.js, Bull queue, adapter pattern

File service

Document storage, receipt PDFs, profile images

Node\.js, S3 \(me\-south\-1\)

## 7\.4 Integration architecture

The integration engine uses an adapter pattern where each SIS/LMS combination gets a specific adapter translating platform\-specific APIs to Masari’s canonical data model\. This model normalizes students, courses, enrollments, sections, grades, and terms across systems, handling Arabic/English name transliteration and multi\-encoding\.

### Integration priority sequence

1. LTI 1\.3 / LTI Advantage — cross\-LMS compatibility \(Blackboard, Canvas, Moodle, D2L\) using OAuth 2\.0 \+ JWT
2. Blackboard REST API — critical for Saudi market penetration \(25 of 28 public universities\)
3. Ellucian Ethos / Banner API — SIS integration for student records, enrollment, and grades
4. OneRoster 1\.2 — standardized roster exchange for institutions without full API access
5. SFTP/CSV batch — fallback for legacy institutions \(e\.g\., Kuwait University’s custom Oracle SIS built in 1971\)

### Authentication by platform

__Platform__

__Auth method__

__Token type__

__Refresh mechanism__

Blackboard

OAuth 2\.0 \(Three\-Legged\)

Bearer token

Refresh token flow

Canvas

OAuth 2\.0

Bearer token

Refresh token flow

Banner/Ethos

API key \+ Bearer

JWT

Key rotation

Moodle

Token auth

API token

Manual regeneration

SFTP/CSV

SSH key pair

N/A

Key rotation schedule

## 7\.5 AI architecture

The AI service implements a RAG \(Retrieval Augmented Generation\) pipeline with cost\-optimized model routing and Arabic NLP preprocessing\.

### RAG pipeline

- Document ingestion: university policies, catalogs, handbooks chunked at 300–500 words with 20–50 word overlaps using recursive/structural chunking
- Arabic preprocessing: CAMeL Tools \(NYU Abu Dhabi\) for morphological analysis, diacritization normalization, and dialect handling before embedding
- Embeddings: multilingual\-e5\-large or Cohere multilingual\-v3 for Arabic content; stored in pgvector \(PostgreSQL extension\) to avoid additional infrastructure
- Retrieval: hybrid approach combining vector similarity \(cosine\) with BM25 keyword search; cross\-encoder re\-ranking achieves 28% improvement in faithfulness over basic RAG
- Metadata enrichment: each chunk tagged with department, document type, effective date, language, and section hierarchy for filtered retrieval

### Model routing and cost optimization

__Tier__

__Model__

__Cost / 1M input tokens__

__Use cases__

__Latency target__

Budget

Gemini 2\.5 Flash\-Lite

$0\.10

Schedule lookups, FAQ responses, simple data retrieval

<1s

Budget

GPT\-5 Nano

$0\.05

Basic classifications, intent detection, routing decisions

<500ms

Standard

Claude Haiku

$0\.25

Moderate complexity: policy interpretation, multi\-step queries

<2s

Premium

Claude Sonnet

$3\.00

Complex advising: degree planning, nuanced Arabic counseling, retention analysis

<5s

__Cost projection: __At 100K student messages/month \(avg 1K tokens each\): $1\.75/month \(all Gemini Flash\-Lite\) to $20/month \(all Claude Haiku\)\. Blended routing estimate: ~$8–12/month\. Prompt caching reduces costs by 90% for repeated system prompts\.

## 7\.6 Infrastructure and hosting

__Component__

__Choice__

__Rationale__

Primary region

AWS Bahrain \(me\-south\-1\)

GCC data residency, <30ms latency to all 6 countries

DR region

Azure UAE Central

Cross\-provider resilience, automatic failover

Encryption

AES\-256 at rest, TLS 1\.3 in transit

Saudi PDPL and ISO 27001 compliance

Key management

AWS CloudHSM \(in\-region\)

Customer\-managed keys never leave the region

Container orchestration

EKS \(Kubernetes\)

Service mesh, auto\-scaling, rolling deployments

CDN

CloudFront with Bahrain edge

Low\-latency static asset delivery across GCC

Primary database

PostgreSQL 15 \(RDS Multi\-AZ\)

Relational integrity, pgvector for embeddings

Cache

Redis \(ElastiCache\)

Session storage, API response caching, rate limiting

Object storage

S3 \(me\-south\-1\)

Documents, receipts, media, encrypted at rest

Message queue

SQS \+ SNS

Async processing, integration sync jobs, notifications

Monitoring

CloudWatch \+ Grafana \+ PagerDuty

Observability, alerting, on\-call rotation

CI/CD

GitHub Actions \+ EAS Build

Automated testing, white\-label build pipeline

# 8\. Data model and API design

The canonical data model normalizes entities across disparate SIS/LMS systems into a unified schema\. All entities support bilingual fields \(Arabic and English\) and temporal versioning\.

## 8\.1 Core entities

__Entity__

__Key fields__

__Source__

__Sync frequency__

Student

id, university\_id, student\_number, name\_ar, name\_en, email, phone, major\_id, cohort\_year, enrollment\_status, gpa\_cumulative

SIS

Daily \+ event\-driven

Course

id, university\_id, code, name\_ar, name\_en, department\_id, credit\_hours, description\_ar, description\_en, prerequisites\[\]

SIS

Per term

Section

id, course\_id, term\_id, instructor\_id, schedule\_slots\[\], room, capacity, enrolled\_count

SIS

Daily

Enrollment

id, student\_id, section\_id, term\_id, status \(enrolled/dropped/withdrawn\), grade, grade\_points

SIS

Daily

Term

id, university\_id, name\_ar, name\_en, start\_date, end\_date, registration\_start, registration\_end, type \(fall/spring/summer\)

SIS

Per term

Assignment

id, section\_id, lms\_id, title, description, due\_date, max\_score, type \(homework/quiz/exam/project\)

LMS

Hourly

Attendance

id, enrollment\_id, session\_date, status \(present/absent/excused/late\), source

SIS

Daily

Payment

id, student\_id, term\_id, amount, currency, status \(pending/completed/failed/refunded\), method, tap\_reference, created\_at

Tap webhook

Real\-time

Fee

id, student\_id, term\_id, type \(tuition/lab/housing/meal\), amount, due\_date, paid\_amount

SIS

Daily

Event

id, university\_id, title\_ar, title\_en, description, start\_time, end\_time, location, organizer\_id, capacity, rsvp\_count

Admin CMS

Real\-time

Club

id, university\_id, name\_ar, name\_en, description, category, advisor\_id, member\_count, status

Admin CMS

Real\-time

AI\_Conversation

id, student\_id, messages\[\], model\_used, tokens\_input, tokens\_output, confidence\_score, escalated, created\_at

AI service

Real\-time

Risk\_Alert

id, student\_id, risk\_score, contributing\_factors\[\], status \(active/resolved/escalated\), assigned\_advisor\_id, interventions\[\]

AI service

Weekly recalculation

## 8\.2 Core API endpoints \(REST\)

All endpoints are versioned \(/api/v1/\), authenticated via JWT, and return JSON with bilingual fields\. Pagination uses cursor\-based approach for performance\.

__Endpoint__

__Method__

__Description__

__Auth__

/auth/sso/initiate

POST

Initiate SSO flow with university IdP

Public

/auth/token/refresh

POST

Refresh expired JWT

Refresh token

/students/me

GET

Current student profile \+ summary stats

Student

/students/me/schedule

GET

Current term class schedule with room/time

Student

/students/me/grades

GET

Grades by term, includes GPA calculations

Student

/students/me/grades/\{enrollment\_id\}

GET

Detailed grade breakdown for one course

Student

/students/me/attendance

GET

Attendance records with absence counts

Student

/students/me/assignments

GET

Upcoming assignments across all courses

Student

/students/me/fees

GET

Current balances, fee breakdown, payment history

Student

/students/me/degree\-audit

GET

Degree progress with remaining requirements

Student

/payments/initiate

POST

Create Tap payment session, returns redirect URL

Student

/payments/webhook

POST

Tap payment status webhook \(idempotent\)

Tap signature

/payments/\{id\}/receipt

GET

Generate PDF receipt for completed payment

Student

/ai/chat

POST

Send message to AI advisor, streaming response

Student

/ai/chat/\{conversation\_id\}

GET

Retrieve conversation history

Student

/events

GET

List campus events with filters \(date, category, club\)

Student

/events/\{id\}/rsvp

POST

RSVP to event

Student

/clubs

GET

List student clubs

Student

/clubs/\{id\}/join

POST

Join a club

Student

/notifications/preferences

PUT

Update notification settings

Student

/admin/analytics/engagement

GET

Engagement metrics \(DAU, MAU, feature usage\)

Admin

/admin/analytics/retention

GET

Retention risk dashboard data

Admin

/admin/students/at\-risk

GET

At\-risk student list with scores and factors

Admin

/admin/students/\{id\}/intervene

POST

Log intervention action for a student

Admin

/admin/communications/send

POST

Send targeted push notification to segment

Admin

/admin/config/branding

PUT

Update white\-label branding \(logo, colors, fonts\)

Super Admin

/admin/integrations/status

GET

SIS/LMS sync status and error logs

Admin

/admin/integrations/sync

POST

Trigger manual data sync

Admin

## 8\.3 Data sync strategy

__Data type__

__Sync method__

__Frequency__

__Conflict resolution__

Student records

Batch pull via SIS API/SFTP

Nightly \(full\) \+ hourly \(delta\)

SIS is source of truth; Masari never writes back

Grades

Event\-driven webhook \(if available\) \+ batch

Hourly during active terms

Latest SIS value wins

Assignments

LMS API polling \+ LTI grade passback

Every 30 minutes

LMS is source of truth

Attendance

Batch pull via SIS API

Daily

SIS is source of truth

Payments

Real\-time webhooks from Tap

Instant

Tap transaction ID is canonical; reconciliation job runs daily

Events / clubs

Masari\-native \(admin CMS\)

Real\-time

N/A \(Masari is source of truth\)

AI conversations

Masari\-native

Real\-time

N/A

# 9\. Payment processing

## 9\.1 Gateway: Tap Payments

Tap Payments \(tap\.company\) is the sole payment gateway for V1\. Headquartered in Kuwait with Central Bank of Kuwait licensing, Tap holds electronic payment service provider licenses across all six GCC countries \(UAE license obtained April 2025\)\. Single integration covers KNET, mada, Benefit, NAPS, OmanNet, Apple Pay, Google Pay, STC Pay, and card payments\.

## 9\.2 Fund flow architecture

Masari never holds student funds\. The architecture routes payments directly from students to university bank accounts through Tap’s marketplace/split payment model:

- Student initiates payment in Masari → Masari creates Tap charge with university as destination
- Tap collects funds from student’s bank \(via KNET/mada/etc\.\)
- Tap deducts processing fee \(~2\.5–3%\) and Masari platform fee
- Tap settles remainder directly to university’s bank account \(T\+1 to T\+3\)
- This avoids triggering Central Bank of Kuwait e\-payment licensing requirements for Masari

## 9\.3 Supported payment methods by country

__Country__

__Primary debit scheme__

__Market share__

__Additional methods__

Kuwait

KNET

~85% of online transactions

Apple Pay, Google Pay, Visa/MC

Saudi Arabia

mada

~70% of online transactions

STC Pay, Apple Pay, Visa/MC

UAE

NAPS

Growing adoption

Apple Pay, Google Pay, Visa/MC

Bahrain

Benefit

Dominant locally

Apple Pay, Visa/MC

Qatar

NAPS

Growing adoption

Apple Pay, Visa/MC

Oman

OmanNet

Dominant locally

Visa/MC

# 10\. Data privacy and compliance

Student data protection is governed by a patchwork of GCC regulations\. Masari adopts Saudi Arabia’s PDPL \(the strictest in the GCC\) as the baseline compliance standard, ensuring that meeting it satisfies requirements in all other GCC jurisdictions\.

## 10\.1 Regulatory landscape

__Country__

__Primary law__

__Key requirements__

__Max penalty__

Saudi Arabia

PDPL \(Royal Decree M/19\)

DPIA required, immediate breach notification to SDAIA, SCCs for cross\-border

SAR 5M \(~$1\.33M\)

Kuwait

CITRA Res\. 26/2024 \+ Cybercrime Law

24hr breach notification \(strictest SLA\), Arabic\+English privacy notices

KWD 20K \+ 5yr

UAE

Federal Decree\-Law No\. 45/2021

Data Processing Register, DPO for large\-scale processing

AED 5M \(~$1\.36M\)

Bahrain

PDPL \(Law No\. 30/2018\)

Data Transfer Impact Assessment, DPO appointment

BHD 20K \(~$53K\)

Qatar

Law No\. 13/2016

Registration with CRA, explicit consent

QAR 5M \(~$1\.37M\)

Oman

Royal Decree 6/2022

DPO \+ external auditor, data localization for some categories

OMR 500K \(~$1\.3M\)

## 10\.2 Compliance roadmap

1. ISO 27001 certification — begin during development, target completion within 12 months of launch \(highest priority for GCC enterprise/government sales\)
2. SOC 2 Type II — initiate 6 months post\-launch, 6–15 months to complete
3. Breach notification SLA: 24 hours maximum \(aligns with Kuwait’s DPPR, the strictest\)
4. Privacy notices in Arabic and English for all user\-facing data collection
5. Parental/guardian consent flow for students under 18
6. Data Protection Impact Assessments for AI features and cross\-border data flows
7. Quarterly compliance audits with external assessor

## 10\.3 AI\-specific compliance measures

- Student data sent to AI models is anonymized/pseudonymized where possible; PII stripped from RAG context unless required for personalization
- AI conversation logs retained for 90 days \(configurable per university\), then purged
- Retention risk scores are recommendations only; human advisor always makes final intervention decisions
- Model outputs include confidence scores and source attribution; no "black box" decisions
- Bias auditing: quarterly analysis of retention alert distribution across demographics to detect and correct model bias

# 11\. Go\-to\-market strategy

## 11\.1 Phase 1: Kuwait pilot \(months 1–12\)

__Target: __1–2 private Kuwaiti universities \(e\.g\., GUST, AUK, AUM, ACK, or AIKU\)

Kuwait’s compact market \(11 universities, ~100–120K students\) enables rapid pilot deployment and iteration\. Private universities are targeted first for faster procurement cycles \(3–6 months vs\. 9–18 months for government institutions\)\. Kuwait’s position as Tap Payments’ headquarters simplifies payment integration and support\.

- Pilot pricing: free or deeply discounted for first 1–2 institutions in exchange for case study rights, co\-development feedback, and testimonial commitment
- Implementation: dedicated onboarding team, 4–8 week target from contract to student\-facing launch
- Success metrics: 70%\+ student activation within first semester, measurable reduction in support ticket volume, NPS > 50
- Build case study documenting retention impact, engagement data, and administrative efficiency gains for Saudi expansion pitch

## 11\.2 Phase 2: Saudi expansion \(months 12–24\)

__Target: __3–5 Saudi private universities, then 1–2 public university pilots

Saudi Arabia represents 80% of GCC students and the largest government education budget \(SAR 195B for 2024\)\. Requirements: local partnership \(Saudi entity with 30%\+ Saudi ownership for contracts over SAR 500K\), Etimad platform registration for government tenders, and full PDPL compliance\. Blackboard’s bankruptcy creates an opening for conversations with institutions re\-evaluating their technology stack\.

## 11\.3 Phase 3: GCC\-wide \(months 24–36\)

Expand to UAE, Bahrain, Qatar, and Oman leveraging Tap Payments’ pan\-GCC licensing and AWS Bahrain’s regional coverage\. Each country requires localized compliance and payment scheme integration but shares the same core platform\.

## 11\.4 Sales process and procurement

__Stage__

__Duration__

__Activities__

__Deliverables__

Lead qualification

2–4 weeks

Identify provost/VP Academic Affairs, confirm budget cycle timing, assess SIS/LMS landscape

Qualified lead profile

Discovery meeting

1–2 weeks

Demo tailored to institution’s pain points, technical architecture overview, reference check facilitation

Custom demo recording, ROI calculator

Technical assessment

2–4 weeks

IT team integration review, security/compliance questionnaire, data residency confirmation

Integration plan, security whitepaper

Proposal and negotiation

2–6 weeks

Pricing proposal, SLA terms, contract negotiation, procurement process navigation

Commercial proposal, MSA draft

Contract and onboarding

2–4 weeks

Contract execution, kickoff meeting, integration setup, admin training

Signed contract, project plan

Go\-live

4–8 weeks

Data integration, UAT, student onboarding campaign, launch event

Production deployment, launch report

# 12\. Pricing model

## 12\.1 Per\-student annual pricing

V1 pricing: $5–$8 per student per year\. This positions Masari below core LMS pricing \($5–$30/student\) and well below ERP costs \($20–$200\+/student\), while above basic engagement\-only tools \($2–$10/student\)\. The framing emphasizes complementarity with existing investments, reducing perceived switching risk\.

__Penetration__

__Universities__

__Students__

__Avg price__

__Annual revenue__

5%

15–20

90K

$6

__$540K__

10%

30–40

179K

$7

__$1\.25M__

20%

60–80

358K

$7

__$2\.5M__

40%

120\+

716K

$7

__$5M__

## 12\.2 Future revenue streams \(post\-V1\)

- Payment processing fees: 0\.5–1\.5% of tuition transactions facilitated \(on top of Tap’s gateway fees\)
- Implementation fees: $15K–$50K per institution for onboarding, integration, and training
- Premium AI tier: 30–50% subscription uplift for advanced analytics, unlimited AI conversations, custom model training
- White\-labeling premium: $10K–$50K one\-time for custom app store listing \+ premium support SLA
- Data analytics add\-on: anonymized benchmarking reports comparing institution metrics to GCC averages

## 12\.3 ROI case for universities

Even a 1% improvement in retention at a university with 10,000 students paying $20K/year tuition preserves $2 million in annual revenue — dwarfing a $50K–$80K platform subscription\. Additional documented impacts from comparable platforms:

- 75% reduction in financial aid document processing time
- 90% decrease in student queues for administrative services
- 21\.4% reduction in summer melt \(Georgia State benchmark\)
- 40% reduction in administrative workload through AI chatbots \(King Saud University\)

# 13\. Team structure and resourcing plan

The following team structure is designed for the 12\-month V1 build through Kuwait pilot launch\. Roles marked with an asterisk \(\*\) can be phased in after month 3\.

## 13\.1 Engineering team

__Role__

__Count__

__Key responsibilities__

__Hiring priority__

Engineering Manager / Tech Lead

1

Architecture decisions, sprint planning, code review, technical direction

Month 1 \(must be in place\)

Senior Mobile Engineer \(React Native\)

2

Core mobile app, RTL framework, white\-label build system, Expo/EAS pipeline

Month 1

Mobile Engineer \(React Native\)

1

Feature development, UI components, testing

Month 2

Senior Backend Engineer

2

Microservices architecture, API design, integration engine, auth service

Month 1

Backend Engineer

2

Service implementation, data sync jobs, notification system

Month 2

ML / AI Engineer

1

RAG pipeline, model routing, retention model, Arabic NLP evaluation

Month 3\*

DevOps / SRE

1

AWS infrastructure, CI/CD, monitoring, security hardening, Kubernetes

Month 1

QA Engineer

1

Test automation, Arabic/RTL testing, integration testing, regression suites

Month 3\*

## 13\.2 Product and design team

__Role__

__Count__

__Key responsibilities__

__Hiring priority__

Product Manager

1

PRD ownership, roadmap, university stakeholder management, prioritization

Month 1

UX/UI Designer \(Arabic\-native\)

1

RTL\-first design system, wireframes, prototypes, usability testing

Month 1

UX/UI Designer

1

Admin dashboard design, component library, design QA

Month 2\*

## 13\.3 Business and operations

__Role__

__Count__

__Key responsibilities__

__Hiring priority__

CEO / Founder

1

Vision, fundraising, university relationships, strategic partnerships

Existing

Head of Sales \(GCC\)

1

University pipeline development, provost relationships, proposal management

Month 3\*

Customer Success Manager

1

Pilot university onboarding, training, ongoing support, feedback collection

Month 6\*

Integration Specialist

1

SIS/LMS adapter development, on\-site integration support, technical documentation

Month 4\*

## 13\.4 Team summary

__Category__

__Headcount__

__Monthly cost estimate \(avg\)__

__Annual cost__

Engineering \(11\)

11

$88K–$132K

$1\.06M–$1\.58M

Product & Design \(3\)

3

$24K–$36K

$288K–$432K

Business & Ops \(4\)

4

$28K–$44K

$336K–$528K

__Total \(18\)__

__18__

__$140K–$212K__

__$1\.68M–$2\.54M__

Note: Salary ranges reflect GCC\-based hiring with a mix of local and remote talent\. Ranges vary by seniority and location \(Kuwait\-based vs\. remote\)\.

# 14\. Budget and cost estimates

The following projections cover the 12\-month V1 build through Kuwait pilot launch, plus 12 months of initial operations\.

## 14\.1 Development costs \(months 1–12\)

__Category__

__Monthly estimate__

__12\-month total__

__Notes__

Engineering salaries

$88K–$132K

$1\.06M–$1\.58M

Phased hiring: 7 in month 1, full 11 by month 3

Product & Design salaries

$24K–$36K

$288K–$432K

2 in month 1, 3 by month 2

AWS infrastructure \(dev/staging\)

$3K–$5K

$36K–$60K

EKS, RDS, S3, CloudFront, dev environments

Third\-party services

$2K–$4K

$24K–$48K

GitHub, Figma, Sentry, PagerDuty, Expo EAS, testing tools

AI model API costs \(dev/testing\)

$500–1K

$6K–$12K

Development and testing with Claude, Gemini, embeddings

Tap Payments integration

$5K one\-time

$5K

Certification, testing, sandbox environment

ISO 27001 certification

$3K–$5K

$36K–$60K

Consultant fees, audit preparation, gap assessment

Legal and compliance

$3K–$5K

$36K–$60K

Privacy policy drafting, PDPL compliance, contract templates

Office / co\-working

$3K–$5K

$36K–$60K

Kuwait\-based team workspace

Travel

$2K–$4K

$24K–$48K

University visits, pilot onboarding, conferences

__Total development__

__$1\.55M–$2\.36M__

## 14\.2 Operational costs \(year 1 post\-launch\)

__Category__

__Monthly estimate__

__Annual total__

__Scaling notes__

AWS infrastructure \(production\)

$8K–$15K

$96K–$180K

Scales with student count; estimate for 5K–20K students

AI inference costs

$200–$2K

$2\.4K–$24K

Blended model routing; scales linearly with messages

Tap Payments fees

Pass\-through

Pass\-through

2\.5–3% paid by transaction; Masari takes 0\.5–1\.5% margin

Team salaries \(full\)

$140K–$212K

$1\.68M–$2\.54M

Full 18\-person team

Customer support tooling

$1K–$2K

$12K–$24K

Zendesk/Intercom, monitoring

App store fees

$100–$300/app

$2\.4K–$7\.2K

$99 iOS \+ $25 Android per white\-label app; estimate 10–24 apps

## 14\.3 Runway and breakeven analysis

__Scenario__

__Development cost__

__Annual ops cost__

__Revenue \(year 1\)__

__Breakeven__

Conservative \(5% penetration, $6 avg\)

$1\.9M

$1\.9M/yr

$540K

Month 42–48

Base case \(10% penetration, $7 avg\)

$1\.9M

$2\.0M/yr

$1\.25M

Month 30–36

Optimistic \(20% penetration, $7 avg\)

$1\.9M

$2\.1M/yr

$2\.5M

Month 20–24

These projections assume a seed/Series A funding round of $2\.5M–$4M to cover development costs and 12–18 months of runway\. Revenue ramp assumes 6\-month sales cycle for initial universities, accelerating as case studies and references are established\.

# 15\. Development roadmap

__Phase__

__Timeline__

__Deliverables__

__Key milestones__

Foundation

Months 1–3

Core architecture, auth service \(SSO/SAML\), RTL framework and design system, white\-label build pipeline \(EAS\), API gateway, database schema, CI/CD pipeline

Architecture review complete; first white\-label build compiles; dev environment on AWS Bahrain

Academics \+ Payments

Months 3–6

Schedule view, grade dashboard, attendance tracker, assignment feed, academic calendar, tuition balance/payment, KNET integration via Tap, receipt generation, LTI 1\.3 adapter

LTI 1\.3 certification; first successful KNET test payment; SIS data flowing through adapter

AI \+ Campus Life

Months 6–9

AI chatbot with RAG pipeline, model routing, retention alert model \(alpha\), events calendar, club directory, campus map, prayer times, notification system

AI chatbot passing Arabic QA benchmarks; retention model producing scores on test data; campus module feature\-complete

Social \+ Admin \+ Polish

Months 9–11

Campus feed, messaging, admin dashboard \(full\), engagement analytics, retention dashboard, white\-label config UI, performance optimization, accessibility audit, security pen\-test

Admin dashboard demo\-ready; load testing at 10K concurrent users; accessibility audit passed; pen\-test remediation complete

Pilot launch

Months 11–12

Beta testing with pilot university \(2–4 week UAT\), bug fixes, onboarding flow refinement, App Store / Google Play submission, production deployment, student launch campaign

University sign\-off on UAT; app store approval; first student login in production; launch event

# 16\. Success metrics

## 16\.1 Student engagement KPIs

__Metric__

__Pilot target \(semester 1\)__

__Scale target \(year 2\)__

__Measurement method__

Student activation rate

70%\+ of enrolled

85%\+

Unique logins / total enrolled

DAU / activated

30%\+

40%\+

Daily unique sessions

WAU / activated

60%\+

75%\+

Weekly unique sessions

Avg session duration

4\+ minutes

5\+ minutes

In\-app time tracking

Feature breadth

3\+ modules / student

4\+

Distinct module visits per user

AI advisor usage

40%\+ of active students

60%\+

Students initiating AI conversations

NPS

50\+

65\+

In\-app survey \(end of semester\)

App store rating

4\.0\+ stars

4\.5\+

App Store \+ Google Play average

## 16\.2 Institutional impact KPIs

__Metric__

__Pilot target__

__Scale target__

__Measurement method__

Support ticket reduction

25%\+ decrease

40%\+

Compare to pre\-Masari baseline

At\-risk identification accuracy

80%\+ by end of term 1

85%\+

Prediction vs\. actual outcomes

Retention rate impact

1%\+ improvement

2%\+

YoY retention comparison

On\-time payment rate

10%\+ improvement

20%\+

Compare to pre\-Masari baseline

Admin dashboard adoption

80%\+ weekly by target admins

90%\+

Unique admin logins per week

Advisor intervention response time

48hr from alert to action

24hr

Alert timestamp to intervention log

## 16\.3 Business KPIs

__Metric__

__Year 1 target__

__Year 2 target__

Universities contracted

2–3 \(Kuwait\)

8–15 \(Kuwait \+ Saudi\)

Students on platform

5K–15K

50K–150K

Annual recurring revenue

$30K–$120K

$500K–$1\.5M

Net revenue retention

>100%

>110%

Sales cycle length

<6 months \(private\)

<9 months \(public\)

Implementation time

<8 weeks

<6 weeks

Gross margin

60%\+

70%\+

# 17\. Risks, mitigations, and contingency plans

## 17\.1 Risk matrix

__Risk__

__Likelihood__

__Impact__

__Mitigation strategy__

SIS integration complexity exceeds estimates

High

High

Start with SFTP/CSV fallback; adapter pattern for incremental sophistication; 40% timeline buffer; dedicated integration specialist from month 4

University procurement delays

High

Medium

Focus on private universities first; build relationships 6\+ months before procurement; Etimad\-ready docs pre\-prepared

Low student adoption despite purchase

Medium

High

Invest in onboarding UX; partner with student affairs for launch campaigns; gamification in V1\.1; peer ambassador program

Arabic AI quality below expectations

Medium

Medium

Extensive benchmarking of Arabic models; fallback to multilingual \(Qwen scored highest on Saudi dialect\); human\-in\-the\-loop for complex queries

Tap Payments certification delays

Medium

High

Begin certification in month 1; parallel test with MyFatoorah as backup gateway; manual payment recording as interim fallback

Data residency requirements change

Low

High

Multi\-region architecture from day one; monitor regulatory developments; prepare for Google Cloud Kuwait when available

Competitor enters Arabic\-first space

Medium

Medium

Speed to market; deep integration moat \(12–18 months to replicate\); focus on university relationships and switching costs

Key team member departure

Medium

High

Document all architecture decisions; code review culture; competitive compensation; no single points of failure in team structure

Pilot university unsatisfied

Low

High

Weekly check\-ins during pilot; rapid bug fix SLA \(24hr for P0\); escalation path to CEO; contractual exit clause with data export

## 17\.2 Rollback and failure contingency plans

### Module\-level rollback

__Module__

__Failure scenario__

__Rollback plan__

__Student impact__

Academics

SIS adapter fails, stale data displayed

Show last\-synced timestamp prominently; disable affected features with "temporarily unavailable" message; trigger manual sync; deep\-link to native SIS portal as fallback

Moderate — can still access data via SIS

Payments

Tap gateway down or KNET certification revoked

Disable in\-app payment with clear message; redirect to university’s existing payment portal; manual payment recording by admin; MyFatoorah as backup gateway

Low — alternative payment paths exist

AI advisor

Model producing inaccurate or harmful responses

Kill switch: disable AI advisor across all instances within 5 minutes via feature flag; redirect queries to FAQ page \+ human advisor contact; post\-incident review and model retraining

Low — AI is supplementary, not critical path

Social

Moderation failure, inappropriate content spread

Disable social feed via feature flag; review and purge content; restrict posting to moderated\-only mode; resume with stricter auto\-moderation

Minimal — social features are P1/P2

Campus life

Event data inaccurate or map service outage

Display cached event data with staleness warning; disable map feature; redirect to university events page

Minimal

### Platform\-level contingency

__Scenario__

__Response__

__RTO / RPO__

AWS Bahrain region outage

Automatic failover to Azure UAE Central \(DR region\); DNS switched via Route 53 health check; read\-only mode if write replication delayed

RTO: 30 min / RPO: 5 min

Database corruption

Restore from automated RDS snapshot \(every 5 min\); replay missed transactions from SQS dead\-letter queue

RTO: 1 hr / RPO: 5 min

Security breach / data leak

Activate incident response plan; rotate all credentials; notify affected universities within 24hr \(DPPR compliance\); engage forensic team; publish transparency report

Notification: 24 hr

Complete pilot failure

Contractual data export to university in standard format \(CSV/JSON\); 90\-day wind\-down support; decommission university instance; post\-mortem documentation

Data export: 7 days

Funding gap before breakeven

Reduce team to core 8 \(cut business/ops hires\); extend runway 6\+ months; explore revenue acceleration via implementation fees; bridge financing

Decision trigger: <6 months runway

# 18\. Appendices

## A\. Competitive landscape

__Platform__

__Type__

__Arabic\-first?__

__GCC payments?__

__AI features__

__Mobile app__

Blackboard

LMS

No

No

Limited

Basic

Ellucian Banner

SIS/ERP

No

No

No

No

Canvas

LMS

No

No

Limited

Yes

Ready Education

Engagement

No

No

No

Yes

Modo Labs

Engagement

No

No

No

Yes

Unipal

Student ID

Partial

Bahrain only

No

Yes

Baims

Tutoring

Yes

No

No

Yes

__Masari__

__Full suite__

__Yes__

__All 6 GCC__

__Full AI__

__Yes__

## B\. Glossary

__Term__

__Definition__

LTI

Learning Tools Interoperability — IMS Global standard for LMS tool integration

SIS

Student Information System — system of record for student data, enrollment, grades

LMS

Learning Management System — platform for course content and online learning

RAG

Retrieval Augmented Generation — AI technique grounding LLM responses in documents

KNET

Kuwait’s national debit card network \(~85% of online transactions\)

mada

Saudi Arabia’s national debit card network

PDPL

Personal Data Protection Law \(Saudi Arabia’s comprehensive privacy regulation\)

RTL

Right\-to\-Left — text direction for Arabic script

Hijri

Islamic lunar calendar used alongside Gregorian in GCC countries

SSO

Single Sign\-On — authentication allowing one login across multiple systems

OIDC

OpenID Connect — identity layer on top of OAuth 2\.0

DPIA

Data Protection Impact Assessment — required by PDPL for high\-risk processing

EAS

Expo Application Services — cloud build and submission service for React Native

RTO/RPO

Recovery Time Objective / Recovery Point Objective — disaster recovery targets

*End of Document*

