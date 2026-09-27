import type { CourseOfferingType } from "./types";
import type { Locale } from "./i18n";
import { getTokyoDateParts } from "./japanTime";

const FIRST_TERM_START_YEAR = 2026;
const FIRST_TERM_START_MONTH = 8;
const TOKYO_UTC_OFFSET_MS = 9 * 60 * 60 * 1000;

/** Returns the current term number, or null before the first term begins. */
export function getAcademicTermNumber(date: Date): number | null {
  const { year, month } = getTokyoDateParts(date);
  const monthIndex = year * 12 + month - 1;
  const firstTermMonthIndex =
    FIRST_TERM_START_YEAR * 12 + FIRST_TERM_START_MONTH - 1;

  if (monthIndex < firstTermMonthIndex) return null;

  return Math.floor((monthIndex - firstTermMonthIndex) / 6) + 1;
}

/** Returns the next term boundary as an instant, with month starts at Tokyo midnight. */
export function getNextAcademicTermBoundary(date: Date): Date {
  const { year, month } = getTokyoDateParts(date);
  const monthIndex = year * 12 + month - 1;
  const firstTermMonthIndex =
    FIRST_TERM_START_YEAR * 12 + FIRST_TERM_START_MONTH - 1;

  if (monthIndex < firstTermMonthIndex) {
    return tokyoMidnight(FIRST_TERM_START_YEAR, FIRST_TERM_START_MONTH);
  }

  if (month < 2) return tokyoMidnight(year, 2);
  if (month < 8) return tokyoMidnight(year, 8);
  return tokyoMidnight(year + 1, 2);
}

export function formatOfferingForPng(
  offeringType: CourseOfferingType,
  termNumber: number,
  locale: Locale = "ja"
): string {
  if (locale !== "ja") {
    const term =
      locale === "en" ? `Term #${termNumber}` : `第${termNumber}学期`;
    if (offeringType === "当期講義") return `${offeringType} (${term})`;
    return locale === "en"
      ? `${offeringType} (from ${term})`
      : `${offeringType}（从${term}开始）`;
  }
  const term = `#${termNumber}期`;
  return offeringType === "当期講義"
    ? `${offeringType}（${term}）`
    : `${offeringType}（${term}から）`;
}

function tokyoMidnight(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 1) - TOKYO_UTC_OFFSET_MS);
}
