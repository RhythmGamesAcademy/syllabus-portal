"use client";

import React, { useState, useRef } from "react";
import { flushSync } from "react-dom";
import TextInput from "./ui/TextInput";
import TextArea from "./ui/TextArea";
import SelectInput from "./ui/SelectInput";
import ListInput from "./ui/ListInput";
import AgreementSection from "./ui/AgreementSection";
import SectionHeading from "./ui/SectionHeading";
import DraftActions, { type DraftNotice } from "./ui/DraftActions";
import CoursePngTemplate from "./png/CoursePngTemplate";
import {
  type CourseFormData,
  createEmptyCourseForm,
  DEPARTMENTS,
  DEPARTMENT_CATEGORIES,
  COURSE_OFFERING_TYPES,
  COURSE_LANGUAGES,
  calculateCredits,
} from "@/lib/types";
import {
  CHAR_LIMITS,
  MAX_GOAL_ITEMS,
  PLACEHOLDERS,
  SESSION_MAX,
  SESSION_MIN,
} from "@/lib/constants";
import { generatePng, formatDateForFilename, sanitizeFilename } from "@/lib/generatePng";
import {
  formatOfferingForPng,
  getAcademicTermNumber,
  getNextAcademicTermBoundary,
} from "@/lib/academicPeriod";
import {
  COURSE_DRAFT_KEY,
  createCourseDraft,
  parseCourseDraft,
} from "@/lib/formDrafts";
import {
  deleteLocalDraft,
  readLocalDraft,
  writeLocalDraft,
} from "@/lib/localDraft";
import { usePolicyAgreement } from "@/lib/usePolicyAgreement";
import { getLocalizedCharacterLimit, useLocale } from "@/lib/i18n";

