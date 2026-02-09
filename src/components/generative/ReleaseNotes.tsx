"use client";

import { useState } from "react";
import type { ReleaseNotesProps } from "@/lib/schemas";

const CATEGORY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  Features: { color: "text-success", bg: "bg-success/5", border: "border-l-success" },
  "Bug Fixes": { color: "text-error", bg: "bg-error/5", border: "border-l-error" },
  Improvements: { color: "text-info", bg: "bg-info/5", border: "border-l-info" },
  "Breaking Changes": { color: "text-warning", bg: "bg-warning/5", border: "border-l-warning" },
  Other: { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-l-muted-foreground" },
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Release Notes</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {props.repoName} &middot; {props.periodStart} to {props.periodEnd}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {props.version && (
            <span className="rounded-full bg-info/10 text-info px-3 py-1 text-xs font-semibold">
              {props.version}
            </span>
          )}
          <span className="landing-card-badge">Weekly</span>
        </div>
      </div>

      {/* Sections */}
      {props.sections.map((section, i) => {
        const style = CATEGORY_STYLES[section.category] || CATEGORY_STYLES.Other;
        return (
          <div
            key={i}
            className={`rounded-2xl border border-[#e6e2d9]/50 ${style.bg} p-5 shadow-lg border-l-4 ${style.border}`}
          >
            <h3 className={`text-sm font-semibold ${style.color} mb-3 flex items-center gap-2`}>
              <CategoryIcon category={section.category} />
              {section.category} ({section.items.length})
            </h3>
            <div className="space-y-2.5">
              {section.items.map((item, j) => (
                <div key={j} className="flex items-start gap-3">
                  <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${style.color.replace("text-", "bg-")}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={item.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        #{item.prNumber}
                      </a>
                      <span className="text-xs text-muted-foreground">by {item.author}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Contributors */}
      {props.contributors && props.contributors.length > 0 && (
        <div className="rounded-2xl border border-[#e6e2d9]/50 bg-card p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Contributors ({props.contributors.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {props.contributors.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-accent text-accent-foreground text-xs font-semibold border border-border"
                title={c}
              >
                {c.slice(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Copy Markdown */}
      {props.markdownOutput && (
        <button
          onClick={handleCopyMarkdown}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card-hover shadow-sm"
        >
          <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
