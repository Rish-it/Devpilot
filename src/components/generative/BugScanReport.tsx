"use client";

import type { BugScanReportProps } from "@/lib/schemas";

export function BugScanReport(props: BugScanReportProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-lg font-semibold">Bug Scan Report</h3>
      <p className="text-sm text-muted">{props.repoName} &middot; {props.scanPeriod}</p>
    </div>
  );
}
