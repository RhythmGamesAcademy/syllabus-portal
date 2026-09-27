"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Locale = "ja" | "en" | "zh";

export function getLocalizedCharacterLimit(baseLimit: number, locale: Locale): number {
  const multiplier = locale === "en" ? 1.5 : locale === "zh" ? 1.2 : 1;
  return Math.floor(baseLimit * multiplier);
}

const translations: Record<string, Partial<Record<Locale, string>>> = {
  "音楽ゲーム学園": { en: "Rhythm Games Academy", zh: "音游学院" },
  "申請書作成ポータル": { en: "Application Portal", zh: "申请门户" },
  "シラバス作成ポータル": { en: "Syllabus Portal", zh: "教学大纲制作门户" },
  "シラバス作成アプリ | 音楽ゲーム学園": {
    en: "Syllabus Builder | Rhythm Games Academy",
    zh: "教学大纲制作 | 音游学院",
  },
  "音楽ゲーム学園のシラバスをブラウザ上で作成・ダウンロードできるWEBアプリケーション。": {
    en: "Create and download Rhythm Games Academy syllabi in your browser.",
    zh: "在浏览器中制作并下载音游学院的教学大纲。",
  },
  "学園公式サイト ↗": { en: "Academy Website ↗", zh: "学院官网 ↗" },
  "無断転載を禁じます。": {
    en: "All rights reserved.",
    zh: "版权所有。",
  },
  "言語": { en: "Language", zh: "语言" },
  "シラバス作成": { en: "Create a Syllabus", zh: "制作教学大纲" },
  "必要事項を入力し、「シラバスPNGをダウンロード」ボタンを押すとA4風のシラバス画像を生成できます。": {
    en: 'Enter the details and select "Download Syllabus PNG" to create an A4-sized syllabus image.',
    zh: "填写必要信息并点击“下载教学大纲 PNG”，即可生成 A4 尺寸的教学大纲图片。",
  },
  "生成後は所定の手続きに従って運営へ提出してください。": {
    en: "After generating the image, submit it to the administration using the designated procedure.",
    zh: "生成图片后，请按照指定流程提交给管理方。",
  },
  "講義の基本情報": { en: "Syllabus Information", zh: "教学大纲基本信息" },
  "シラバス基本情報": { en: "Syllabus Information", zh: "教学大纲基本信息" },
  "科目名": { en: "Course Title", zh: "课程名称" },
  "担当講師": { en: "Assigned Lecturer", zh: "担当講師" },
  "対象学部": { en: "Department", zh: "所属学部" },
  "講義区分": { en: "Course Category", zh: "课程类别" },
  "開講条件": { en: "Course Details", zh: "开课条件" },
  "開講時期": { en: "Offering Period", zh: "开课时间" },
  "対象期は2026年8月1日以降に確定": {
    en: "The term will be determined from August 1, 2026.",
    zh: "开课学期将于 2026 年 8 月 1 日起确定。",
  },
  "対象期は2026年8月1日以降に表示されます。": {
    en: "The term will be shown from August 1, 2026.",
    zh: "开课学期将于 2026 年 8 月 1 日起显示。",
  },
  "PNGへの印字: ": { en: "Printed on PNG: ", zh: "PNG 上显示： " },
  "対象期: ": { en: "Term: ", zh: "学期： " },
  "期（開講時期を選択するとPNGへの印字を確認できます）": {
    en: " (select an offering period to preview the PNG)",
    zh: "（选择开课时间后可预览 PNG 内容）",
  },
  "選択結果: ": { en: "Selection: ", zh: "所选内容： " },
  "講義回数 (3〜15回)": { en: "Number of Sessions (3–15)", zh: "课程次数（3–15 次）" },
  "講義回数": { en: "Sessions", zh: "课程次数" },
  "講座回数 (3〜15回)": { en: "Number of Sessions (3–15)", zh: "课程次数（3–15 次）" },
  "講義回数は半角数字で 3〜15 回の範囲で入力してください": {
    en: "Enter 3–15 using half-width digits.",
    zh: "请使用半角数字输入 3–15 次。",
  },
  "講座回数は半角数字で 3〜15 回の範囲で入力してください": {
    en: "Enter 3–15 using half-width digits.",
    zh: "请使用半角数字输入 3–15 次。",
  },
  "単位": { en: "Credits", zh: "学分" },
  "自動算出": { en: "Calculated", zh: "自动计算" },
  "単位数": { en: "Credits", zh: "学分" },
  "講義内容": { en: "Syllabus Content", zh: "课程内容" },
  "講座内容": { en: "Syllabus Content", zh: "课程内容" },
  "講義概要": { en: "Course Overview", zh: "课程简介" },
  "講座概要": { en: "Course Overview", zh: "课程简介" },
  "受講者の到達目標": { en: "Learning Outcomes", zh: "学习目标" },
  "講義の進め方・方針": { en: "Teaching Method and Approach", zh: "授课方式与方针" },
  "使用言語（原語表記）": { en: "Language of Instruction (native name)", zh: "授课语言（原文名称）" },
  "各回の内容（各回30文字以内）": {
    en: "Session Topics (up to 30 characters each)",
    zh: "每次课程内容（每项最多 30 个字符）",
  },
  "各回で扱う内容": { en: "Topic for this session", zh: "本次课程内容" },
  "各回の内容": { en: "Session Topics", zh: "每次课程内容" },
  "受講者の生成AIの使用について": {
    en: "Student Use of Generative AI",
    zh: "关于学生使用生成式 AI",
  },
  "成績評価方法": { en: "Grading Method", zh: "成绩评定方式" },
  "参考文献など": { en: "References", zh: "参考资料" },
  "確認・同意": { en: "Confirmation and Agreement", zh: "确认与同意" },
  "必須": { en: "Required", zh: "必填" },
  "任意": { en: "Optional", zh: "选填" },
  "項目を追加": { en: "Add item", zh: "添加项目" },
  "番目を削除": { en: " item", zh: "项删除" },
  "選択してください": { en: "Please select", zh: "请选择" },
  "先に対象学部を選択してください": {
    en: "Select a department first",
    zh: "请先选择所属学部",
  },
  "PNGへの印字": { en: "PNG Preview", zh: "PNG 预览" },
  "PNG作成中...": { en: "Generating PNG...", zh: "正在生成 PNG..." },
  "シラバスPNGをダウンロード": { en: "Download Syllabus PNG", zh: "下载教学大纲 PNG" },
  "下書きを保存": { en: "Save Draft", zh: "保存草稿" },
  "下書きを削除": { en: "Delete Draft", zh: "删除草稿" },
  "保存済みの下書きを復元しました。確認・同意項目は再度確認してください。": {
    en: "Draft restored. Please review the confirmation and agreement items again.",
    zh: "已恢复已保存的草稿。请重新确认确认与同意项目。",
  },
  "保存済みの下書きを読み込めませんでした。データが破損しているか、現在のフォーム形式と異なる可能性があります。下書きは削除せず残しています。": {
    en: "Could not load the saved draft. It may be corrupted or use an incompatible form version. The draft was kept.",
    zh: "无法读取已保存的草稿。数据可能已损坏或与当前表单版本不兼容。草稿未被删除。",
  },
  "ブラウザの保存領域を利用できないため、下書きを読み込めませんでした。": {
    en: "Could not load the draft because browser storage is unavailable.",
    zh: "由于浏览器存储不可用，无法读取草稿。",
  },
  "入力内容が下書きの保存可能な形式を超えています。入力内容を確認してください。既存の下書きは削除していません。": {
    en: "The entered data cannot be saved as a draft. Please review it. The existing draft was kept.",
    zh: "输入内容超出草稿可保存的格式。请检查内容。原有草稿未被删除。",
  },
  "下書きを保存しました。このブラウザに保存されています。": {
    en: "Draft saved in this browser.",
    zh: "草稿已保存在此浏览器中。",
  },
  "下書きを保存できませんでした。ブラウザの設定や保存容量をご確認ください。既存の下書きは削除していません。": {
    en: "Could not save the draft. Check browser settings and available storage. The existing draft was kept.",
    zh: "无法保存草稿。请检查浏览器设置和可用存储空间。原有草稿未被删除。",
  },
  "保存済みの下書きを削除しました。入力中の内容は保持されています。": {
    en: "Saved draft deleted. Your current entries were kept.",
    zh: "已删除保存的草稿。当前输入内容已保留。",
  },
  "下書きを削除できませんでした。ブラウザの設定をご確認ください。": {
    en: "Could not delete the draft. Please check browser settings.",
    zh: "无法删除草稿。请检查浏览器设置。",
  },
  "PNGの生成に失敗しました。もう一度お試しください。": {
    en: "Could not generate the PNG. Please try again.",
    zh: "PNG 生成失败，请重试。",
  },
  "申請内容に虚偽はありません": {
    en: "I confirm that the information provided is accurate.",
    zh: "我确认所填写的信息真实无误。",
  },
  "に同意します": { en: " and agree.", zh: "并同意。" },
  "に同意し、遵守することを誓います": {
    en: " and pledge to comply.",
    zh: "并承诺遵守。",
  },
  "プライバシーポリシー": { en: "Privacy Policy", zh: "隐私政策" },
  "講師規約": { en: "Lecturer Terms", zh: "講師条款" },
  "よくある質問 (FAQ)": { en: "Frequently Asked Questions (FAQ)", zh: "常见问题（FAQ）" },
  "申請する際に疑問が生じた場合は、まずこちらをご確認ください。": {
    en: "Please check here if you have questions about creating a syllabus.",
    zh: "如果您在制作教学大纲时有疑问，请先查看此处。",
  },
  "よくある質問を読み込み中...": { en: "Loading FAQs...", zh: "正在加载常见问题..." },
  "FAQの読み込みに失敗しました: ": { en: "Could not load FAQs: ", zh: "无法加载常见问题：" },
  "PNG作成日": { en: "PNG Created", zh: "PNG 创建日期" },
  "シラバス": { en: "Syllabus", zh: "教学大纲" },
  "日本語": { en: "Japanese", zh: "日语" },
  "English": { en: "English", zh: "英语" },
  "例: 音ゲーマーのための画像処理入門": {
    en: "e.g. Introduction to Image Processing for Rhythm Gamers",
    zh: "例：音游玩家的图像处理入门",
  },
  "例: tzug": { en: "e.g. tzug", zh: "例：tzug" },
  "3～15": { en: "3–15", zh: "3–15" },
  "例: PythonでOpenCVを用いた画像処理について学ぶ．行列の基本計算から線形変換までを一通り取り扱った後，OpenCVを用いた画像処理について実践形式で学んでいく（PC必須）．": {
    en: "e.g. Learn image processing with Python and OpenCV, from matrix operations and linear transformations to hands-on image processing (a PC is required).",
    zh: "例：学习使用 Python 和 OpenCV 进行图像处理，涵盖矩阵运算、线性变换及实践练习（需要电脑）。",
  },
  "例: 譜面研究において画像処理を活かすことが出来る": {
    en: "e.g. Apply image processing to chart analysis",
    zh: "例：能够将图像处理应用于谱面研究",
  },
  "例: 講義資料を掲載して各自で学習する方法や、ボイスチャット・Zoomで受講者と対話しながら進める方法があります。": {
    en: "For example, students can study posted materials independently, or participate in interactive sessions via voice chat or Zoom.",
    zh: "例如，可以发布讲义资料供学生自主学习，也可以通过语音聊天或 Zoom 与学生互动授课。",
  },
  "生成AIを使用する場合のルールや、受講者の使用範囲を記入してください。": {
    en: "Describe the rules and permitted uses of generative AI by students.",
    zh: "请填写生成式 AI 的使用规则及学生可使用的范围。",
  },
  "例: 各回の課題を合計し、理解度と取り組みを評価します。": {
    en: "e.g. Assess understanding and participation based on assignments across all sessions.",
    zh: "例：综合各次课程作业，评估理解程度与参与情况。",
  },
  "例: 参考サイトURL、書籍名など": {
    en: "e.g. Reference URLs or book titles",
    zh: "例：参考网站 URL、书名等",
  },
  "(3〜5回:1 / 6〜10回:2 / 11〜15回:3)": {
    en: "(3–5 sessions: 1 / 6–10: 2 / 11–15: 3)",
    zh: "（3–5 次：1 / 6–10 次：2 / 11–15 次：3）",
  },
  "シラバス作成の流れについて": { en: "Syllabus Submission", zh: "教学大纲提交流程" },
  "申請の流れについて": { en: "Submission Process", zh: "申请流程" },
  "担当学部について": { en: "Departments", zh: "所属学部" },
  "講義区分について": { en: "Course Categories", zh: "课程类别" },
  "実績について": { en: "Qualifications and Experience", zh: "资历与经历" },
  "講師活動について": { en: "Teaching at the Academy", zh: "讲师活动" },
  "プライバシーについて": { en: "Privacy", zh: "隐私" },
  "講義の開講時期について": { en: "Course Periods", zh: "开课时间" },
  "講義資料について": { en: "Course Materials", zh: "课程资料" },
  "閉じる": { en: "Close", zh: "关闭" },
  "読み込み中...": { en: "Loading...", zh: "正在加载..." },
  "読み込みエラー: ": { en: "Loading error: ", zh: "加载错误：" },
  "同意する": { en: "Agree", zh: "同意" },
  "回": { en: " sessions", zh: " 次" },
  "上限に達しました": { en: "Character limit reached", zh: "已达到字符上限" },
  "文字超過しています": { en: " characters over the limit", zh: " 个字符超出限制" },
  "文字": { en: " characters", zh: " 个字符" },
  "講義開講申請書": { en: "Syllabus", zh: "教学大纲" },
};

