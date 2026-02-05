"use client";

import type { CIReportProps } from "@/lib/schemas";

export function CIReport(props: CIReportProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-lg font-semibold">CI Health Report</h3>
      <p className="text-sm text-muted">{props.repoName} &middot; {props.period}</p>
    </div>
  );
}
