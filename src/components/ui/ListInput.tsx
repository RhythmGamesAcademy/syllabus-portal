"use client";

import React from "react";
import { useLocale } from "@/lib/i18n";

interface ListInputProps {
  id: string;
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  required?: boolean;
  /** 1項目あたりの最大文字数 */
  maxLength?: number;
  /** 追加できる項目数の上限。項目ごとに異なるため呼び出し側で指定する。 */
  maxItems: number;
  /** 固定数の行を表示し、項目の追加・削除を無効にする。 */
  fixedCount?: number;
}

export default function ListInput({
  id,
  label,
  items,
  onChange,
  placeholder,
  required = false,
  maxLength,
  maxItems,
  fixedCount,
}: ListInputProps) {
  const { locale, t } = useLocale();
  const canAdd = fixedCount === undefined && items.length < maxItems;
  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);

  const handleItemChange = (index: number, value: string) => {
    const updated =
      fixedCount === undefined
        ? [...items]
        : Array.from({ length: fixedCount }, (_, itemIndex) => items[itemIndex] ?? "");
    updated[index] = value;
    onChange(updated);
  };

  const handleAdd = () => {
    if (canAdd) {
      onChange([...items, ""]);
    }
  };

  const handleRemove = (index: number) => {
    if (items.length > 1) {
      const updated = items.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  return (
    <fieldset className="list-fieldset animate-fade-in">
      <legend className="form-legend">
        {label}
        {required ? (
          <span className="badge-required">{t("必須")}</span>
        ) : (
          <span className="badge-optional">{t("任意")}</span>
        )}
      </legend>

      <div className="list-items">
        {Array.from(
          { length: fixedCount ?? items.length },
          (_, index) => items[index] ?? ""
        ).map((item, index) => {
          const charCount = item.length;
          // 上限ちょうど (30/30) は有効。超過 (31/30) からエラー表示。
          // 推敲しながら書けるよう入力の切り捨て (DOM の maxLength) は行わず、
          // 超過は赤ハイライトとバリデーションで知らせる。
          const isOverLimit = maxLength ? charCount > maxLength : false;
          const isAtLimit = maxLength ? charCount === maxLength : false;

          return (
            <div key={`${id}-item-${index}`} className="animate-slide-down">
              <div className="list-row">
                <span className="list-index">{index + 1}</span>
                <input
                  id={`${id}-${index}`}
                  type="text"
                  className={`form-input ${isOverLimit ? "has-error" : ""}`}
                  value={item}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  placeholder={placeholder}
                  aria-invalid={isOverLimit}
                  aria-describedby={maxLength ? `${id}-${index}-counter ${id}-${index}-error` : undefined}
                  autoComplete="off"
                />
                {fixedCount === undefined && items.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemove(index)}
                    aria-label={
                      locale === "ja"
                        ? `${index + 1}番目を削除`
                        : locale === "en"
                          ? `Remove item ${index + 1}`
                          : `删除第${index + 1}项`
                    }
                  >
                    x
                  </button>
                )}
              </div>
              {maxLength && (focusedIndex === index || isOverLimit) && (
                <div
                  className={`flex justify-between items-center mt-1 pl-8 ${
                    fixedCount === undefined ? "pr-12" : "pr-0"
                  }`}
                >
                  <div
                    id={`${id}-${index}-error`}
                    className={`text-xs ${isOverLimit ? "text-[var(--color-error)]" : "text-[var(--color-text-muted)]"}`}
                    aria-live="polite"
                  >
                    {isOverLimit
                      ? `${charCount - maxLength}${t("文字超過しています")}`
                      : isAtLimit && t("上限に達しました")}
                  </div>
                  <div id={`${id}-${index}-counter`} className={`char-counter !mt-0 ${isOverLimit ? "over-limit" : ""}`}>
                    {charCount} / {maxLength}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {fixedCount === undefined && (
        <button
          type="button"
          className="btn-secondary list-add"
          onClick={handleAdd}
          disabled={!canAdd}
        >
          + {t("項目を追加")}
          <span className="list-add-count">
            ({items.length}/{maxItems})
          </span>
        </button>
      )}
    </fieldset>
  );
}
