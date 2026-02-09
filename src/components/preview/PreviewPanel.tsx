"use client";

import { ReactNode } from "react";

interface PreviewPanelProps {
  component: ReactNode;
  isGenerating: boolean;
  generationStage: string;
}

export function PreviewPanel({
  component,
  isGenerating,
  generationStage,
}: PreviewPanelProps) {
  // Loading state — generating but no component yet
  if (isGenerating && !component) {
    return (
      <div className="preview-panel">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-card border border-border flex items-center justify-center">
              <svg
                className="h-8 w-8 text-muted-foreground animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {generationStage === "STREAMING_RESPONSE"
                ? "Generating component..."
                : "Analyzing request..."}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This may take a moment
            </p>
          </div>
          {/* Shimmer skeleton */}
          <div className="w-full max-w-md space-y-3 mt-4">
            <div className="h-8 rounded-lg animate-shimmer" />
            <div className="h-32 rounded-lg animate-shimmer" style={{ animationDelay: "200ms" }} />
            <div className="h-20 rounded-lg animate-shimmer" style={{ animationDelay: "400ms" }} />
          </div>
        </div>
      </div>
    );
  }

  // Active state — component exists
  if (component) {
    return (
      <div className="preview-panel" style={{ alignItems: "flex-start" }}>
        <div className="w-full max-w-4xl animate-fadeIn">{component}</div>
      </div>
    );
  }

  // Empty state — no component, not generating
  return (
    <div className="preview-panel">
      <div className="flex flex-col items-center gap-6">
        {/* Card with layered shadow (matching landing card style) */}
        <div className="relative group">
          <div className="relative z-10 flex flex-col items-center gap-4 rounded-2xl border border-[#e6e2d9]/50 bg-card px-10 py-10 shadow-lg">
            <div className="h-14 w-14 rounded-xl bg-background border border-border flex items-center justify-center">
              <svg
                className="h-7 w-7 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-base font-semibold text-foreground mb-1">
                Generative UI
              </h3>
              <p className="text-sm text-muted-foreground max-w-[260px]">
                Components will appear here as you chat. Try a suggestion to get started.
              </p>
            </div>
          </div>
          {/* Layered shadows matching AutomationCard */}
          <div className="absolute inset-0 z-0 translate-y-2 rotate-1 rounded-2xl border border-[#e6e2d9]/40 bg-[#f0ede4]/50" />
          <div className="absolute inset-0 -z-10 translate-y-3 rotate-2 rounded-2xl border border-[#e6e2d9]/30 bg-[#f0ede4]/30" />
        </div>

        {/* Available component types */}
        <div className="flex flex-wrap justify-center gap-2 max-w-md">
          {[
            "Standup Summary",
            "Release Notes",
            "Bug Scanner",
            "CI Report",
            "Weekly Update",
          ].map((name) => (
            <span
              key={name}
              className="landing-card-badge"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
