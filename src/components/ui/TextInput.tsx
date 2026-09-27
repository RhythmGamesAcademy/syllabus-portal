"use client";

import React from "react";
import { useLocale } from "@/lib/i18n";

interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  type?: "text" | "number";
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email" | "url";
  pattern?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export default function TextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  type = "text",
  inputMode,
  pattern,
  min,
  max,
  disabled = false,
}: TextInputProps) {
  const { t } = useLocale();
  const charCount = value.length;
  // 上限ちょうど (30/30) は有効。超過 (31/30) からエラー表示。
  // 推敲しながら書けるよう入力の切り捨て (DOM の maxLength) は行わず、
  // 超過は赤ハイライトとバリデーションで知らせる。
  const isOverLimit = maxLength ? charCount > maxLength : false;
  const isAtLimit = maxLength ? charCount === maxLength : false;

  return (
    <div className="animate-fade-in">
      <label htmlFor={id} className="form-label">
        {label}
        {required ? (
          <span className="badge-required">{t("必須")}</span>
        ) : (
          <span className="badge-optional">{t("任意")}</span>
        )}
      </label>
      <input
        id={id}
        type={type}
        className={`form-input ${isOverLimit ? "has-error" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-required={required}
        aria-invalid={isOverLimit}
        aria-describedby={maxLength ? `${id}-counter ${id}-error` : undefined}
        inputMode={inputMode}
        pattern={pattern}
        min={min}
        max={max}
        autoComplete="off"
      />
      {maxLength && (
        <div className="flex justify-between items-center mt-1">
          <div
            id={`${id}-error`}
            className={`text-xs ${isOverLimit ? "text-[var(--color-error)]" : "text-[var(--color-text-muted)]"}`}
            aria-live="polite"
          >
            {isOverLimit
              ? `${charCount - maxLength}${t("文字超過しています")}`
              : isAtLimit && t("上限に達しました")}
          </div>
          <div id={`${id}-counter`} className={`char-counter !mt-0 ${isOverLimit ? "over-limit" : ""}`}>
            {charCount} / {maxLength}
          </div>
        </div>
      )}
    </div>
  );
}
