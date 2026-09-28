"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Locale = "ja" | "en";

export function getLocalizedCharacterLimit(baseLimit: number, locale: Locale): number {
  const multiplier = locale === "en" ? 1.5 : 1;
  return Math.floor(baseLimit * multiplier);
}

const translations: Record<string, Partial<Record<Locale, string>>> = {
  "音楽ゲーム学園": { en: "Rhythm Games Academy" },
  "申請書作成ポータル": { en: "Application Portal" },
  "シラバス作成ポータル": { en: "Syllabus Portal" },
  "シラバス作成アプリ | 音楽ゲーム学園": {
    en: "Syllabus Builder | Rhythm Games Academy",
  },
  "音楽ゲーム学園のシラバスをブラウザ上で作成・ダウンロードできるWEBアプリケーション。": {
    en: "Create and download Rhythm Games Academy syllabi in your browser.",
  },
  "学園公式サイト ↗": { en: "Academy Website ↗" },
  "無断転載を禁じます。": {
    en: "All rights reserved.",
  },
  "言語": { en: "Language" },
  "シラバス作成": { en: "Create a Syllabus" },
  "必要事項を入力し、「シラバスPNGをダウンロード」ボタンを押すとA4風のシラバス画像を生成できます。": {
    en: 'Enter the details and select "Download Syllabus PNG" to create an A4-sized syllabus image.',
  },
  "生成後は所定の手続きに従って運営へ提出してください。": {
    en: "After generating the image, submit it to the administration using the designated procedure.",
  },
  "講義の基本情報": { en: "Syllabus Information" },
  "シラバス基本情報": { en: "Syllabus Information" },
  "科目名": { en: "Course Title" },
  "担当講師": { en: "Assigned Lecturer" },
  "対象学部": { en: "Department" },
  "講義区分": { en: "Course Category" },
  "開講条件": { en: "Course Details" },
  "開講時期": { en: "Offering Period" },
  "対象期は2026年8月1日以降に確定": {
    en: "The term will be determined from August 1, 2026.",
  },
  "対象期は2026年8月1日以降に表示されます。": {
    en: "The term will be shown from August 1, 2026.",
  },
  "PNGへの印字: ": { en: "Printed on PNG: " },
  "対象期: ": { en: "Term: " },
  "期（開講時期を選択するとPNGへの印字を確認できます）": {
    en: " (select an offering period to preview the PNG)",
  },
  "選択結果: ": { en: "Selection: " },
  "講義回数 (3〜15回)": { en: "Number of Sessions (3–15)" },
  "講義回数": { en: "Sessions" },
  "講座回数 (3〜15回)": { en: "Number of Sessions (3–15)" },
  "講義回数は半角数字で 3〜15 回の範囲で入力してください": {
    en: "Enter 3–15 using half-width digits.",
  },
  "講座回数は半角数字で 3〜15 回の範囲で入力してください": {
    en: "Enter 3–15 using half-width digits.",
  },
  "単位": { en: "Credits" },
  "自動算出": { en: "Calculated" },
  "単位数": { en: "Credits" },
  "講義内容": { en: "Syllabus Content" },
  "講座内容": { en: "Syllabus Content" },
  "講義概要": { en: "Course Overview" },
  "講座概要": { en: "Course Overview" },
  "受講者の到達目標": { en: "Learning Outcomes" },
  "講義の進め方・方針": { en: "Teaching Method and Approach" },
  "使用言語（原語表記）": { en: "Language of Instruction (native name)" },
  "各回の内容（各回30文字以内）": {
    en: "Session Topics (up to 30 characters each)",
  },
  "各回で扱う内容": { en: "Topic for this session" },
  "各回の内容": { en: "Session Topics" },
  "受講者の生成AIの使用について": {
    en: "Student Use of Generative AI",
  },
  "成績評価方法": { en: "Grading Method" },
  "参考文献など": { en: "References" },
  "確認・同意": { en: "Confirmation and Agreement" },
  "必須": { en: "Required" },
  "任意": { en: "Optional" },
  "項目を追加": { en: "Add item" },
  "番目を削除": { en: " item" },
  "選択してください": { en: "Please select" },
  "先に対象学部を選択してください": {
    en: "Select a department first",
  },
  "PNGへの印字": { en: "PNG Preview" },
  "PNG作成中...": { en: "Generating PNG..." },
  "シラバスPNGをダウンロード": { en: "Download Syllabus PNG" },
  "下書きを保存": { en: "Save Draft" },
  "下書きを削除": { en: "Delete Draft" },
  "保存済みの下書きを復元しました。確認・同意項目は再度確認してください。": {
    en: "Draft restored. Please review the confirmation and agreement items again.",
  },
  "保存済みの下書きを読み込めませんでした。データが破損しているか、現在のフォーム形式と異なる可能性があります。下書きは削除せず残しています。": {
    en: "Could not load the saved draft. It may be corrupted or use an incompatible form version. The draft was kept.",
  },
  "ブラウザの保存領域を利用できないため、下書きを読み込めませんでした。": {
    en: "Could not load the draft because browser storage is unavailable.",
  },
  "入力内容が下書きの保存可能な形式を超えています。入力内容を確認してください。既存の下書きは削除していません。": {
    en: "The entered data cannot be saved as a draft. Please review it. The existing draft was kept.",
  },
  "下書きを保存しました。このブラウザに保存されています。": {
    en: "Draft saved in this browser.",
  },
  "下書きを保存できませんでした。ブラウザの設定や保存容量をご確認ください。既存の下書きは削除していません。": {
    en: "Could not save the draft. Check browser settings and available storage. The existing draft was kept.",
  },
  "保存済みの下書きを削除しました。入力中の内容は保持されています。": {
    en: "Saved draft deleted. Your current entries were kept.",
  },
  "下書きを削除できませんでした。ブラウザの設定をご確認ください。": {
    en: "Could not delete the draft. Please check browser settings.",
  },
  "PNGの生成に失敗しました。もう一度お試しください。": {
    en: "Could not generate the PNG. Please try again.",
  },
  "申請内容に虚偽はありません": {
    en: "I confirm that the information provided is accurate.",
  },
  "に同意します": { en: " and agree." },
  "を確認し、学園規則第6章第2条の同意事項を承諾します": {
    en: " and acknowledge the matters agreed to in Chapter 6, Article 2 of the School Rules.",
  },
  "プライバシーポリシー": { en: "Privacy Policy" },
  "講師向け運用案内（改訂案）": {
    en: "Operational Guidelines for Lecturer (Revised Draft)"
  },
  "よくある質問 (FAQ)": { en: "Frequently Asked Questions (FAQ)" },
  "申請する際に疑問が生じた場合は、まずこちらをご確認ください。": {
    en: "Please check here if you have questions about creating a syllabus.",
  },
  "よくある質問を読み込み中...": { en: "Loading FAQs..." },
  "FAQの読み込みに失敗しました: ": { en: "Could not load FAQs: " },
  "PNG作成日": { en: "PNG Created" },
  "シラバス": { en: "Syllabus" },
  "日本語": { en: "Japanese" },
  "English": { en: "English" },
  "例: 音ゲーマーのための画像処理入門": {
    en: "e.g. Introduction to Image Processing for Rhythm Gamers",
  },
  "例: tzug": { en: "e.g. tzug" },
  "3～15": { en: "3–15" },
  "例: PythonでOpenCVを用いた画像処理について学ぶ．行列の基本計算から線形変換までを一通り取り扱った後，OpenCVを用いた画像処理について実践形式で学んでいく（PC必須）．": {
    en: "e.g. Learn image processing with Python and OpenCV, from matrix operations and linear transformations to hands-on image processing (a PC is required).",
  },
  "例: 譜面研究において画像処理を活かすことが出来る": {
    en: "e.g. Apply image processing to chart analysis",
  },
  "例: 講義資料を掲載して各自で学習する方法や、ボイスチャット・Zoomで受講者と対話しながら進める方法があります。": {
    en: "For example, students can study posted materials independently, or participate in interactive sessions via voice chat or Zoom.",
  },
  "生成AIを使用する場合のルールや、受講者の使用範囲を記入してください。": {
    en: "Describe the rules and permitted uses of generative AI by students.",
  },
  "例: 各回の課題を合計し、理解度と取り組みを評価します。": {
    en: "e.g. Assess understanding and participation based on assignments across all sessions.",
  },
  "例: 参考サイトURL、書籍名など": {
    en: "e.g. Reference URLs or book titles",
  },
  "(3〜5回:1 / 6〜10回:2 / 11〜15回:3)": {
    en: "(3–5 sessions: 1 / 6–10: 2 / 11–15: 3)",
  },
  "シラバス作成の流れについて": { en: "Syllabus Submission" },
  "申請の流れについて": { en: "Submission Process" },
  "担当学部について": { en: "Departments" },
  "講義区分について": { en: "Course Categories" },
  "実績について": { en: "Qualifications and Experience" },
  "講師活動について": { en: "Teaching at the Academy" },
  "プライバシーについて": { en: "Privacy" },
  "講義の開講時期について": { en: "Course Periods" },
  "講義資料について": { en: "Course Materials" },
  "閉じる": { en: "Close" },
  "読み込み中...": { en: "Loading..." },
  "読み込みエラー: ": { en: "Loading error: " },
  "同意する": { en: "Agree" },
  "回": { en: " sessions" },
  "上限に達しました": { en: "Character limit reached" },
  "文字超過しています": { en: " characters over the limit" },
  "文字": { en: " characters" },
  "講義開講申請書": { en: "Syllabus" },
};

