"use client";

import { useLocale, type Locale } from "@/lib/i18n";
import CourseForm from "@/components/CourseForm";
import Faq from "@/components/Faq";

export default function Home() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/rga-logo_w.svg"
              alt="音楽ゲーム学園"
              className="h-10 w-auto shrink-0"
            />
            <div>
              <h1 className="text-base font-bold tracking-wide text-[var(--color-text-primary)]">
                {t("音楽ゲーム学園")}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">{t("シラバス作成ポータル")}</p>
            </div>
          </div>
          <label className="sr-only" htmlFor="locale-select">
            {t("言語")}
          </label>
          <select
            id="locale-select"
            value={locale}
            onChange={(event) => setLocale(event.target.value as Locale)}
            className="form-input form-select !w-auto !py-2 !text-xs"
            aria-label={t("言語")}
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 md:py-10">
        {/* Intro */}
        <div className="mb-6 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            {t("シラバス作成")}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('必要事項を入力し、「シラバスPNGをダウンロード」ボタンを押すとA4風のシラバス画像を生成できます。')}<br />
            {t("生成後は所定の手続きに従って運営へ提出してください。")}
          </p>
        </div>

        {/* Syllabus Form */}
        <div className="card shadow-2xl">
          <div className="card-body">
            <CourseForm />
          </div>
        </div>

        <div className="mt-8">
          <Faq />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-6 text-center text-xs text-[var(--color-text-muted)]">
        <p>&copy; {new Date().getFullYear()} 音楽ゲーム学園 All rights reserved.</p>
      </footer>
    </div>
  );
}
