"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathTextProps {
  text?: string | null;
  className?: string;
  stripSvg?: boolean;
}

/**
 * Parses and renders LaTeX mathematical expressions ($...$, $$...$$, \(...\), \[...\])
 * within text strings using KaTeX, while preserving regular text and formatting line breaks.
 */
export function MathText({ text, className, stripSvg = false }: MathTextProps) {
  const content = useMemo(() => {
    if (!text) return null;

    let processed = String(text);

    // If stripSvg is requested, remove any <svg ...>...</svg> blocks
    if (stripSvg) {
      processed = processed.replace(/<svg[\s\S]*?<\/svg>/gi, "").trim();
      processed = processed.replace(/```(?:svg|xml|html)?\s*<svg[\s\S]*?<\/svg>\s*```/gi, "").trim();
    }

    // Convert HTML break tags into newlines
    processed = processed.replace(/<br\s*\/?>/gi, "\n");

    // Regular expression matching:
    // 1. $$...$$ (display math)
    // 2. \[...\] (display math)
    // 3. $...$ (inline math, ensuring not empty and not matching currency e.g. $100 without math symbols)
    // 4. \(...\) (inline math)
    const mathRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\(.+?\\\)|\n)/g;

    const parts = processed.split(mathRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      if (part === "\n") {
        return <br key={`br-${index}`} />;
      }

      // Check display math $$...$$
      if (part.startsWith("$$") && part.endsWith("$$") && part.length >= 4) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <span
              key={`math-disp-${index}`}
              className="my-2 block overflow-x-auto text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={`math-err-${index}`}>{part}</span>;
        }
      }

      // Check display math \[...\]
      if (part.startsWith("\\[") && part.endsWith("\\]") && part.length >= 4) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <span
              key={`math-bracket-disp-${index}`}
              className="my-2 block overflow-x-auto text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={`math-err-${index}`}>{part}</span>;
        }
      }

      // Check inline math $...$
      if (part.startsWith("$") && part.endsWith("$") && part.length >= 2) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={`math-inline-${index}`}
              className="inline-math px-0.5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={`math-err-${index}`}>{part}</span>;
        }
      }

      // Check inline math \(...\)
      if (part.startsWith("\\(") && part.endsWith("\\)") && part.length >= 4) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={`math-paren-${index}`}
              className="inline-math px-0.5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={`math-err-${index}`}>{part}</span>;
        }
      }

      // Regular text
      return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
    });
  }, [text, stripSvg]);

  if (!content) return null;

  return <span className={className}>{content}</span>;
}

/**
 * Utility to strip any SVG markup and HTML breaks from a question stem for clean table preview.
 */
export function cleanQuestionStem(raw?: string | null): string {
  if (!raw) return "";
  return raw
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/```(?:svg|xml|html)?\s*<svg[\s\S]*?<\/svg>\s*```/gi, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
