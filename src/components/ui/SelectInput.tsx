"use client";

import React from "react";
import { useLocale } from "@/lib/i18n";

interface SelectInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  optionLabels?: readonly string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function SelectInput({
  id,
  label,
  value,
  onChange,
  options,
  optionLabels,
  placeholder = "選択してください",
  required = false,
  disabled = false,
}: SelectInputProps) {
  const { t } = useLocale();
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
      <select
        id={id}
        className="form-input form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-required={required}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt, index) => (
          <option key={opt} value={opt}>
            {optionLabels?.[index] ?? t(opt)}
          </option>
        ))}
      </select>
    </div>
  );
}
