/**
 * Format Text — Renders **bold** markdown-style text as styled spans.
 */
import React from "react";

export function formatText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <span key={i} className="text-[#dadfe3] font-['Inter:Semi_Bold',sans-serif] font-semibold">{p.slice(2, -2)}</span>
      : p
  );
}