const faqTranslations: Record<Locale, Array<[string, string]>> = {
  ja: [],
  en: [
    ["What should I do after downloading the syllabus PNG?", "Open the designated Google Form, attach the image. It is also possible to post the syllabus you have prepared, during the initial guidance session or similar."],
    ["Can I teach in departments other than the one I selected?", "Yes. The selected department indicates your primary area; you may also teach in other departments."],
    ["Where should I apply for PC or console rhythm-game courses?", "Select the Standalone category."],
    ["Where should interdisciplinary courses be categorized?", "Select Liberal Arts and Sciences in Rhythm Game Fundamentals."],
    ["Is information entered in the form stored on a server?", "No. It is converted to a PNG in your browser. Drafts are stored only in this browser, excluding agreement checkboxes."],
    ["What is the difference between a current-term and continuing course?", "A current-term course ends after its designated term and requires a new submission to run again. A continuing course lets students continue using materials from the designated term; it does not mean classes run every term or remain available forever."],
    ["When does the academic term change?", "Terms change on February 1 and August 1, based on Japan time when the PNG is created. The PNG date is not the submission date."],
    ["How can I update published course materials?", "Do not replace published materials with a revised version. Submit a new course if the content becomes outdated; previous materials may be reused where appropriate."],
  ],
  zh: [
    ["下载教学大纲 PNG 后应该怎么做？", "请打开指定的 Google 表单，附上图片并填写其他项目。（表单信息待更新。）"],
    ["我可以在所选学部以外授课吗？", "可以。所选学部表示主要活动领域，也可以在其他学部开课。"],
    ["PC 或家用机音游课程应选择哪一类？", "请选择单机类。"],
    ["跨学部的综合课程应归入哪一类？", "请选择音游基础学部的文理类。"],
    ["表单中填写的信息会保存在服务器上吗？", "不会。信息仅在浏览器中生成 PNG；草稿仅保存在当前浏览器中，不包括同意勾选项。"],
    ["当期课程与长期课程有什么区别？", "当期课程在指定学期结束；再次开课需重新提交。长期课程允许学生继续使用指定学期的资料，但不代表每学期都授课或永久开放。"],
    ["学期何时切换？", "学期于 2 月 1 日和 8 月 1 日切换，以生成 PNG 时的日本时间为准。PNG 日期并非提交日期。"],
    ["如何更新已发布的课程资料？", "请勿直接替换已发布资料的版本。资料过时时请作为新课程重新提交；适当情况下可重用旧资料。"],
  ],
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
    if (savedLocale === "ja" || savedLocale === "en" || savedLocale === "zh") {
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

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : locale;
    document.title = translate("シラバス作成アプリ | 音楽ゲーム学園", locale);
    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );
    if (description) {
      description.content = translate(
        "音楽ゲーム学園のシラバスをブラウザ上で作成・ダウンロードできるWEBアプリケーション。",
        locale
      );
    }
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: changeLocale,
      t: (text) => translate(text, locale),
      getFaqTranslation: (id) => {
        const entry = faqTranslations[locale][id - 1];
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
  if (language === "中文") return "zh";
  return "ja";
}
