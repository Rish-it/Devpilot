"use client";

interface Thread {
  id: string;
  title: string;
  createdAt: Date;
}

interface SidebarProps {
  activeView: "grid" | "thread";
  threads: Thread[];
  activeThreadId: string | null;
  onViewChange: (view: "grid" | "thread") => void;
  onNewThread: () => void;
  onSelectThread: (threadId: string) => void;
}

export function Sidebar({
  activeView,
  threads,
  activeThreadId,
  onViewChange,
  onNewThread,
  onSelectThread,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-[260px] flex-shrink-0 flex-col border-r border-border bg-sidebar-bg">
      {/* New Thread Button */}
      <div className="p-3">
        <button
          onClick={onNewThread}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card-hover"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New thread
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-3 pb-2">
        <button
          onClick={() => onViewChange("grid")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
            activeView === "grid"
              ? "bg-card-active text-foreground"
              : "text-muted-foreground hover:bg-card hover:text-foreground"
          }`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          Automations
        </button>
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-border" />

      {/* Threads Section */}
      <div className="flex flex-1 flex-col overflow-hidden px-3 py-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Recent Threads
          </span>
          {threads.length > 0 && (
            <span className="rounded-full bg-card px-1.5 py-0.5 text-xs text-muted">
              {threads.length}
            </span>
          )}
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto">
          {threads.length === 0 ? (
            <p className="px-1 py-2 text-xs text-muted">
              No threads yet. Start a new automation to create one.
            </p>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-colors ${
                  activeThreadId === thread.id
                    ? "bg-card-active text-foreground"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                <span className="line-clamp-1 text-sm">{thread.title}</span>
                <span className="text-xs text-muted">
                  {formatRelativeTime(thread.createdAt)}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Settings
        </button>
      </div>
    </aside>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
