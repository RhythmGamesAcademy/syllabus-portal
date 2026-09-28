"use client";

import React, { useState, useRef } from "react";
import TextInput from "./ui/TextInput";
import TextArea from "./ui/TextArea";
import SelectInput from "./ui/SelectInput";
import ListInput from "./ui/ListInput";
import AgreementSection from "./ui/AgreementSection";
import SectionHeading from "./ui/SectionHeading";
import DraftActions, { type DraftNotice } from "./ui/DraftActions";
import InstructorPngTemplate from "./png/InstructorPngTemplate";
import {
  type InstructorFormData,
  createEmptyInstructorForm,
  DEPARTMENTS,
  DEPARTMENT_CATEGORIES,
} from "@/lib/types";
import {
  CHAR_LIMITS,
  MAX_ACHIEVEMENT_ITEMS,
  PLACEHOLDERS,
} from "@/lib/constants";
import { generatePng, formatDateForFilename, sanitizeFilename } from "@/lib/generatePng";
import {
  createInstructorDraft,
  INSTRUCTOR_DRAFT_KEY,
  parseInstructorDraft,
} from "@/lib/formDrafts";
import {
  deleteLocalDraft,
  readLocalDraft,
  writeLocalDraft,
} from "@/lib/localDraft";
import { usePolicyAgreement } from "@/lib/usePolicyAgreement";

