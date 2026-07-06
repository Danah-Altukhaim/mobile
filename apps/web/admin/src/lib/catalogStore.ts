'use client';

// Client-side editable layer over the static CCK catalog.
//
// The catalog (COURSES / PROGRAMS) ships as auto-generated static data in
// @masari/shared. There is no backend courses API, so admin edits are kept
// locally: once anything is changed, the full edited array is persisted to
// localStorage and used in place of the bundled defaults. "Reset" clears the
// override and falls back to the shipped data.

import { useSyncExternalStore } from 'react';
import { COURSES, PROGRAMS } from '@masari/shared';
import type { CatalogCourse, DegreeProgram, ProgramSlug } from '@masari/shared';

const COURSES_KEY = 'cck-catalog-courses-v1';
const PROGRAMS_KEY = 'cck-catalog-programs-v1';

/** Every CCK program slug, including the few that have no published major
 *  sheet yet (so a course can still be tagged into them). */
export const ALL_PROGRAM_SLUGS: ProgramSlug[] = [
  'diploma-accounting',
  'diploma-marketing',
  'diploma-management',
  'diploma-cp',
  'diploma-iawd',
  'diploma-imd',
  'bba-accounting',
  'bba-management',
  'bba-marketing',
  'basc-cs',
];

interface State {
  courses: CatalogCourse[];
  programs: DegreeProgram[];
}

const DEFAULTS: State = { courses: COURSES, programs: PROGRAMS };

let state: State = DEFAULTS;
let hydrated = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function load(): State {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const rawCourses = window.localStorage.getItem(COURSES_KEY);
    const rawPrograms = window.localStorage.getItem(PROGRAMS_KEY);
    return {
      courses: rawCourses ? (JSON.parse(rawCourses) as CatalogCourse[]) : DEFAULTS.courses,
      programs: rawPrograms ? (JSON.parse(rawPrograms) as DegreeProgram[]) : DEFAULTS.programs,
    };
  } catch {
    return DEFAULTS;
  }
}

function persist() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(COURSES_KEY, JSON.stringify(state.courses));
    window.localStorage.setItem(PROGRAMS_KEY, JSON.stringify(state.programs));
  } catch {
    /* storage full / unavailable - keep in-memory state */
  }
}

function commit(next: State) {
  state = next;
  persist();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!hydrated && typeof window !== 'undefined') {
    hydrated = true;
    state = load();
    emit();
  }
  return () => {
    listeners.delete(listener);
  };
}

// --- Actions ---------------------------------------------------------------

export const catalogActions = {
  /** Insert or update a course. `originalCode` is the code before editing
   *  (null when creating); passing it lets a rename move the row in place. */
  saveCourse(originalCode: string | null, course: CatalogCourse) {
    const courses = clone(state.courses);
    const idx = originalCode ? courses.findIndex((c) => c.code === originalCode) : -1;
    if (idx >= 0) courses[idx] = course;
    else courses.unshift(course);
    commit({ ...state, courses });
  },

  deleteCourse(code: string) {
    commit({ ...state, courses: state.courses.filter((c) => c.code !== code) });
  },

  /** Insert or update a degree plan, keyed by slug. */
  saveProgram(originalSlug: string | null, program: DegreeProgram) {
    const programs = clone(state.programs);
    const idx = originalSlug ? programs.findIndex((p) => p.slug === originalSlug) : -1;
    if (idx >= 0) programs[idx] = program;
    else programs.push(program);
    commit({ ...state, programs });
  },

  deleteProgram(slug: string) {
    commit({ ...state, programs: state.programs.filter((p) => p.slug !== slug) });
  },

  /** Drop all local edits and revert to the bundled catalog. */
  reset() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(COURSES_KEY);
      window.localStorage.removeItem(PROGRAMS_KEY);
    }
    commit(DEFAULTS);
  },
};

// --- Hooks -----------------------------------------------------------------

export function useCatalogCourses(): CatalogCourse[] {
  return useSyncExternalStore(subscribe, () => state.courses, () => DEFAULTS.courses);
}

export function useCatalogPrograms(): DegreeProgram[] {
  return useSyncExternalStore(subscribe, () => state.programs, () => DEFAULTS.programs);
}

/** True when the local catalog differs from the bundled defaults. */
export function useCatalogEdited(): boolean {
  const isEdited = () =>
    state.courses !== DEFAULTS.courses || state.programs !== DEFAULTS.programs;
  return useSyncExternalStore(subscribe, isEdited, () => false);
}
