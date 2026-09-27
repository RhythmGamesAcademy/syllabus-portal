"use client";

import React from "react";
import Watermark from "./Watermark";
import { formatDate } from "@/lib/generatePng";
import { useLocale } from "@/lib/i18n";

interface PngTemplateProps {
  title: string;
  children: React.ReactNode;
  generatedAt?: Date;
}

/**
 * Common PNG template that wraps individual form layouts.
 * Provides:
 * - White background
 * - Document title
 * - PNG creation date (auto-filled)
 * - Watermark layer
 * - Academy logo in bottom-left
 *
 * Layer order: Background (white) -> Watermark -> Content
 */
const PngTemplate = React.forwardRef<HTMLDivElement, PngTemplateProps>(
  function PngTemplate({ title, children, generatedAt }, ref) {
    const { t } = useLocale();
    const today = formatDate(generatedAt);

    return (
      <div
        ref={ref}
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: "793.6px",
          height: "1122.56px",
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          fontFamily: "'Zen Kurenaido', 'Noto Sans JP', sans-serif",
          color: "#1a1a1a",
          overflow: "hidden",
        }}
      >
        {/* Layer 1: Watermark */}
        <Watermark />

        {/* Layer 2: Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "38px 42px 38px",
          }}
          data-a4-content
        >
          {/* Header: Title + PNG creation date */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "20px",
            }}
          >
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                borderBottom: "2px solid #1a1a1a",
                paddingBottom: "8px",
              }}
            >
              {title}
            </h1>
            <div
              style={{
                fontSize: "13px",
                color: "#666666",
                textAlign: "right",
              }}
            >
              <div>{t("PNG作成日")}</div>
              <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a1a" }}>
                {today}
              </div>
            </div>
          </div>

          {/* Form fields */}
          {children}
        </div>

        {/* Footer: Logo */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            left: "48px",
            display: "flex",
            alignItems: "center",
            zIndex: 2,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ongakugamegakuen-logo_b.svg"
            alt={t("音楽ゲーム学園")}
            style={{
              height: "54px",
              width: "auto",
            }}
          />
        </div>
      </div>
    );
  }
);

export default PngTemplate;
