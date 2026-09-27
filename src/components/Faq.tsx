"use client";

import React, { useState } from "react";
import { useFaq, type FaqItem } from "@/lib/useFaq";
import { useLocale } from "@/lib/i18n";

export default function Faq() {
  const { t, getFaqTranslation } = useLocale();
  const { faqs, isLoading, error } = useFaq();
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (id: number) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <span className="spinner" />
        <p className="text-[var(--color-text-muted)] text-sm">{t("よくある質問を読み込み中...")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-8 bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded-lg text-[var(--color-error)] text-sm">
        {t("FAQの読み込みに失敗しました: ")}{error}
      </div>
    );
  }

  if (faqs.length === 0) {
    return null;
  }

  // Group by category
  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FaqItem[]>);

  return (
    <div className="mb-10 animate-fade-in">
      <div className="text-center sm:text-left mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-lavender)] to-[var(--color-accent-pink)] mb-2">
          {t("よくある質問 (FAQ)")}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t("申請する際に疑問が生じた場合は、まずこちらをご確認ください。")}
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedFaqs).map(([category, items]) => (
          <div key={category} className="card overflow-hidden">
            <h3 className="border-l-4 border-[var(--color-accent-lavender)] pl-3 text-[0.85rem] text-[var(--color-accent-lavender)] mb-2 mt-6 font-bold">
              {t(category)}
            </h3>
            <div className="divide-y divide-[var(--color-border)]">
              {items.map((faq) => {
                const isOpen = openItems.has(faq.id);
                const translatedFaq = getFaqTranslation(faq.id);
                return (
                  <div key={faq.id} className="group">
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full text-left px-4 py-4 flex items-start justify-between gap-4 hover:bg-[var(--color-bg-elevated)] transition-colors min-h-[44px]"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${faq.id}`}
                    >
                      <span className="font-medium text-[var(--color-text-primary)] text-sm leading-relaxed">
                        Q. {translatedFaq?.question ?? faq.question}
                      </span>
                      <span
                        className={`text-[var(--color-accent-lavender)] transition-transform duration-300 flex-shrink-0 mt-0.5 ${isOpen ? "rotate-180" : ""
                          }`}
                      >
                        ▼
                      </span>
                    </button>
                    <div
                      id={`faq-answer-${faq.id}`}
                      role="region"
                      aria-hidden={!isOpen}
                      className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-4 pb-4 pt-1 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                          <div className="flex gap-2">
                            <span className="font-bold text-[var(--color-accent-pink)]">A.</span>
                            <p>{translatedFaq?.answer ?? faq.answer}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
