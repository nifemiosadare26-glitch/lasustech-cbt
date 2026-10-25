"use client";

import React, { useMemo } from "react";
import { mediaSrc } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { MathText } from "./math-text";

/**
 * Sanitizes SVG markup to protect candidates and staff from Stored XSS
 * while allowing full SVG diagram geometry (lines, paths, rects, circles, text, defs, markers).
 */
export function sanitizeSvgMarkup(svg: string): string {
  if (!svg) return "";
  let clean = svg;
  // 1. Remove executable scripts, embedded frames, and foreign objects
  clean = clean.replace(/<script[\s\S]*?<\/script>/gi, "");
  clean = clean.replace(/<script[\s\S]*?\/>/gi, "");
  clean = clean.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");
  clean = clean.replace(/<foreignObject[\s\S]*?\/>/gi, "");
  clean = clean.replace(/<\/?(iframe|object|embed|applet|meta|link|base)[\s\S]*?>/gi, "");
  
  // 2. Strip all inline on* event handler attributes (onload, onerror, onclick, etc.)
  clean = clean.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  
  // 3. Strip javascript: URLs from href and xlink:href
  clean = clean.replace(/(href|xlink:href)\s*=\s*("[^"]*javascript:[^"]*"|'[^']*javascript:[^']*')/gi, '$1=""');
  
  // 4. Disallow data: URLs unless it's a safe image (image/png, image/jpeg, image/webp)
  clean = clean.replace(/(href|xlink:href)\s*=\s*("[^"]*data:(?!image\/(?:png|jpeg|jpg|webp))[^"]*"|'[^']*data:(?!image\/(?:png|jpeg|jpg|webp))[^']*')/gi, '$1=""');

  return clean;
}

export function extractSvgFromText(text?: string | null): { cleanText: string; svgMarkup: string | null } {
  if (!text) return { cleanText: "", svgMarkup: null };

  let raw = String(text);

  // Match <svg ...>...</svg> blocks
  const svgRegex = /<svg[\s\S]*?<\/svg>/i;
  const match = raw.match(svgRegex);
  let extractedSvg: string | null = null;

  if (match) {
    extractedSvg = match[0];
    raw = raw.replace(svgRegex, "").trim();
  } else {
    // Check for markdown code-fenced svg: ```xml\n<svg... / ```svg\n<svg...
    const fencedSvgRegex = /```(?:svg|xml|html)?\s*(<svg[\s\S]*?<\/svg>)\s*```/i;
    const fencedMatch = raw.match(fencedSvgRegex);
    if (fencedMatch) {
      extractedSvg = fencedMatch[1];
      raw = raw.replace(fencedSvgRegex, "").trim();
    }
  }

  // Strip trailing/leading <br> remnants from the text
  const cleaned = raw
    .replace(/^(\s*<br\s*\/?>)+/gi, "")
    .replace(/(\s*<br\s*\/?>)+$/gi, "")
    .trim();

  return {
    cleanText: cleaned,
    svgMarkup: extractedSvg ? sanitizeSvgMarkup(extractedSvg) : null,
  };
}

interface DiagramRendererProps {
  text?: string | null;
  mediaUrl?: string | null;
  className?: string;
  imageClassName?: string;
  diagramClassName?: string;
}

/**
 * Extracts raw SVG diagram markup embedded in question stems or options
 * (e.g. from AI generation or document diagram extraction), separates the
 * textual prompt from the visual diagram, and renders both with clean
 * responsive scaling, KaTeX mathematical typesetting, and dark-mode adaptation.
 */
export function DiagramRenderer({
  text,
  mediaUrl,
  className,
  imageClassName,
  diagramClassName,
}: DiagramRendererProps) {
  const { cleanText, svgMarkup } = useMemo(() => extractSvgFromText(text), [text]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* 1. Question text with LaTeX math support */}
      {cleanText && (
        <div className="leading-relaxed font-medium">
          <MathText text={cleanText} />
        </div>
      )}

      {/* 2. Rendered SVG diagram if present */}
      {svgMarkup && (
        <div
          className={cn(
            "my-4 flex items-center justify-center p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white shadow-xs overflow-x-auto text-slate-900",
            diagramClassName
          )}
        >
          <div
            className="w-full max-w-2xl max-h-[420px] flex items-center justify-center [&_svg]:max-h-[380px] [&_svg]:w-full [&_svg]:max-w-full [&_svg]:h-auto text-slate-900"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        </div>
      )}

      {/* 3. External image media if present */}
      {mediaUrl && (
        <div className="my-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaSrc(mediaUrl) || ""}
            alt="Question diagram / illustration"
            className={cn(
              "max-h-72 rounded-xl border border-gray-200 dark:border-slate-800 object-contain bg-white dark:bg-slate-900 p-2",
              imageClassName
            )}
          />
        </div>
      )}
    </div>
  );
}
