"use client";

import type { WeeklyUpdateProps } from "@/lib/schemas";

const IMPACT_STYLES: Record<string, string> = {
  high: "bg-error/10 text-error",
  medium: "bg-warning/10 text-warning",
  low: "bg-info/10 text-info",
};

export function WeeklyUpdate(props: WeeklyUpdateProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Weekly Update</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {props.repoName} &middot; Week of {props.weekOf}
          </p>
        </div>
        <span className="landing-card-badge">Weekly</span>
      </div>

      {/* TL;DR */}
      <div className="rounded-2xl border border-info/30 bg-info/5 p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <svg className="h-4 w-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          TL;DR
        </h3>
        <p className="text-sm text-foreground leading-relaxed">{props.tldr}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-5 gap-3">
        <MetricCard label="PRs Opened" value={props.metrics.prsOpened} />
        <MetricCard label="PRs Merged" value={props.metrics.prsMerged} />
        <MetricCard label="PRs Closed" value={props.metrics.prsClosed} />
        <MetricCard label="Commits" value={props.metrics.commitsTotal} />
        <MetricCard label="Contributors" value={props.metrics.contributorsActive} />
      </div>

      {/* Key Changes */}
      {props.keyChanges && props.keyChanges.length > 0 && (
        <div className="rounded-2xl border border-[#e6e2d9]/50 bg-card p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Key Changes ({props.keyChanges.length})
          </h3>
          <div className="space-y-3">
            {props.keyChanges.map((change, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-sm font-medium text-foreground">{change.title}</h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${IMPACT_STYLES[change.impact] || IMPACT_STYLES.low}`}
                  >
                    {change.impact}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1.5">
                  {change.description}
                </p>
                <a
                  href={change.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  View PR &rarr;
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risks & Incidents */}
      {props.risksAndIncidents && props.risksAndIncidents.length > 0 && (
        <div className="rounded-2xl border border-warning/30 bg-warning/5 p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Risks & Incidents
          </h3>
          <ul className="space-y-2">
            {props.risksAndIncidents.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Outlook */}
      {props.nextWeekOutlook && (
        <div className="rounded-2xl border border-[#e6e2d9]/50 bg-card p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Next Week Outlook
          </h3>
          <p className="text-sm text-foreground leading-relaxed">
            {props.nextWeekOutlook}
          </p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#e6e2d9]/50 bg-card p-3 shadow-sm text-center">
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
        {label}
      </p>
    </div>
  );
}
