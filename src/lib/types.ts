// -- Department / Course Category types --

export const DEPARTMENTS = ["音ゲー基礎学部", "音ゲー実践学部"] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const COURSE_OFFERING_TYPES = ["当期講義", "通期講義"] as const;
export type CourseOfferingType = (typeof COURSE_OFFERING_TYPES)[number];

export const DEPARTMENT_CATEGORIES: Record<Department, readonly string[]> = {
  "音ゲー基礎学部": ["文理型", "創作系"],
  "音ゲー実践学部": ["アーケード系", "スタンドアロン系", "モバイル系"],
} as const;

export const COURSE_LANGUAGES = ["日本語", "English", "中文"] as const;
export type CourseLanguage = (typeof COURSE_LANGUAGES)[number];

// -- Policy agreement fields --

/**
 * Boolean fields backed by a policy modal. Both forms extend this, so
 * AgreementField and the actual form fields can never drift apart.
 */
export interface PolicyAgreements {
  confirmPrivacyPolicy: boolean;
  confirmRegulations: boolean;
}

export type AgreementField = keyof PolicyAgreements;

// -- Instructor Registration Form --


export interface InstructorFormData extends PolicyAgreements {
  name: string;
  age: string;
  discordId: string;
  xId: string;
  field: string;
  department: Department | "";
  courseCategory: string;
  fieldReason: string;
  achievements: string[];
  selfAppeal: string;
  confirmNoFalsehood: boolean;
}

export function createEmptyInstructorForm(): InstructorFormData {
  return {
    name: "",
    age: "",
    discordId: "",
    xId: "",
    field: "",
    department: "",
    courseCategory: "",
    fieldReason: "",
    achievements: [""],
    selfAppeal: "",
    confirmNoFalsehood: false,
    confirmPrivacyPolicy: false,
    confirmRegulations: false,
  };
}

// -- Course Opening Form --

export interface CourseFormData extends PolicyAgreements {
  subjectName: string;
  instructorName: string;
  department: Department | "";
  courseCategory: string;
  offeringType: CourseOfferingType | "";
  sessionCount: number | "";
  overview: string;
  goals: string[];
  approach: string;
  language: CourseLanguage | "";
  sessionContents: string[];
  aiUsage: string;
  gradingMethod: string;
  references: string;
  confirmNoFalsehood: boolean;
}

export function createEmptyCourseForm(): CourseFormData {
  return {
    subjectName: "",
    instructorName: "",
    department: "",
    courseCategory: "",
    offeringType: "",
    sessionCount: "",
    overview: "",
    goals: [""],
    approach: "",
    language: "",
    sessionContents: [],
    aiUsage: "",
    gradingMethod: "",
    references: "",
    confirmNoFalsehood: false,
    confirmPrivacyPolicy: false,
    confirmRegulations: false,
  };
}

// -- Credits calculation --

export function calculateCredits(sessions: number): number {
  if (sessions >= 3 && sessions <= 5) return 1;
  if (sessions >= 6 && sessions <= 10) return 2;
  if (sessions >= 11 && sessions <= 15) return 3;
  return 0;
}
