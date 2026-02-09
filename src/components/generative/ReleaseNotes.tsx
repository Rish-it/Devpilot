"use client";

import { useState } from "react";
import type { ReleaseNotesProps } from "@/lib/schemas";

const CATEGORY_COLORS: Record<string, string> = {
  Features: "#22c55e",
  "Bug Fixes": "#ef4444",
  Improvements: "#3b82f6",
  "Breaking Changes": "#f59e0b",
  Other: "#6F6F6F",
};

export function ReleaseNotes(props: ReleaseNotesProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = async () => {
    if (props.markdownOutput) {
      await navigator.clipboard.writeText(props.markdownOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="neu-shell">
      <div className="neu-shell-header">
        <div className="flex-1 min-w-0">
          <h1 className="neu-shell-title">Release Notes</h1>
          <p className="neu-shell-subtitle">
            {props.repoName} &middot; {props.periodStart} to {props.periodEnd}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {props.version && (
            <span className="neu-shell-badge">{props.version}</span>
          )}
          <span className="neu-shell-badge">Weekly</span>
        </div>
      </div>
      <div className="neu-shell-body">
        <div className="space-y-5">
          {props.sections.map((section, i) => {
            const accent = CATEGORY_COLORS[section.category] || CATEGORY_COLORS.Other;
            return (
              <div key={i} className="neu-gen-card" style={{ borderLeft: `3px solid ${accent}` }}>
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: accent }}>
                  <CategoryIcon category={section.category} />
                  {section.category} ({section.items.length})
                </h3>
                <div className="space-y-2.5">
                  {section.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: accent }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{ color: "#282828" }}>{item.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={item.prUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="neu-sha"
                          >
                            #{item.prNumber}
                          </a>
                          <span className="text-xs" style={{ color: "#999" }}>by {item.author}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {props.contributors && props.contributors.length > 0 && (
            <div className="neu-gen-card">
              <h3 className="text-sm font-bold mb-3" style={{ color: "#282828" }}>
                Contributors ({props.contributors.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {props.contributors.map((c, i) => (
                  <div key={i} className="neu-avatar" title={c}>
                    {c.slice(0, 2).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}
          {props.markdownOutput && (
            <button onClick={handleCopyMarkdown} className="neu-gen-btn">
              <svg className="h-4 w-4" style={{ color: "#6F6F6F" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {copied ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                )}
              </svg>
              {copied ? "Copied!" : "Copy as Markdown"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryIcon({ category }: { category: string }) {
  const paths: Record<string, string> = {
    Features: "M12 4v16m8-8H4",
    "Bug Fixes": "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    Improvements: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    "Breaking Changes": "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
    Other: "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z",
  };
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[category] || paths.Other} />
    </svg>
  );
}
