import type { Metadata } from "next";
import { Noto_Sans_JP, Zen_Kurenaido } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const zenKurenaido = Zen_Kurenaido({
  variable: "--font-zen-kurenaido",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "シラバス作成アプリ | 音楽ゲーム学園",
  description: "音楽ゲーム学園のシラバスをブラウザ上で作成・ダウンロードできるWEBアプリケーション。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} ${zenKurenaido.variable} antialiased min-h-screen flex flex-col`}
      >
        <div className="ambient-bg" aria-hidden="true" />
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
