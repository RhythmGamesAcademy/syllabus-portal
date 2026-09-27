"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useMarkdown } from "@/lib/useMarkdown";
import { useLocale } from "@/lib/i18n";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Rendered only while the modal is open -- the parent controls visibility by
 * mounting/unmounting, so all internal state starts fresh on every open.
 */
type PolicyModalProps = {
  onClose: () => void;
  onAgree: () => void;
  markdownPath: string;
  title: string;
};

export default function PolicyModal({
  onClose,
  onAgree,
  markdownPath,
  title,
}: PolicyModalProps) {
  const { t } = useLocale();
  const { content, isLoading, error } = useMarkdown(markdownPath);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // If content is very short and doesn't require scrolling, enable the button
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (scrollRef.current) {
        const { scrollHeight, clientHeight } = scrollRef.current;
        if (scrollHeight <= clientHeight) {
          setHasReachedBottom(true);
        }
      }
    }, 100); // Wait a bit for render

    return () => window.clearTimeout(timer);
  }, [content]);

  // Prevent the page behind the modal from scrolling (notably on mobile)
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Move focus into the modal on open, and hand it back on close
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;

    const focusableElements = modalRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
    if (focusableElements && focusableElements.length > 0) {
      // Focus the first element (close button in header)
      (focusableElements[0] as HTMLElement).focus();
    }

    return () => {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, []);

  // Esc to close, Tab to cycle within the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const elements = modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
        if (elements.length === 0) return;
        const firstElement = elements[0] as HTMLElement;
        const lastElement = elements[elements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === modalRef.current) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 8) {
      setHasReachedBottom(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-modal-title"
        className="bg-[var(--color-bg-modal)] border border-[var(--color-border-modal)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden text-[var(--color-text-primary)]"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="p-4 border-b border-[var(--color-border-modal-divider)] flex justify-between items-center bg-[var(--color-bg-modal-header)]">
          <h2 id="policy-modal-title" className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-pink)] to-[var(--color-accent-lavender)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label={t("閉じる")}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-xl font-semibold px-2"
          >
            ✕
          </button>
        </div>
        
        <div 
          className="p-6 overflow-y-auto flex-1 prose prose-invert prose-pink max-w-none text-sm md:text-base leading-relaxed"
          onScroll={handleScroll}
          ref={scrollRef}
          tabIndex={0}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <span className="spinner w-8 h-8 border-4" />
              <p className="text-[var(--color-accent-lavender)]">{t("読み込み中...")}</p>
            </div>
          ) : error ? (
            <div className="text-[var(--color-error)] p-4 bg-[var(--color-error-bg)] rounded-lg">
              {t("読み込みエラー: ")}{error}
            </div>
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
        </div>
        
        <div className="p-4 border-t border-[var(--color-border-modal-divider)] bg-[var(--color-bg-modal-header)] flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] transition-colors"
          >
            {t("閉じる")}
          </button>
          <button
            onClick={onAgree}
            disabled={!hasReachedBottom}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              hasReachedBottom 
                ? 'bg-gradient-to-r from-[var(--color-accent-pink)] to-[var(--color-accent-purple)] text-white shadow-lg shadow-[var(--color-accent-purple)]/20 hover:opacity-90' 
                : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] cursor-not-allowed'
            }`}
          >
            {t("同意する")}
          </button>
        </div>
      </div>
    </div>
  );
}
