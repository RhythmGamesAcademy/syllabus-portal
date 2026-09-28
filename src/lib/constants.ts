// -- Character limits --

export const CHAR_LIMITS = {
  // 講師登録申請
  name: 15,
  subjectName: 30,
  field: 30,
  fieldReason: 100,
  achievement: 30,
  selfAppeal: 150,
  overview: 150,
  goal: 30,
  approach: 100,
  sessionContent: 30,
  aiUsage: 50,
  gradingMethod: 100,
  reference: 100,
} as const;

// -- List limits --
// 項目ごとに上限が異なるため、ListInput へ maxItems として個別に渡す。

/** 講師登録申請: 実績 */
export const MAX_ACHIEVEMENT_ITEMS = 6;
/** 講義開講申請: 受講者の到達目標 */
export const MAX_GOAL_ITEMS = 3;

// -- Session count range --

export const SESSION_MIN = 3;
export const SESSION_MAX = 15;

// -- Filename constants --

export const FILENAME_FALLBACK = "無題";

// -- Placeholders --

export const PLACEHOLDERS = {
  instructor: {
    name: "例: tzug",
    age: "例: 18",
    discordId: "例: #username",
    xId: "例: @username",
    field: "例: 情報工学，Arcaea",
    fieldReason:
      "例: 音楽ゲームに対して情報工学の技術を用いたり，音楽ゲームの内部構造を解き明かしたりする楽しみを教えたいため．また，Arcaeaを情報学的視点から見るため．",
    achievement: "学位，資格，学業成績，レートなど",
    selfAppeal:
      "例: 工業系の学校で情報工学系の学科に所属しており現在3年生です．通算GPAが3.5，学科内順位が２位ですので相応の学力を有していると考えています．",
  },
  course: {
    subjectName: "例: 音ゲーマーのための画像処理入門",
    instructorName: "例: tzug",
    sessionCount: "3～15",
    overview:
      "例: PythonでOpenCVを用いた画像処理について学ぶ．行列の基本計算から線形変換までを一通り取り扱った後，OpenCVを用いた画像処理について実践形式で学んでいく（PC必須）．",
    goal: "例: 譜面研究において画像処理を活かすことが出来る",
    approach:
      "例: 講義資料を掲載して各自で学習する方法や、ボイスチャット・Zoomで受講者と対話しながら進める方法があります。",
    sessionContent: "各回で扱う内容",
    aiUsage: "生成AIを使用する場合のルールや、受講者の使用範囲を記入してください。",
    gradingMethod: "例: 各回の課題を合計し、理解度と取り組みを評価します。",
    references: "例: 参考サイトURL、書籍名など",
  },
} as const;
