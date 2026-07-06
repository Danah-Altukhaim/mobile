'use client';

// Client-side store for submitted equivalency requests, backing the
// "Submitted requests" dashboard (Equivalency Screen Feedback). The workflow
// is a self-contained, demo-style flow with no request persistence on the
// backend, so each request being worked on is mirrored into localStorage and
// the dashboard reads from there. A custom event keeps any open tab in sync.

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cck.equivalency.requests';
// Full workflow state per request, so the dashboard can reopen a request
// straight back into the staged workflow with its real course mappings (not
// just the summary row). Kept in a separate key from the lightweight summaries.
const SNAPSHOT_KEY = 'cck.equivalency.snapshots';
const CHANGE_EVENT = 'cck-equivalency-requests-changed';

// Mirrors the workflow stages so the dashboard can show where each request is.
// The equivalency form is split into two hand-offs: `registration` (registration
// staff fill the prior-course columns) then `academic` (academic staff map the
// CCK equivalents).
export type EquivalencyRequestStage = 'registration' | 'academic' | 'vp' | 'student' | 'done';

// Final decision recorded once a request reaches the `done` stage, set by the
// admission staff on the "Discuss with student" screen. Drives the colour of the
// last progress bar on the dashboard (green / red / orange).
export type EquivalencyOutcome = 'accepted' | 'declined' | 'pending';

export interface EquivalencyRequestRecord {
  id: string;
  stage: EquivalencyRequestStage;
  applicant: string;
  phone: string;
  civilId: string;
  major: string;
  secondMajor: string;
  source: 'paaet' | 'public' | 'private';
  sourceInstitution: string;
  courseCount: number;
  totalCredits: number;
  /** True when the mapping currently has blocking policy violations. */
  blocked: boolean;
  /** Student's final decision; only meaningful once `stage` is `done`. */
  outcome?: EquivalencyOutcome;
  /** Epoch ms of the last update - stamped here so callers stay deterministic. */
  updatedAt: number;
}

/** Generate a stable request id, with a fallback for older browsers. */
export function makeRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function read(): EquivalencyRequestRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EquivalencyRequestRecord[]) : [];
  } catch {
    return [];
  }
}

function write(records: EquivalencyRequestRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* ignore quota / serialization errors - the dashboard is best-effort */
  }
}

export function loadEquivalencyRequests(): EquivalencyRequestRecord[] {
  return read().sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Insert or update a request by id, stamping the update time. */
export function upsertEquivalencyRequest(
  record: Omit<EquivalencyRequestRecord, 'updatedAt'>,
): void {
  const records = read();
  const next: EquivalencyRequestRecord = { ...record, updatedAt: Date.now() };
  const idx = records.findIndex((r) => r.id === record.id);
  if (idx >= 0) records[idx] = next;
  else records.push(next);
  write(records);
}

export function removeEquivalencyRequest(id: string): void {
  write(read().filter((r) => r.id !== id));
  const snapshots = readSnapshots();
  if (id in snapshots) {
    delete snapshots[id];
    writeSnapshots(snapshots);
  }
}

export function clearEquivalencyRequests(): void {
  write([]);
  writeSnapshots({});
}

// Snapshot store ────────────────────────────────────────────────────────────
// A snapshot is the full serializable workflow state for a request. Uploaded
// File objects are not serializable and are intentionally omitted by the caller.
export type EquivalencySnapshot = Record<string, unknown>;

function readSnapshots(): Record<string, EquivalencySnapshot> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, EquivalencySnapshot>)
      : {};
  } catch {
    return {};
  }
}

function writeSnapshots(map: Record<string, EquivalencySnapshot>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota / serialization errors - snapshots are best-effort */
  }
}

/** Save the full workflow state for a request, overwriting any prior snapshot. */
export function saveEquivalencySnapshot(id: string, snapshot: EquivalencySnapshot): void {
  if (!id) return;
  const map = readSnapshots();
  map[id] = snapshot;
  writeSnapshots(map);
}

/** Read the saved workflow state for a request, or null if none was stored. */
export function loadEquivalencySnapshot(id: string): EquivalencySnapshot | null {
  return readSnapshots()[id] ?? null;
}

/** React hook that returns the tracked requests and re-renders on any change
 *  (same tab via the custom event, other tabs via the storage event). */
export function useEquivalencyRequests(): EquivalencyRequestRecord[] {
  const [records, setRecords] = useState<EquivalencyRequestRecord[]>([]);
  useEffect(() => {
    const sync = () => setRecords(loadEquivalencyRequests());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return records;
}

/** Result of {@link useEquivalencyRequest}: `loading` until the client store has
 *  been read once, then the matching record or `null` if no such id exists. */
export interface SingleRequestResult {
  request: EquivalencyRequestRecord | null;
  loading: boolean;
}

/** React hook for a single request by id, kept in sync with the store. */
export function useEquivalencyRequest(id: string): SingleRequestResult {
  const [result, setResult] = useState<SingleRequestResult>({ request: null, loading: true });
  useEffect(() => {
    const sync = () =>
      setResult({ request: read().find((r) => r.id === id) ?? null, loading: false });
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [id]);
  return result;
}