export default function CourseForm() {
  const { locale, t } = useLocale();
  const [formData, setFormData] = useState<CourseFormData>(createEmptyCourseForm());
  const currentFormData = React.useMemo(
    () => ({ ...createEmptyCourseForm(), ...formData }),
    [formData]
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTerm, setCurrentTerm] = useState<number | null>(null);
  const [draftNotice, setDraftNotice] = useState<DraftNotice | null>(null);
  const [pngSnapshot, setPngSnapshot] = useState<{
    generatedAt: Date;
    termNumber: number;
  } | null>(null);
  const templateRef = useRef<HTMLDivElement>(null);
  const hasUserEditedRef = useRef(false);

  React.useEffect(() => {
    if (hasUserEditedRef.current) return;

    const result = readLocalDraft(COURSE_DRAFT_KEY, "course", parseCourseDraft);

    if (result.status === "loaded") {
      setFormData({ ...createEmptyCourseForm(), ...result.data });
      setDraftNotice({
        kind: "info",
        message: "保存済みの下書きを復元しました。確認・同意項目は再度確認してください。",
      });
    } else if (result.status === "invalid") {
      setDraftNotice({
        kind: "error",
        message: "保存済みの下書きを読み込めませんでした。データが破損しているか、現在のフォーム形式と異なる可能性があります。下書きは削除せず残しています。",
      });
    } else if (result.status === "unavailable") {
      setDraftNotice({
        kind: "error",
        message: "ブラウザの保存領域を利用できないため、下書きを読み込めませんでした。",
      });
    }
  }, []);

  React.useEffect(() => {
    let timer: number | undefined;

    const refreshTerm = () => {
      const now = new Date();
      setCurrentTerm(getAcademicTermNumber(now));

      const nextBoundary = getNextAcademicTermBoundary(now);
      const untilBoundary = nextBoundary.getTime() - now.getTime();
      // Long waits are checked hourly so browser timer limits cannot skip a boundary.
      const delay = Math.min(Math.max(untilBoundary + 20, 20), 60 * 60 * 1000);
      timer = window.setTimeout(refreshTerm, delay);
    };

    const refreshWhenVisible = () => {
      if (!document.hidden) {
        if (timer !== undefined) window.clearTimeout(timer);
        refreshTerm();
      }
    };

    refreshTerm();
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  const { activeModalId, openModal, closeModal, handleCheckboxChange } = usePolicyAgreement({
    onAgree: (field, value) => updateField(field, value),
  });

  // Field change helper
  const updateField = <K extends keyof CourseFormData>(key: K, value: CourseFormData[K]) => {
    hasUserEditedRef.current = true;
    setDraftNotice(null);
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Handle department change with cascading reset of courseCategory
  const handleDepartmentChange = (dept: string) => {
    hasUserEditedRef.current = true;
    setDraftNotice(null);
    setFormData((prev) => ({
      ...prev,
      department: dept as CourseFormData["department"],
      courseCategory: "",
    }));
  };

  // Handle session count change
  const handleSessionChange = (valStr: string) => {
    if (!/^\d*$/.test(valStr)) return;
    if (valStr === "") {
      updateField("sessionCount", "");
      return;
    }
    const sessionCount = Number(valStr);
    if (Number.isSafeInteger(sessionCount)) {
      updateField("sessionCount", sessionCount);
    }
  };

  // Session count validation & auto credit calculation
  const sessionCountNum =
    typeof currentFormData.sessionCount === "number"
      ? currentFormData.sessionCount
      : 0;
  const isSessionValid = sessionCountNum >= SESSION_MIN && sessionCountNum <= SESSION_MAX;
  const credits = calculateCredits(sessionCountNum);
  const characterLimits = React.useMemo(
    () => ({
      overview: getLocalizedCharacterLimit(CHAR_LIMITS.overview, locale),
      goal: getLocalizedCharacterLimit(CHAR_LIMITS.goal, locale),
      approach: getLocalizedCharacterLimit(CHAR_LIMITS.approach, locale),
      sessionContent: getLocalizedCharacterLimit(CHAR_LIMITS.sessionContent, locale),
      aiUsage: getLocalizedCharacterLimit(CHAR_LIMITS.aiUsage, locale),
      gradingMethod: getLocalizedCharacterLimit(CHAR_LIMITS.gradingMethod, locale),
      reference: getLocalizedCharacterLimit(CHAR_LIMITS.reference, locale),
    }),
    [locale]
  );

  // Validation: check if form is valid and generation button should be enabled
  const isFormValid = React.useMemo(() => {
    const {
      subjectName,
      instructorName,
      department,
      courseCategory,
      offeringType,
      overview,
      goals,
      approach,
      language,
      sessionContents,
      aiUsage,
      gradingMethod,
      references,
      confirmNoFalsehood,
      confirmPrivacyPolicy,
      confirmRegulations,
    } = currentFormData;

    const hasRequiredFields =
      subjectName.trim() !== "" &&
      instructorName.trim() !== "" &&
      department !== "" &&
      courseCategory !== "" &&
      offeringType !== "" &&
      isSessionValid &&
      overview.trim() !== "" &&
      overview.length <= characterLimits.overview &&
      approach.trim() !== "" &&
      approach.length <= characterLimits.approach &&
      language !== "" &&
      aiUsage.trim() !== "" &&
      aiUsage.length <= characterLimits.aiUsage &&
      gradingMethod.trim() !== "" &&
      gradingMethod.length <= characterLimits.gradingMethod &&
      (references === "" || references.length <= characterLimits.reference);

    const hasValidGoals =
      goals.length > 0 &&
      goals.some((g) => g.trim() !== "") &&
      goals.filter(g => g.trim() !== "").every((g) => g.length <= characterLimits.goal);
    const hasValidSessionContents =
      sessionContents.length >= sessionCountNum &&
      sessionContents
        .slice(0, sessionCountNum)
        .every(
          (content) =>
            content.trim() !== "" && content.length <= characterLimits.sessionContent
        );

    return (
      hasRequiredFields &&
      hasValidGoals &&
      hasValidSessionContents &&
      confirmNoFalsehood &&
      confirmPrivacyPolicy &&
      confirmRegulations
    );
  }, [currentFormData, isSessionValid, sessionCountNum, characterLimits]);

  const handleSaveDraft = () => {
    hasUserEditedRef.current = true;
    const draftData = createCourseDraft(currentFormData);
    if (parseCourseDraft(draftData) === null) {
      setDraftNotice({
        kind: "error",
        message: "入力内容が下書きの保存可能な形式を超えています。入力内容を確認してください。既存の下書きは削除していません。",
      });
      return;
    }

    const saved = writeLocalDraft(
      COURSE_DRAFT_KEY,
      "course",
      draftData
    );

    setDraftNotice(
      saved
        ? {
            kind: "success",
            message: "下書きを保存しました。このブラウザに保存されています。",
          }
        : {
            kind: "error",
            message: "下書きを保存できませんでした。ブラウザの設定や保存容量をご確認ください。既存の下書きは削除していません。",
          }
    );
  };

  const handleDeleteDraft = () => {
    hasUserEditedRef.current = true;
    const deleted = deleteLocalDraft(COURSE_DRAFT_KEY);
    setDraftNotice(
      deleted
        ? {
            kind: "success",
            message: "保存済みの下書きを削除しました。入力中の内容は保持されています。",
          }
        : {
            kind: "error",
            message: "下書きを削除できませんでした。ブラウザの設定をご確認ください。",
          }
    );
  };

  // Handle PNG generation
  const handleGenerate = async () => {
    if (!isFormValid || !templateRef.current || isGenerating) return;

    const generatedAt = new Date();
    const termNumber = getAcademicTermNumber(generatedAt);
    if (termNumber === null) return;

    try {
      flushSync(() => {
        setCurrentTerm(termNumber);
        setPngSnapshot({ generatedAt, termNumber });
        setIsGenerating(true);
      });

      const filename = `${locale === "ja" ? "シラバス" : locale === "en" ? "Syllabus" : "教学大纲"}_${sanitizeFilename(
        currentFormData.subjectName
      )}_${formatDateForFilename(generatedAt)}.png`;
      await generatePng(templateRef.current, filename);
    } catch (err) {
      console.error("PNG generation error:", err);
      alert(t("PNGの生成に失敗しました。もう一度お試しください。"));
    } finally {
      flushSync(() => {
        setPngSnapshot(null);
        setIsGenerating(false);
      });
    }
  };

  const availableCategories = currentFormData.department
    ? DEPARTMENT_CATEGORIES[currentFormData.department]
    : [];

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <SectionHeading divider={false}>{t("シラバス基本情報")}</SectionHeading>

        {/* Subject Name & Instructor Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            id="course-subject"
            label={t("科目名")}
            value={currentFormData.subjectName}
            onChange={(val) => updateField("subjectName", val)}
            placeholder={t(PLACEHOLDERS.course.subjectName)}
            required
          />
          <TextInput
            id="course-instructor"
            label={t("担当講師")}
            value={currentFormData.instructorName}
            onChange={(val) => updateField("instructorName", val)}
            placeholder={t(PLACEHOLDERS.course.instructorName)}
            required
          />
        </div>

        {/* Department & Course Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            id="course-department"
            label={t("対象学部")}
            value={currentFormData.department}
            onChange={handleDepartmentChange}
            options={DEPARTMENTS}
            optionLabels={DEPARTMENTS}
            required
          />
          <SelectInput
            id="course-category"
            label={t("講義区分")}
            value={currentFormData.courseCategory}
            onChange={(val) => updateField("courseCategory", val)}
            options={availableCategories}
            optionLabels={availableCategories}
            placeholder={t(
              currentFormData.department
                ? "選択してください"
                : "先に対象学部を選択してください"
            )}
            required
            disabled={!currentFormData.department}
          />
        </div>

        <SectionHeading>{t("開講条件")}</SectionHeading>

        <div className="max-w-xl">
          <SelectInput
            id="course-offering-type"
            label={t("開講時期")}
            value={currentFormData.offeringType}
            onChange={(val) =>
              updateField("offeringType", val as CourseFormData["offeringType"])
            }
            options={COURSE_OFFERING_TYPES}
            optionLabels={COURSE_OFFERING_TYPES}
            required
          />
          <p className="mt-2 text-sm text-[var(--color-text-muted)]" aria-live="polite">
            {currentTerm === null
              ? currentFormData.offeringType
                ? locale === "ja"
                  ? `選択結果: ${currentFormData.offeringType}（対象期は2026年8月1日以降に確定）`
                  : locale === "en"
                    ? `Selected: ${currentFormData.offeringType} (term confirmed from August 1, 2026)`
                    : `所选：${currentFormData.offeringType}（开课学期将于 2026 年 8 月 1 日起确定）`
                : t("対象期は2026年8月1日以降に表示されます。")
              : currentFormData.offeringType
                ? `${t("PNGへの印字: ")}${formatOfferingForPng(currentFormData.offeringType, currentTerm, locale)}`
                : locale === "ja"
                  ? `対象期: #${currentTerm}期（開講時期を選択するとPNGへの印字を確認できます）`
                  : locale === "en"
                    ? `Term: #${currentTerm} (select an offering period to preview the PNG)`
                    : `学期：第${currentTerm}学期（选择开课时间后可预览 PNG 内容）`}
          </p>
        </div>

        {/* Session Count & Credits (auto calculated) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div>
            <TextInput
              id="course-sessions"
              label={t("講義回数 (3〜15回)")}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={currentFormData.sessionCount === "" ? "" : String(currentFormData.sessionCount)}
              onChange={handleSessionChange}
              placeholder={t(PLACEHOLDERS.course.sessionCount)}
              required
            />
            {currentFormData.sessionCount !== "" && !isSessionValid && (
              <p className="text-xs text-[var(--color-error)] mt-1">
                {t("講義回数は半角数字で 3〜15 回の範囲で入力してください")}
              </p>
            )}
          </div>
          <div>
            <label className="form-label">
              {t("単位")}
              <span className="badge-auto">{t("自動算出")}</span>
            </label>
            <div className="auto-value">
              {isSessionValid
                ? locale === "ja"
                  ? `${credits} 単位`
                  : `${credits}${locale === "en" ? " " : ""}${t("単位")}`
                : locale === "ja"
                  ? "- 単位"
                  : `-${locale === "en" ? " " : ""}${t("単位")}`}
              <span className="text-xs text-[var(--color-text-muted)] font-normal ml-2">
                {t("(3〜5回:1 / 6〜10回:2 / 11〜15回:3)")}
              </span>
            </div>
          </div>
        </div>

        <SectionHeading>{t("講義内容")}</SectionHeading>

        {/* Course Overview */}
        <TextArea
          id="course-overview"
          label={t("講義概要")}
          value={currentFormData.overview}
          onChange={(val) => updateField("overview", val)}
          placeholder={t(PLACEHOLDERS.course.overview)}
          required
          maxLength={characterLimits.overview}
        />

        {/* Goals */}
        <ListInput
          id="course-goals"
          label={t("受講者の到達目標")}
          items={currentFormData.goals}
          onChange={(items) => updateField("goals", items)}
          placeholder={t(PLACEHOLDERS.course.goal)}
          required
          maxLength={characterLimits.goal}
          maxItems={MAX_GOAL_ITEMS}
        />

        {/* Approach / Policy */}
        <TextArea
          id="course-approach"
          label={t("講義の進め方・方針")}
          value={currentFormData.approach}
          onChange={(val) => updateField("approach", val)}
          placeholder={t(PLACEHOLDERS.course.approach)}
          required
          maxLength={characterLimits.approach}
        />

        <SelectInput
          id="course-language"
          label={t("使用言語（原語表記）")}
          value={currentFormData.language}
          onChange={(value) =>
            updateField("language", value as CourseFormData["language"])
          }
          options={COURSE_LANGUAGES}
          optionLabels={COURSE_LANGUAGES}
          required
        />

        {isSessionValid && (
          <ListInput
            id="course-session-contents"
            label={
              locale === "ja"
                ? `各回の内容（各回${characterLimits.sessionContent}文字以内）`
                : locale === "en"
                  ? `Session Topics (up to ${characterLimits.sessionContent} characters each)`
                  : `每次课程内容（每项最多 ${characterLimits.sessionContent} 个字符）`
            }
            items={currentFormData.sessionContents}
            onChange={(items) => updateField("sessionContents", items)}
            placeholder={t("各回で扱う内容")}
            required
            maxLength={characterLimits.sessionContent}
            maxItems={SESSION_MAX}
            fixedCount={sessionCountNum}
          />
        )}

        <TextArea
          id="course-ai-usage"
          label={t("受講者の生成AIの使用について")}
          value={currentFormData.aiUsage}
          onChange={(value) => updateField("aiUsage", value)}
          placeholder={t(PLACEHOLDERS.course.aiUsage)}
          required
          maxLength={characterLimits.aiUsage}
        />

        <TextArea
          id="course-grading-method"
          label={t("成績評価方法")}
          value={currentFormData.gradingMethod}
          onChange={(value) => updateField("gradingMethod", value)}
          placeholder={t(PLACEHOLDERS.course.gradingMethod)}
          required
          maxLength={characterLimits.gradingMethod}
        />

        <TextArea
          id="course-references"
          label={t("参考文献など")}
          value={currentFormData.references}
          onChange={(value) => updateField("references", value)}
          placeholder={t(PLACEHOLDERS.course.references)}
          maxLength={characterLimits.reference}
        />

        <SectionHeading>{t("確認・同意")}</SectionHeading>

        <AgreementSection
          confirmNoFalsehood={currentFormData.confirmNoFalsehood}
          onFalsehoodChange={(val) => updateField("confirmNoFalsehood", val)}
          falsehoodCheckboxId="confirm-falsehood-course"
          policies={[
            {
              modalId: "privacy",
              checkboxId: "confirm-privacy-course",
              checked: currentFormData.confirmPrivacyPolicy,
              markdownPath: "/privacy-policy.md",
              title: t("プライバシーポリシー"),
              label: t("に同意します"),
              field: "confirmPrivacyPolicy",
            },
            {
              modalId: "lecturer",
              checkboxId: "confirm-regulations-course",
              checked: currentFormData.confirmRegulations,
              markdownPath: "/lecturer-policy.md",
              title: t("講師規約"),
              label: t("に同意し、遵守することを誓います"),
              field: "confirmRegulations",
            },
          ]}
          activeModalId={activeModalId}
          onModalClose={closeModal}
          onModalAgree={(field) => {
            updateField(field, true);
            closeModal();
          }}
          onCheckboxChange={handleCheckboxChange}
          onOpenModal={openModal}
        />

        {/* Generate Button */}
        <div className="pt-2 space-y-4">
          <DraftActions
            notice={draftNotice}
            onSave={handleSaveDraft}
            onDelete={handleDeleteDraft}
          />
          <button
            type="button"
            className="btn-primary"
            disabled={!isFormValid || currentTerm === null || isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? (
              <>
                <span className="spinner" />
                <span>{t("PNG作成中...")}</span>
              </>
            ) : (
              <span>{t("シラバスPNGをダウンロード")}</span>
            )}
          </button>
        </div>
      </form>

      {/* Hidden DOM element for PNG rendering */}
      <CoursePngTemplate
        ref={templateRef}
        data={currentFormData}
        generatedAt={pngSnapshot?.generatedAt}
        termNumber={pngSnapshot?.termNumber}
      />
    </div>
  );
}
