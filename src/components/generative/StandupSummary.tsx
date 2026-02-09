"use client";

import type { StandupSummaryProps } from "@/lib/schemas";

export function StandupSummary(props: StandupSummaryProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Standup Summary</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {props.repoName} &middot; {props.date}
          </p>
        </div>
        <span className="landing-card-badge">Daily</span>
      </div>

      {/* Highlights */}
      {props.highlights && props.highlights.length > 0 && (
        <div className="rounded-2xl border border-[#e6e2d9]/50 bg-card p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Highlights
          </h3>
          <ul className="space-y-2">
            {props.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Commits */}
      {props.commitsSummary && props.commitsSummary.length > 0 && (
        <div className="rounded-2xl border border-[#e6e2d9]/50 bg-card p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Commits ({props.commitsSummary.length})
          </h3>
          <div className="space-y-2.5">
            {props.commitsSummary.map((c, i) => (
              <div key={i} className="flex items-start gap-3 group">
                <div className="flex flex-col items-center mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-border group-hover:bg-foreground transition-colors" />
                  {i < props.commitsSummary.length - 1 && (
                    <div className="w-px h-full min-h-[20px] bg-border" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {c.sha.slice(0, 7)}
                    </a>
                    <span className="text-xs text-muted-foreground">{c.author}</span>
                  </div>
                  <p className="text-sm text-foreground truncate">{c.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PR Activity */}
      {props.prActivity && props.prActivity.length > 0 && (
        <div className="rounded-2xl border border-[#e6e2d9]/50 bg-card p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Pull Requests ({props.prActivity.length})
          </h3>
          <div className="space-y-2">
            {props.prActivity.map((pr, i) => (
              <a
                key={i}
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted"
              >
                <StatusBadge status={pr.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    #{pr.number} {pr.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{pr.author}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Blockers */}
      {props.blockers && props.blockers.length > 0 && (
        <div className="rounded-2xl border border-warning/30 bg-warning/5 p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Blockers
          </h3>
          <ul className="space-y-2">
            {props.blockers.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    opened: "bg-success/10 text-success",
    merged: "bg-info/10 text-info",
    closed: "bg-error/10 text-error",
    reviewed: "bg-warning/10 text-warning",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status] || "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}
