import html2canvas from "html2canvas";
import { FILENAME_FALLBACK } from "./constants";
import { formatTokyoDate } from "./japanTime";

/**
 * Sanitize a string for safe use in filenames.
 * - Removes filesystem-unsafe characters (\ / : * ? " < > |)
 * - Preserves emojis and full-width characters (e.g., 日本語, 😊)
 * - Replaces whitespace and control characters with underscores
 * - Returns FILENAME_FALLBACK if the result is empty
 */
export function sanitizeFilename(name: string): string {
  return name
    .trim()
    // Remove filesystem-unsafe characters (Windows/macOS/Linux)
    .replace(/[\\/:*?"<>|]/g, "")
    // Replace consecutive whitespace/control chars with a single underscore
    .replace(/[\s\u0000-\u001f\u007f]+/g, "_")
    // Collapse multiple underscores
    .replace(/_+/g, "_")
    // Strip leading/trailing underscores
    .replace(/^_+|_+$/g, "")
    || FILENAME_FALLBACK;
}

/**
 * Wait for all fonts to be loaded before rendering.
 * Zen Kurenaido may take time to load on first use.
 */
async function waitForFonts(): Promise<void> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  // Extra safety: small delay for font rendering
  await new Promise((resolve) => setTimeout(resolve, 200));
}

/**
 * Generate a PNG from a DOM element and trigger download.
 */
export async function generatePng(
  element: HTMLElement,
  filename: string
): Promise<void> {
  await waitForFonts();

  const content = element.querySelector<HTMLElement>("[data-a4-content]");
  if (!content) {
    throw new Error("A4 content container was not found");
  }

  const originalTransform = content.style.transform;
  content.style.transform = "none";
  const availableHeight = element.clientHeight - 122.56;
  const contentHeight = content.scrollHeight;
  const fitScale =
    contentHeight > availableHeight ? availableHeight / contentHeight : 1;
  content.style.transform = `scale(${fitScale})`;
  content.style.transformOrigin = "top left";

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(element, {
      scale: 300 / 96,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: 793.6,
      height: 1122.56,
    });
  } finally {
    content.style.transform = originalTransform;
    content.style.transformOrigin = "";
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );

  if (!blob) {
    throw new Error("PNG generation failed");
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format a date as YYYY/MM/DD in Japan time for display in the document.
 */
export function formatDate(date: Date = new Date()): string {
  return formatTokyoDate(date, "/");
}

/**
 * Format a date as YYYYMMDD in Japan time for filenames.
 */
export function formatDateForFilename(date: Date = new Date()): string {
  return formatTokyoDate(date, "");
}
