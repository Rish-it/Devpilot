"use client";

import type { StandupSummaryProps } from "@/lib/schemas";

export function StandupSummary(props: StandupSummaryProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-lg font-semibold">Standup Summary</h3>
      <p className="text-sm text-muted">{props.repoName} &middot; {props.date}</p>
    </div>
  );
}
