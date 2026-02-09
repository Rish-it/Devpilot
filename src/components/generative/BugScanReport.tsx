"use client";

import type { BugScanReportProps } from "@/lib/schemas";

const SEVERITY_STYLES: Record<string, { badge: string; dot: string }> = {
  high: { badge: "bg-error/10 text-error", dot: "bg-error" },
  medium: { badge: "bg-warning/10 text-warning", dot: "bg-warning" },
  low: { badge: "bg-info/10 text-info", dot: "bg-info" },
};

export function BugScanReport(props: BugScanReportProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Bug Scan Report</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {props.repoName} &middot; {props.scanPeriod}
          </p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {props.totalCommitsScanned} commits scanned
        </span>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-[#e6e2d9]/50 bg-card p-5 shadow-lg">
        <p className="text-sm text-foreground leading-relaxed">{props.summary}</p>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
          {["high", "medium", "low"].map((sev) => {
            const count = props.findings.filter((f) => f.severity === sev).length;
            if (count === 0) return null;
            const style = SEVERITY_STYLES[sev];
            return (
              <div key={sev} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                <span className="text-xs font-medium text-muted-foreground capitalize">
                  {count} {sev}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Findings */}
      {props.findings.map((finding, i) => {
        const style = SEVERITY_STYLES[finding.severity] || SEVERITY_STYLES.low;
        return (
          <div
            key={i}
            className="rounded-2xl border border-[#e6e2d9]/50 bg-card p-5 shadow-lg space-y-3"
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${style.badge}`}
              >
                {finding.severity}
              </span>
              <a
                href={finding.commitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                {finding.commitSha.slice(0, 7)}
              </a>
            </div>

            <p className="text-xs text-muted-foreground truncate">
              {finding.commitMessage}
            </p>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Suspicious Pattern</p>
              <p className="text-sm text-foreground">{finding.suspiciousPattern}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Suggested Fix</p>
              <div className="rounded-lg bg-muted/50 border border-border p-3">
                <p className="text-sm text-foreground font-mono whitespace-pre-wrap">
                  {finding.suggestedFix}
                </p>
              </div>
            </div>

            {finding.affectedFiles && finding.affectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {finding.affectedFiles.map((file, j) => (
                  <span
                    key={j}
                    className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground"
                  >
                    {file}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
