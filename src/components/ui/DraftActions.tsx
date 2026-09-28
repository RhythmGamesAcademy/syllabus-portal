"use client";

import { useLocale } from "@/lib/i18n";

export type DraftNotice = {
  kind: "success" | "info" | "error";
  message: string;
};

interface DraftActionsProps {
  notice: DraftNotice | null;
  onSave: () => void;
  onDelete: () => void;
}

export default function DraftActions({
  notice,
  onSave,
  onDelete,
}: DraftActionsProps) {
  const { t } = useLocale();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-secondary-red" onClick={onDelete}>
          {t("下書きを削除")}
        </button>
        <button type="button" className="btn-secondary" onClick={onSave}>
          {t("下書きを保存")}
        </button>
      </div>
      {notice && (
        <p
          className={`text-sm ${
            notice.kind === "error"
              ? "text-[var(--color-error)]"
              : notice.kind === "success"
                ? "text-[var(--color-accent-cyan)]"
                : "text-[var(--color-text-muted)]"
          }`}
          role={notice.kind === "error" ? "alert" : "status"}
          aria-live={notice.kind === "error" ? "assertive" : "polite"}
        >
          {t(notice.message)}
        </p>
      )}
    </div>
  );
}
