"use client";

import type { StandupSummaryProps } from "@/lib/schemas";

export function StandupSummary(props: StandupSummaryProps) {
  return (
    <div className="neu-gen-panel space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#282828" }}>Standup Summary</h2>
          <p className="text-sm mt-0.5" style={{ color: "#6F6F6F" }}>
            {props.repoName} &middot; {props.date}
          </p>
        </div>
        <span className="neu-badge">Daily</span>
      </div>

      {/* Highlights */}
      {props.highlights && props.highlights.length > 0 && (
        <div className="neu-gen-card" style={{ borderLeft: "3px solid #22c55e" }}>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#22c55e" }}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Highlights
          </h3>
          <ul className="space-y-2">
            {props.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "#282828" }}>
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "#22c55e" }} />
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Commits */}
      {props.commitsSummary && props.commitsSummary.length > 0 && (
        <div className="neu-gen-card">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#282828" }}>
            <svg className="h-4 w-4" style={{ color: "#6F6F6F" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Commits ({props.commitsSummary.length})
          </h3>
          <div className="space-y-2.5">
            {props.commitsSummary.map((c, i) => (
              <div key={i} className="flex items-start gap-3 group">
                <div className="flex flex-col items-center mt-0.5">
                  <div className="h-2 w-2 rounded-full" style={{ background: "#6F6F6F" }} />
                  {i < props.commitsSummary.length - 1 && (
                    <div className="w-px h-full min-h-[20px]" style={{ background: "#ddd" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neu-sha"
                    >
                      {c.sha.slice(0, 7)}
                    </a>
                    <span className="text-xs" style={{ color: "#999" }}>{c.author}</span>
                  </div>
                  <p className="text-sm truncate" style={{ color: "#282828" }}>{c.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PR Activity */}
      {props.prActivity && props.prActivity.length > 0 && (
        <div className="neu-gen-card">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#282828" }}>
            <svg className="h-4 w-4" style={{ color: "#6F6F6F" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                className="neu-gen-row"
              >
                <StatusBadge status={pr.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#282828" }}>
                    #{pr.number} {pr.title}
                  </p>
                  <p className="text-xs" style={{ color: "#999" }}>{pr.author}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Blockers */}
      {props.blockers && props.blockers.length > 0 && (
        <div className="neu-gen-card" style={{ borderLeft: "3px solid #f59e0b" }}>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#f59e0b" }}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Blockers
          </h3>
          <ul className="space-y-2">
            {props.blockers.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "#282828" }}>
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "#f59e0b" }} />
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
  const colors: Record<string, string> = {
    opened: "#22c55e",
    merged: "#3b82f6",
    closed: "#ef4444",
    reviewed: "#f59e0b",
  };
  const color = colors[status] || "#6F6F6F";
  return (
    <span className="neu-status-badge" style={{ color, background: `${color}12` }}>
      {status}
    </span>
  );
}
