"use client";

import type { ReleaseNotesProps } from "@/lib/schemas";

export function ReleaseNotes(props: ReleaseNotesProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-lg font-semibold">Release Notes</h3>
      <p className="text-sm text-muted">{props.repoName} &middot; {props.periodStart} to {props.periodEnd}</p>
    </div>
  );
}