export default function InstructorForm() {
  const [formData, setFormData] = useState<InstructorFormData>(createEmptyInstructorForm());
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftNotice, setDraftNotice] = useState<DraftNotice | null>(null);
  const templateRef = useRef<HTMLDivElement>(null);
  const hasUserEditedRef = useRef(false);

  React.useEffect(() => {
    if (hasUserEditedRef.current) return;

    const result = readLocalDraft(
      INSTRUCTOR_DRAFT_KEY,
      "instructor",
      parseInstructorDraft
    );

    if (result.status === "loaded") {
      setFormData({ ...createEmptyInstructorForm(), ...result.data });
      setDraftNotice({
        kind: "info",
        message: "保存済みの下書きを復元しました。確認・同意項目は再度確認してください。",
      });
    } else if (result.status === "invalid") {
      setDraftNotice({
        kind: "error",
        message:
          "保存済みの下書きを読み込めませんでした。データが破損しているか、現在のフォーム形式と異なる可能性があります。下書きは削除せず残しています。",
      });
    } else if (result.status === "unavailable") {
      setDraftNotice({
        kind: "error",
        message: "ブラウザの保存領域を利用できないため、下書きを読み込めませんでした。",
      });
    }
  }, []);

  const { activeModalId, openModal, closeModal, handleCheckboxChange } = usePolicyAgreement({
    onAgree: (field, value) => updateField(field, value),
  });

  // Field change helpers
  const updateField = <K extends keyof InstructorFormData>(key: K, value: InstructorFormData[K]) => {
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
      department: dept as InstructorFormData["department"],
      courseCategory: "",
    }));
  };

  const handleSaveDraft = () => {
    hasUserEditedRef.current = true;
    const draftData = createInstructorDraft(formData);
    if (parseInstructorDraft(draftData) === null) {
      setDraftNotice({
        kind: "error",
        message:
          "入力内容が下書きの保存可能な形式を超えています。入力内容を確認してください。既存の下書きは削除していません。",
      });
      return;
    }

    const saved = writeLocalDraft(
      INSTRUCTOR_DRAFT_KEY,
      "instructor",
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
            message:
              "下書きを保存できませんでした。ブラウザの設定や保存容量をご確認ください。既存の下書きは削除していません。",
          }
    );
  };

  const handleDeleteDraft = () => {
    hasUserEditedRef.current = true;
    const deleted = deleteLocalDraft(INSTRUCTOR_DRAFT_KEY);
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

  // Validation: check if form is valid and generation button should be enabled
  const isFormValid = React.useMemo(() => {
    const {
      name,
      field,
      department,
      courseCategory,
      fieldReason,
      achievements,
      selfAppeal,
      confirmNoFalsehood,
      confirmPrivacyPolicy,
      confirmRegulations,
    } = formData;

    const hasRequiredFields =
      name.trim() !== "" &&
      name.length <= CHAR_LIMITS.name &&
      field.trim() !== "" &&
      field.length <= CHAR_LIMITS.field &&
      department !== "" &&
      courseCategory !== "" &&
      fieldReason.trim() !== "" &&
      fieldReason.length <= CHAR_LIMITS.fieldReason &&
      selfAppeal.trim() !== "" &&
      selfAppeal.length <= CHAR_LIMITS.selfAppeal;

    // 実績は任意。未入力でも可だが、入力された項目は文字数制限を満たすこと。
    const hasValidAchievements = achievements
      .filter((a) => a.trim() !== "")
      .every((a) => a.length <= CHAR_LIMITS.achievement);

    return (
      hasRequiredFields &&
      hasValidAchievements &&
      confirmNoFalsehood &&
      confirmPrivacyPolicy &&
      confirmRegulations
    );
  }, [formData]);

  // Handle PNG generation
  const handleGenerate = async () => {
    if (!isFormValid || !templateRef.current || isGenerating) return;

    try {
      setIsGenerating(true);
      const filename = `講師登録申請書_${sanitizeFilename(formData.name)}_${formatDateForFilename()}.png`;
      await generatePng(templateRef.current, filename);
    } catch (err) {
      console.error("PNG generation error:", err);
      alert("PNGの生成に失敗しました。もう一度お試しください。");
    } finally {
      setIsGenerating(false);
    }
  };

  const availableCategories = formData.department
    ? DEPARTMENT_CATEGORIES[formData.department]
    : [];

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <SectionHeading divider={false}>基本情報</SectionHeading>

        {/* Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            id="instructor-name"
            label="講師名"
            value={formData.name}
            onChange={(val) => updateField("name", val)}
            placeholder={PLACEHOLDERS.instructor.name}
            required
            maxLength={CHAR_LIMITS.name}
          />
        </div>



        <SectionHeading>担当領域</SectionHeading>

        {/* Field */}
        <TextInput
          id="instructor-field"
          label="担当分野"
          value={formData.field}
          onChange={(val) => updateField("field", val)}
          placeholder={PLACEHOLDERS.instructor.field}
          required
          maxLength={CHAR_LIMITS.field}
        />

        {/* Department & Course Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            id="instructor-department"
            label="担当学部"
            value={formData.department}
            onChange={handleDepartmentChange}
            options={DEPARTMENTS}
            required
          />
          <SelectInput
            id="instructor-category"
            label="講義区分"
            value={formData.courseCategory}
            onChange={(val) => updateField("courseCategory", val)}
            options={availableCategories}
            placeholder={
              formData.department ? "選択してください" : "先に担当学部を選択してください"
            }
            required
            disabled={!formData.department}
          />
        </div>

        {/* Reason for Field */}
        <TextArea
          id="instructor-reason"
          label="担当分野の選定理由"
          value={formData.fieldReason}
          onChange={(val) => updateField("fieldReason", val)}
          placeholder={PLACEHOLDERS.instructor.fieldReason}
          required
          maxLength={CHAR_LIMITS.fieldReason}
        />

        <SectionHeading>実績・自己PR</SectionHeading>

        {/* Achievements */}
        <ListInput
          id="instructor-achievements"
          label="実績"
          items={formData.achievements}
          onChange={(items) => updateField("achievements", items)}
          placeholder={PLACEHOLDERS.instructor.achievement}
          maxLength={CHAR_LIMITS.achievement}
          maxItems={MAX_ACHIEVEMENT_ITEMS}
        />

        {/* Self Appeal */}
        <TextArea
          id="instructor-appeal"
          label="自己アピール"
          value={formData.selfAppeal}
          onChange={(val) => updateField("selfAppeal", val)}
          placeholder={PLACEHOLDERS.instructor.selfAppeal}
          required
          maxLength={CHAR_LIMITS.selfAppeal}
        />

        <SectionHeading>確認・同意</SectionHeading>

        <AgreementSection
          confirmNoFalsehood={formData.confirmNoFalsehood}
          onFalsehoodChange={(val) => updateField("confirmNoFalsehood", val)}
          falsehoodCheckboxId="confirm-falsehood-inst"
          policies={[
            {
              modalId: "privacy",
              checkboxId: "confirm-privacy-inst",
              checked: formData.confirmPrivacyPolicy,
              markdownPath: "/privacy-policy.md",
              title: "プライバシーポリシー",
              label: "に同意します",
              field: "confirmPrivacyPolicy",
            },
            {
              modalId: "lecturer",
              checkboxId: "confirm-regulations-inst",
              checked: formData.confirmRegulations,
              markdownPath: "/lecturer-policy.md",
              title: "講師向け運用案内（改訂案）",
              label: "を確認し、学園規則第6章第2条の同意事項を承諾します",
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
            disabled={!isFormValid || isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? (
              <>
                <span className="spinner" />
                <span>PNG生成中...</span>
              </>
            ) : (
              <span>申請書PNGをダウンロード</span>
            )}
          </button>
        </div>
      </form>

      {/* Hidden DOM element for PNG rendering */}
      <InstructorPngTemplate ref={templateRef} data={formData} />
    </div>
  );
}
