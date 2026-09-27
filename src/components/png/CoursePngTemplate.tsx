"use client";

import React from "react";
import PngTemplate from "./PngTemplate";
import type { CourseFormData } from "@/lib/types";
import { calculateCredits } from "@/lib/types";
import { formatOfferingForPng } from "@/lib/academicPeriod";
import { useLocale } from "@/lib/i18n";

/**
 * Shared styles for the PNG document fields
 */
const fieldGroupStyle: React.CSSProperties = {
  marginBottom: "9px",
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: "10px",
  color: "#888888",
  marginBottom: "2px",
  fontWeight: 600,
  letterSpacing: "0.05em",
};

const fieldValueStyle: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "1.35",
  padding: "6px 9px",
  border: "1px solid #cccccc",
  borderRadius: "6px",
  minHeight: "28px",
  wordBreak: "break-word" as const,
  whiteSpace: "pre-wrap" as const,
};

const twoColGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
};

const threeColGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "8px",
};

const fourColGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "8px",
};

const sessionGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  columnGap: "8px",
  rowGap: "5px",
};

const listItemStyle: React.CSSProperties = {
  fontSize: "11px",
  lineHeight: "1.3",
  padding: "5px 8px",
  border: "1px solid #cccccc",
  borderRadius: "5px",
  wordBreak: "break-word" as const,
};

interface CoursePngTemplateProps {
  data: CourseFormData;
  generatedAt?: Date;
  termNumber?: number;
}

const CoursePngTemplate = React.forwardRef<
  HTMLDivElement,
  CoursePngTemplateProps
>(function CoursePngTemplate({ data, generatedAt, termNumber }, ref) {
  const { locale, t } = useLocale();
  const sessionCount =
    typeof data.sessionCount === "number" ? data.sessionCount : 0;
  const credits = calculateCredits(sessionCount);

  return (
    <PngTemplate ref={ref} title={t("シラバス")} generatedAt={generatedAt}>
      {/* Basic information */}
      <div style={twoColGrid}>
        <div style={fieldGroupStyle}>
          <div style={fieldLabelStyle}>{t("科目名")}</div>
          <div style={fieldValueStyle}>{data.subjectName}</div>
        </div>
        <div style={fieldGroupStyle}>
          <div style={fieldLabelStyle}>{t("担当講師")}</div>
          <div style={fieldValueStyle}>{data.instructorName}</div>
        </div>
      </div>

      <div style={twoColGrid}>
        <div style={fieldGroupStyle}>
          <div style={fieldLabelStyle}>{t("対象学部")}</div>
          <div style={fieldValueStyle}>{data.department}</div>
        </div>
        <div style={fieldGroupStyle}>
          <div style={fieldLabelStyle}>{t("講義区分")}</div>
          <div style={fieldValueStyle}>{data.courseCategory}</div>
        </div>
      </div>

      {/* Offering conditions */}
      <div style={fourColGrid}>
        <div style={fieldGroupStyle}>
          <div style={fieldLabelStyle}>{t("開講時期")}</div>
          <div style={fieldValueStyle}>
            {data.offeringType && termNumber
              ? formatOfferingForPng(data.offeringType, termNumber, locale)
              : ""}
          </div>
        </div>
        <div style={fieldGroupStyle}>
          <div style={fieldLabelStyle}>{t("講義回数")}</div>
          <div style={fieldValueStyle}>
            {locale === "ja" ? `${sessionCount}回` : `${sessionCount}${t("回")}`}
          </div>
        </div>
        <div style={fieldGroupStyle}>
          <div style={fieldLabelStyle}>{t("単位")}</div>
          <div style={fieldValueStyle}>
            {locale === "ja"
              ? `${credits}単位`
              : `${credits}${locale === "en" ? " " : ""}${t("単位")}`}
          </div>
        </div>
        <div style={fieldGroupStyle}>
          <div style={fieldLabelStyle}>{t("使用言語（原語表記）")}</div>
          <div style={fieldValueStyle}>{data.language}</div>
        </div>
      </div>

      {/* Overview and goals */}
      <div style={fieldGroupStyle}>
        <div style={fieldLabelStyle}>{t("講義概要")}</div>
        <div style={fieldValueStyle}>{data.overview}</div>
      </div>

      <div style={fieldGroupStyle}>
        <div style={fieldLabelStyle}>{t("受講者の到達目標")}</div>
        <div style={threeColGrid}>
          {data.goals.filter((goal) => goal.trim()).map((goal, idx) => (
            <div key={`goal-${idx}`} style={listItemStyle}>
              {idx + 1}. {goal}
            </div>
          ))}
        </div>
      </div>

      {/* Per-session outline */}
      <div style={fieldGroupStyle}>
        <div style={fieldLabelStyle}>{t("各回の内容")}</div>
        <div style={sessionGrid}>
          {data.sessionContents.slice(0, sessionCount).map((content, idx) => (
            <div key={`session-content-${idx}`} style={listItemStyle}>
              {idx + 1}. {content}
            </div>
          ))}
        </div>
      </div>

      {/* Teaching, AI, and assessment */}
      <div style={fieldGroupStyle}>
        <div style={fieldLabelStyle}>{t("講義の進め方・方針")}</div>
        <div style={fieldValueStyle}>{data.approach}</div>
      </div>

      <div style={fieldGroupStyle}>
        <div style={fieldLabelStyle}>{t("受講者の生成AIの使用について")}</div>
        <div style={fieldValueStyle}>{data.aiUsage}</div>
      </div>

      <div style={fieldGroupStyle}>
        <div style={fieldLabelStyle}>{t("成績評価方法")}</div>
        <div style={fieldValueStyle}>{data.gradingMethod}</div>
      </div>

      {data.references && (
        <div style={fieldGroupStyle}>
          <div style={fieldLabelStyle}>{t("参考文献など")}</div>
          <div style={fieldValueStyle}>{data.references}</div>
        </div>
      )}
    </PngTemplate>
  );
});

export default CoursePngTemplate;