const faqTranslations: Record<Locale, Record<number, [string, string]>> = {
  ja: {},
  en: {
    1: [
      "What should I do after downloading the syllabus PNG?",
      "After accessing the course registration Google Form, there is a section to attach this image. You may also post the syllabus you have created during the initial lecture guidance session or similar.",
    ],
    4: [
      "Can I teach in departments other than the one I selected?",
      "Yes. The selected department indicates your primary area; you may also teach in other departments.",
    ],
    5: [
      "Where should I apply for PC or console rhythm-game courses?",
      "Select the 'スタンドアロン系'.",
    ],
    6: [
      "Where should interdisciplinary courses be categorized?",
      "Select '文理型' in '音ゲー基礎学部'.",
    ],
    9: [
      "Is information entered in the form stored on a server?",
      "No. It is converted to a PNG in your browser. Drafts are stored only in this browser, excluding agreement checkboxes.",
    ],
    10: [
      "What is the difference between a current-term and continuing course?",
      "A current-term course ends after its designated term and requires a new submission to run again. A continuing course lets students continue using materials from the designated term; it does not mean classes run every term or remain available forever.",
    ],
    11: [
      "When does the academic term change?",
      "Terms change on February 1 and August 1, based on Japan time when the PNG is created. The PNG date is not the submission date.",
    ],
    12: [
      "How can I update published course materials?",
      "Do not replace published materials with a revised version. Submit a new course if the content becomes outdated; previous materials may be reused where appropriate.",
    ],
  },
};

