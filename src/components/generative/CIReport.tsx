"use client";

import type { CIReportProps } from "@/lib/schemas";

export function CIReport(props: CIReportProps) {
  const scoreColor =
    props.overallHealthScore >= 80
      ? "text-success"
      : props.overallHealthScore >= 50
        ? "text-warning"
        : "text-error";

  const scoreBg =
    props.overallHealthScore >= 80
      ? "bg-success/10"
      : props.overallHealthScore >= 50
        ? "bg-warning/10"
        : "bg-error/10";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">CI Health Report</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {props.repoName} &middot; {props.period}
          </p>
        </div>
        <span className="landing-card-badge">CI/CD</span>
      </div>

      {/* Health Score + Summary */}
      <div className="rounded-2xl border border-[#e6e2d9]/50 bg-card p-5 shadow-lg">
        <div className="flex items-center gap-5">
          <div
            className={`flex items-center justify-center h-20 w-20 rounded-2xl ${scoreBg} shrink-0`}
          >
            <div className="text-center">
              <span className={`text-2xl font-bold ${scoreColor}`}>
                {props.overallHealthScore}
              </span>
              <p className="text-[10px] text-muted-foreground font-medium">/ 100</p>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground mb-1">Overall Health</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {props.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Failing Suites */}
      {props.failingSuites && props.failingSuites.length > 0 && (
        <div className="rounded-2xl border border-[#e6e2d9]/50 bg-card p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Failing Workflows ({props.failingSuites.length})
          </h3>
          <div className="space-y-3">
            {props.failingSuites.map((suite, i) => (
              <a
                key={i}
                href={suite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {suite.workflowName}
                    </span>
                    {suite.isFlaky && (
                      <span className="rounded-full bg-warning/10 text-warning px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        Flaky
                      </span>
                    )}
                  </div>
                  <span className="rounded-full bg-error/10 text-error px-2 py-0.5 text-xs font-semibold">
                    {suite.failureCount} failures
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Last failure: {suite.lastFailure}
                </p>
                <p className="text-sm text-foreground mb-2">{suite.errorSummary}</p>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Fix:</span> {suite.suggestedFix}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {props.recommendations && props.recommendations.length > 0 && (
        <div className="rounded-2xl border border-[#e6e2d9]/50 bg-card p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Recommendations
          </h3>
          <ol className="space-y-2.5">
            {props.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-info/10 text-[10px] font-bold text-info">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground">{rec}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
