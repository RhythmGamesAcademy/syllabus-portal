import {
  COURSE_OFFERING_TYPES,
  COURSE_LANGUAGES,
  DEPARTMENTS,
  DEPARTMENT_CATEGORIES,
  type CourseFormData,
  type CourseOfferingType,
  type CourseLanguage,
  type Department,
  type InstructorFormData,
} from "./types";
import {
  MAX_ACHIEVEMENT_ITEMS,
  MAX_GOAL_ITEMS,
  SESSION_MAX,
} from "./constants";
import { isRecordValue } from "./localDraft";

export const INSTRUCTOR_DRAFT_KEY = "rga-forms-portal:instructor-draft";
export const COURSE_DRAFT_KEY = "rga-forms-portal:course-draft";

export type InstructorDraftData = Omit<
  InstructorFormData,
  "confirmNoFalsehood" | "confirmPrivacyPolicy" | "confirmRegulations"
>;

export type CourseDraftData = Omit<
  CourseFormData,
  "confirmNoFalsehood" | "confirmPrivacyPolicy" | "confirmRegulations"
>;

// This cap guards against unreasonable/corrupted values while allowing drafts
// to preserve text that currently exceeds a form's validation limit.
const MAX_DRAFT_TEXT_LENGTH = 2_000;

export function createInstructorDraft(data: InstructorFormData): InstructorDraftData {
  return {
    name: data.name,
    age: data.age,
    discordId: data.discordId,
    xId: data.xId,
    field: data.field,
    department: data.department,
    courseCategory: data.courseCategory,
    fieldReason: data.fieldReason,
    achievements: [...data.achievements],
    selfAppeal: data.selfAppeal,
  };
}

export function parseInstructorDraft(value: unknown): InstructorDraftData | null {
  if (!isRecordValue(value)) return null;

  const {
    name,
    age,
    discordId,
    xId,
    field,
    department,
    courseCategory,
    fieldReason,
    achievements,
    selfAppeal,
  } = value;
  const normalizedCategory = normalizeCourseCategory(department, courseCategory);

  if (
    !isDraftText(name) ||
    !isDraftText(age) ||
    !/^\d*$/.test(age) ||
    !isDraftText(discordId) ||
    !isDraftText(xId) ||
    !isDraftText(field) ||
    !isDepartment(department) ||
    normalizedCategory === null ||
    !isDraftText(fieldReason) ||
    !isStringList(achievements, MAX_ACHIEVEMENT_ITEMS) ||
    !isDraftText(selfAppeal)
  ) {
    return null;
  }

  return {
    name,
    age,
    discordId,
    xId,
    field,
    department,
    courseCategory: normalizedCategory,
    fieldReason,
    achievements,
    selfAppeal,
  };
}

export function createCourseDraft(data: CourseFormData): CourseDraftData {
  return {
    subjectName: data.subjectName,
    instructorName: data.instructorName,
    department: data.department,
    courseCategory: data.courseCategory,
    offeringType: data.offeringType,
    sessionCount: data.sessionCount,
    overview: data.overview,
    goals: [...data.goals],
    approach: data.approach,
    language: data.language,
    sessionContents: [...data.sessionContents],
    aiUsage: data.aiUsage,
    gradingMethod: data.gradingMethod,
    references: data.references,
  };
}

export function parseCourseDraft(value: unknown): CourseDraftData | null {
  if (!isRecordValue(value)) return null;

  const {
    subjectName,
    instructorName,
    department,
    courseCategory,
    offeringType,
    sessionCount,
    overview,
    goals,
    approach,
    language = "",
    sessionContents = [],
    aiUsage = "",
    gradingMethod = "",
    references = "",
  } = value;

  const normalizedOfferingType = normalizeCourseOfferingType(offeringType);
  const normalizedCategory = normalizeCourseCategory(department, courseCategory);

  if (
    !isDraftText(subjectName) ||
    !isDraftText(instructorName) ||
    !isDepartment(department) ||
    normalizedCategory === null ||
    !isCourseOfferingType(normalizedOfferingType) ||
    !isSessionCount(sessionCount) ||
    !isDraftText(overview) ||
    !isStringList(goals, MAX_GOAL_ITEMS) ||
    !isDraftText(approach) ||
    !isCourseLanguage(language) ||
    !isOptionalStringList(sessionContents, SESSION_MAX) ||
    !isDraftText(aiUsage) ||
    !isDraftText(gradingMethod) ||
    !isDraftText(references)
  ) {
    return null;
  }

  return {
    subjectName,
    instructorName,
    department,
    courseCategory: normalizedCategory,
    offeringType: normalizedOfferingType,
    sessionCount,
    overview,
    goals,
    approach,
    language,
    sessionContents,
    aiUsage,
    gradingMethod,
    references,
  };
}

function isDraftText(value: unknown): value is string {
  return typeof value === "string" && value.length <= MAX_DRAFT_TEXT_LENGTH;
}

function isStringList(value: unknown, maxItems: number): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= maxItems &&
    value.every(isDraftText)
  );
}

function isOptionalStringList(value: unknown, maxItems: number): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= maxItems &&
    value.every(isDraftText)
  );
}

function isDepartment(value: unknown): value is Department | "" {
  return value === "" || (DEPARTMENTS as readonly unknown[]).includes(value);
}

function normalizeCourseCategory(
  department: unknown,
  category: unknown
): string | null {
  if (typeof category !== "string") return null;
  if (category === "") return "";

  const normalizedCategory =
    department === "音ゲー基礎学部" && category === "文理系"
      ? "文理型"
      : category;
  if (
    isDepartment(department) &&
    department !== "" &&
    DEPARTMENT_CATEGORIES[department].includes(normalizedCategory)
  ) {
    return normalizedCategory;
  }
  return null;
}

function normalizeCourseOfferingType(value: unknown): unknown {
  if (value === "当期講義") return "当期講義";
  if (value === "通期講義") return "通期講義";
  return value;
}

function isCourseOfferingType(value: unknown): value is CourseOfferingType | "" {
  return value === "" || (COURSE_OFFERING_TYPES as readonly unknown[]).includes(value);
}

function isCourseLanguage(value: unknown): value is CourseLanguage | "" {
  return value === "" || (COURSE_LANGUAGES as readonly unknown[]).includes(value);
}

function isSessionCount(value: unknown): value is number | "" {
  return value === "" || (typeof value === "number" && Number.isSafeInteger(value));
}