export type FaqTranslation = { question: string; answer: string };

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (text: string) => string;
  getFaqTranslation: (id: number) => FaqTranslation | null;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = "syllabus-portal:locale";
const localeListeners = new Set<() => void>();
let currentLocale: Locale = "ja";

function getLocaleSnapshot(): Locale {
  if (typeof window === "undefined") return currentLocale;
  try {
    const savedLocale = window.localStorage.getItem(STORAGE_KEY);
    if (savedLocale === "ja" || savedLocale === "en") {
      currentLocale = savedLocale;
    }
  } catch {
    // Keep the current language when browser storage is unavailable.
  }
  return currentLocale;
}

function getServerLocaleSnapshot(): Locale {
  return "ja";
}

function subscribeToLocale(listener: () => void): () => void {
  localeListeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      currentLocale = getLocaleSnapshot();
      listener();
    }
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    localeListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function changeLocale(locale: Locale): void {
  currentLocale = locale;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Language switching still works when storage is unavailable.
  }
  localeListeners.forEach((listener) => listener());
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: changeLocale,
      t: (text) => translate(text, locale),
      getFaqTranslation: (id) => {
        const entry = faqTranslations[locale]?.[id];
        return entry ? { question: entry[0], answer: entry[1] } : null;
      },
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

export function translate(text: string, locale: Locale): string {
  return locale === "ja" ? text : translations[text]?.[locale] ?? text;
}

export function getLocaleForLanguage(language: string): Locale {
  if (language === "English") return "en";
  return "ja";
}

export function getLocalizedMarkdownPath(basePath: string, locale: Locale): string {
  if (locale === "ja") return basePath;
  const ext = ".md";
  if (basePath.endsWith(ext)) {
    return `${basePath.slice(0, -ext.length)}.${locale}${ext}`;
  }
  return basePath;
}
