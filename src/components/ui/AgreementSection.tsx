"use client";

import React from "react";
import Checkbox from "./Checkbox";
import PolicyModal from "./PolicyModal";
import type { AgreementField } from "@/lib/types";
import { useLocale } from "@/lib/i18n";

type PolicyItem = {
  modalId: string;
  checkboxId: string;
  checked: boolean;
  markdownPath: string;
  title: string;
  label: React.ReactNode;
  field: AgreementField;
};

type AgreementSectionProps = {
  confirmNoFalsehood: boolean;
  onFalsehoodChange: (val: boolean) => void;
  falsehoodCheckboxId: string;
  policies: PolicyItem[];
  activeModalId: string | null;
  onModalClose: () => void;
  onModalAgree: (field: AgreementField) => void;
  onCheckboxChange: (field: AgreementField, val: boolean, modalId: string) => void;
  onOpenModal: (modalId: string) => void;
};

export default function AgreementSection({
  confirmNoFalsehood,
  onFalsehoodChange,
  falsehoodCheckboxId,
  policies,
  activeModalId,
  onModalClose,
  onModalAgree,
  onCheckboxChange,
  onOpenModal,
}: AgreementSectionProps) {
  const { t } = useLocale();
  return (
    <>
      <div className="space-y-2">
        <Checkbox
          id={falsehoodCheckboxId}
          checked={confirmNoFalsehood}
          onChange={onFalsehoodChange}
        >
          {t("申請内容に虚偽はありません")}
        </Checkbox>

        {policies.map((policy) => (
          <Checkbox
            key={policy.modalId}
            id={policy.checkboxId}
            checked={policy.checked}
            onChange={(val) =>
              onCheckboxChange(policy.field, val, policy.modalId)
            }
          >
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onOpenModal(policy.modalId);
              }}
              className="text-[var(--color-accent-pink)] hover:text-[var(--color-accent-lavender)] underline"
            >
              {policy.title}
            </a>
            {policy.label}
          </Checkbox>
        ))}
      </div>

      {/* Mount only the active modal, so its scroll/agreement state
          is rebuilt from scratch every time it is opened. */}
      {policies
        .filter((policy) => policy.modalId === activeModalId)
        .map((policy) => (
          <PolicyModal
            key={policy.modalId}
            onClose={onModalClose}
            onAgree={() => onModalAgree(policy.field)}
            markdownPath={policy.markdownPath}
            title={policy.title}
          />
        ))}
    </>
  );
}
