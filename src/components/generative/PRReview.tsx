"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface PRReviewProps {
  owner: string;
  repo: string;
}

interface PRSummary {
  number: number;
  title: string;
  state: string;
  author: string;
  url: string;
}

interface PRDetail {
  number: number;
  title: string;
  body: string;
  state: string;
  draft: boolean;
  merged: boolean;
  mergeable: boolean | null;
  mergeableState: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  headBranch: string;
  baseBranch: string;
  headSha: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  commits: number;
  comments: number;
  labels: { name: string; color: string }[];
  url: string;
}

interface PRComment {
  id: number;
  type: "issue" | "review";
  body: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
  path?: string;
  line?: number;
  diffHunk?: string;
  inReplyToId?: number;
  url: string;
}

interface PRCommit {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  authorAvatar: string;
  date: string;
  url: string;
}

interface PRFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch: string;
}

interface CheckRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  startedAt: string | null;
  completedAt: string | null;
  url: string | null;
  app: string;
}

interface ChecksData {
  mergeable: boolean | null;
  mergeableState: string;
  headSha: string;
  checks: CheckRun[];
  statuses: { context: string; state: string; description: string | null; targetUrl: string | null }[];
  overallState: string;
}

type TabId = "conversation" | "commits" | "checks" | "files";

export function PRReview({ owner, repo }: PRReviewProps) {
  const [prs, setPrs] = useState<PRSummary[]>([]);
  const [selectedPR, setSelectedPR] = useState<number | null>(null);
  const [isPRDropdownOpen, setIsPRDropdownOpen] = useState(false);
  const [prDetail, setPrDetail] = useState<PRDetail | null>(null);
  const [comments, setComments] = useState<PRComment[]>([]);
  const [prCommits, setPrCommits] = useState<PRCommit[]>([]);
  const [prFiles, setPrFiles] = useState<PRFile[]>([]);
  const [checksData, setChecksData] = useState<ChecksData | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("conversation");
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const prDropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState({
    prs: true,
    detail: false,
    comments: false,
    commits: false,
    files: false,
    checks: false,
  });

  const baseParams = `owner=${owner}&repo=${repo}`;

  // Fetch open PRs on mount
  useEffect(() => {
    fetch(`/api/github/pulls?${baseParams}&state=open&per_page=20`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPrs(data);
          if (data.length > 0) setSelectedPR(data[0].number);
        }
        setLoading((p) => ({ ...p, prs: false }));
      })
      .catch(() => setLoading((p) => ({ ...p, prs: false })));
  }, [baseParams]);

  // Fetch PR detail + all tabs when PR is selected
  const loadPR = useCallback(
    (prNumber: number) => {
      setLoading((p) => ({
        ...p,
        detail: true,
        comments: true,
        commits: true,
        files: true,
        checks: true,
      }));

      // PR detail
      fetch(`/api/github/pulls/${prNumber}?${baseParams}`)
        .then((r) => r.json())
        .then((data) => {
          if (!data.error) setPrDetail(data);
          setLoading((p) => ({ ...p, detail: false }));
        })
        .catch(() => setLoading((p) => ({ ...p, detail: false })));

      // Comments
      fetch(`/api/github/pulls/${prNumber}/comments?${baseParams}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setComments(data);
          setLoading((p) => ({ ...p, comments: false }));
        })
        .catch(() => setLoading((p) => ({ ...p, comments: false })));

      // Commits
      fetch(`/api/github/pulls/${prNumber}/commits?${baseParams}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setPrCommits(data);
          setLoading((p) => ({ ...p, commits: false }));
        })
        .catch(() => setLoading((p) => ({ ...p, commits: false })));

      // Files
      fetch(`/api/github/pulls/${prNumber}/files?${baseParams}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setPrFiles(data);
          setLoading((p) => ({ ...p, files: false }));
        })
        .catch(() => setLoading((p) => ({ ...p, files: false })));

      // Checks
      fetch(`/api/github/pulls/${prNumber}/checks?${baseParams}`)
        .then((r) => r.json())
        .then((data) => {
          if (!data.error) setChecksData(data);
          setLoading((p) => ({ ...p, checks: false }));
        })
        .catch(() => setLoading((p) => ({ ...p, checks: false })));
    },
    [baseParams]
  );

  useEffect(() => {
    if (selectedPR) loadPR(selectedPR);
  }, [selectedPR, loadPR]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (prDropdownRef.current && !prDropdownRef.current.contains(event.target as Node)) {
        setIsPRDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFile = (filename: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      return next;
    });
  };

  const postComment = async (body: string, path?: string, line?: number) => {
    if (!selectedPR || !body.trim()) return;
    try {
      const payload: Record<string, unknown> = { body };
      if (path) {
        payload.type = "review";
        payload.path = path;
        payload.line = line;
        payload.commitId = prDetail?.headSha;
      }
      const res = await fetch(
        `/api/github/pulls/${selectedPR}/comments?${baseParams}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const newComment = await res.json();
      if (newComment.id) {
        setComments((prev) => [...prev, newComment]);
      }
    } catch {
      // silently fail
    }
  };

  const totalChecks = checksData
    ? checksData.checks.length + checksData.statuses.length
    : 0;
  const selectedPRSummary = prs.find((pr) => pr.number === selectedPR) || null;

  if (loading.prs) {
    return (
      <div className="pr-review">
        <div className="pr-loading">
          <div className="pr-loading-spinner" />
          <p>Loading pull requests...</p>
        </div>
      </div>
    );
  }

  if (prs.length === 0) {
    return (
      <div className="pr-review">
        <div className="pr-empty-state">
          <svg className="w-16 h-16 text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-1">No open pull requests</h3>
          <p className="text-sm text-muted-foreground">
            {owner}/{repo} has no open PRs right now
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pr-review">
      {/* PR Header */}
      <div className="pr-header">
        <div className="pr-header-top">
          <div className="pr-title-area">
            {prDetail ? (
              <>
                <h1 className="pr-title">{prDetail.title}</h1>
                <div className="pr-title-meta">
                  <span className={`pr-state-badge ${prDetail.merged ? "merged" : prDetail.state}`}>
                    <PRStateIcon state={prDetail.merged ? "merged" : prDetail.state} />
                    {prDetail.merged ? "Merged" : prDetail.state === "open" ? "Open" : "Closed"}
                  </span>
                  <span className="pr-number">#{prDetail.number}</span>
                </div>
              </>
            ) : (
              <div className="pr-skeleton-title" />
            )}
          </div>
          {/* PR Selector */}
          <div ref={prDropdownRef} className="relative flex-shrink-0">
            <button
              onClick={() => setIsPRDropdownOpen((open) => !open)}
              className="pr-selector pr-selector-trigger"
              aria-label="Select pull request"
              type="button"
            >
              <span className="truncate">
                {selectedPRSummary
                  ? `#${selectedPRSummary.number} ${selectedPRSummary.title}`
                  : "Select pull request"}
              </span>
              <svg
                className={`h-4 w-4 shrink-0 transition-transform ${isPRDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isPRDropdownOpen && (
              <div className="pr-selector-menu absolute right-0 top-full z-50 mt-3 w-[420px] max-h-96 overflow-y-auto rounded-2xl border border-[#e6e2d9] bg-card p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                <div className="space-y-0.5">
                  {prs.map((pr) => (
                    <button
                      key={pr.number}
                      onClick={() => {
                        setSelectedPR(pr.number);
                        setIsPRDropdownOpen(false);
                      }}
                      className={`pr-selector-item flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${selectedPR === pr.number ? "text-foreground bg-accent/35" : "text-muted-foreground/80 hover:text-foreground hover:bg-accent/20"
                        }`}
                      type="button"
                    >
                      <span className="truncate">#{pr.number} {pr.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {prDetail && (
          <div className="pr-subtitle">
            <img src={prDetail.authorAvatar} alt="" className="pr-author-avatar" />
            <span>
              <strong>{prDetail.author}</strong> wants to merge{" "}
              <strong>{prDetail.commits}</strong> commit{prDetail.commits !== 1 ? "s" : ""} into{" "}
              <code className="pr-branch">{prDetail.baseBranch}</code> from{" "}
              <code className="pr-branch">{prDetail.headBranch}</code>
            </span>
          </div>
        )}
      </div>

      {/* Tabs with stats */}
      <div className="pr-tabs">
        <button
          onClick={() => setActiveTab("conversation")}
          className={`pr-tab ${activeTab === "conversation" ? "active" : ""}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Conversation
          {comments.length > 0 && <span className="pr-tab-count">{comments.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab("commits")}
          className={`pr-tab ${activeTab === "commits" ? "active" : ""}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" />
          </svg>
          Commits
          {prCommits.length > 0 && <span className="pr-tab-count">{prCommits.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab("checks")}
          className={`pr-tab ${activeTab === "checks" ? "active" : ""}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042l2 2a.75.75 0 0 0 1.06 0Z" />
          </svg>
          Checks
          {totalChecks > 0 && <span className="pr-tab-count">{totalChecks}</span>}
        </button>
        <button
          onClick={() => setActiveTab("files")}
          className={`pr-tab ${activeTab === "files" ? "active" : ""}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 1.75C1 .784 1.784 0 2.75 0h7.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-1.5a.75.75 0 0 1 0-1.5h1.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177l-2.914-2.914a.25.25 0 0 0-.177-.073H2.75a.25.25 0 0 0-.25.25v6.5a.75.75 0 0 1-1.5 0Z" />
          </svg>
          Files changed
          {prFiles.length > 0 && (
            <span className="pr-tab-count">
              {prFiles.length}
            </span>
          )}
        </button>

        {/* Stats inline with tabs */}
        {prDetail && (
          <div className="pr-tab-stats">
            <span className="text-success">+{prDetail.additions}</span>
            <span className="text-error">-{prDetail.deletions}</span>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="pr-content">
        {activeTab === "conversation" && (
          <ConversationTab
            prDetail={prDetail}
            comments={comments}
            loading={loading.comments || loading.detail}
            onPostComment={postComment}
          />
        )}
        {activeTab === "commits" && (
          <CommitsTab commits={prCommits} loading={loading.commits} />
        )}
        {activeTab === "checks" && (
          <ChecksTab checksData={checksData} loading={loading.checks} />
        )}
        {activeTab === "files" && (
          <FilesTab
            files={prFiles}
            loading={loading.files}
            expandedFiles={expandedFiles}
            onToggleFile={toggleFile}
            headSha={prDetail?.headSha || ""}
            onPostComment={postComment}
          />
        )}
      </div>
    </div>
  );
}

function PRStateIcon({ state }: { state: string }) {
  if (state === "merged") {
    return (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8-9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
      </svg>
    );
  }
  if (state === "closed") {
    return (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3.25 1A2.25 2.25 0 0 1 4 5.372v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 3.25 1Zm9.5 5.5a.75.75 0 0 1 .75.75v3.378a2.251 2.251 0 1 1-1.5 0V7.25a.75.75 0 0 1 .75-.75Zm-2.03-5.273a.75.75 0 0 1 1.06 0l.97.97.97-.97a.748.748 0 0 1 1.265.332.75.75 0 0 1-.205.729l-.97.97.97.97a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018l-.97-.97-.97.97a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l.97-.97-.97-.97a.75.75 0 0 1 0-1.06Z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
    </svg>
  );
}

/* ============ Conversation Tab ============ */
function ConversationTab({
  prDetail,
  comments,
  loading,
  onPostComment,
}: {
  prDetail: PRDetail | null;
  comments: PRComment[];
  loading: boolean;
  onPostComment: (body: string) => void;
}) {
  const [newComment, setNewComment] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (newComment.trim()) {
      onPostComment(newComment);
      setNewComment("");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="pr-skeleton" style={{ height: i === 0 ? 120 : 80 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="pr-conversation">
      {/* PR Body */}
      {prDetail?.body && (
        <div className="pr-comment-card">
          <div className="pr-comment-card-header">
            <img src={prDetail.authorAvatar} alt="" className="pr-avatar" />
            <strong>{prDetail.author}</strong>
            <span className="text-muted-foreground">opened {formatTime(prDetail.createdAt)}</span>
          </div>
          <div className="pr-comment-card-body">
            <p className="whitespace-pre-wrap">{prDetail.body}</p>
          </div>
        </div>
      )}

      {/* Comments */}
      {comments.map((comment) => (
        <div key={`${comment.type}-${comment.id}`} className="pr-comment-card">
          {comment.type === "review" && comment.path && (
            <div className="pr-review-context">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-mono text-xs">{comment.path}</span>
              {comment.line && <span className="text-muted-foreground">line {comment.line}</span>}
            </div>
          )}
          {comment.type === "review" && comment.diffHunk && (
            <div className="pr-review-diff-hunk">
              {comment.diffHunk.split("\n").slice(-4).map((line, i) => (
                <div key={i} className={`pr-hunk-line ${line.startsWith("+") ? "addition" : line.startsWith("-") ? "deletion" : ""}`}>
                  {line}
                </div>
              ))}
            </div>
          )}
          <div className="pr-comment-card-header">
            <img src={comment.authorAvatar} alt="" className="pr-avatar" />
            <strong>{comment.author}</strong>
            <span className="text-muted-foreground">{formatTime(comment.createdAt)}</span>
          </div>
          <div className="pr-comment-card-body">
            <p className="whitespace-pre-wrap">{comment.body}</p>
          </div>
        </div>
      ))}

      {/* New comment form */}
      <div className="pr-new-comment">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Leave a comment..."
          className="pr-textarea"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="pr-btn-primary"
          >
            Comment
          </button>
        </div>
      </div>
      <div ref={bottomRef} />
    </div>
  );
}

/* ============ Commits Tab ============ */
function CommitsTab({ commits, loading }: { commits: PRCommit[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="pr-skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="pr-commits-list">
      {commits.map((commit, idx) => (
        <div key={commit.sha} className="pr-commit-row">
          <div className="pr-commit-timeline-col">
            <div className="pr-commit-dot" />
            {idx < commits.length - 1 && <div className="pr-commit-line" />}
          </div>
          <img src={commit.authorAvatar} alt="" className="pr-avatar" />
          <div className="pr-commit-info">
            <p className="pr-commit-msg">{commit.message.split("\n")[0]}</p>
            <div className="pr-commit-meta">
              <strong>{commit.author}</strong>
              <span>{formatTime(commit.date)}</span>
              <a href={commit.url} target="_blank" rel="noopener noreferrer" className="pr-sha">
                {commit.shortSha}
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============ Checks Tab ============ */
function ChecksTab({ checksData, loading }: { checksData: ChecksData | null; loading: boolean }) {
  if (loading || !checksData) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="pr-skeleton" />
        ))}
      </div>
    );
  }

  const passed = checksData.checks.filter((c) => c.conclusion === "success").length +
    checksData.statuses.filter((s) => s.state === "success").length;
  const failed = checksData.checks.filter((c) => c.conclusion === "failure").length +
    checksData.statuses.filter((s) => s.state === "failure" || s.state === "error").length;
  const pending = checksData.checks.filter((c) => !c.conclusion).length +
    checksData.statuses.filter((s) => s.state === "pending").length;

  return (
    <div>
      {/* Merge status */}
      <div className={`pr-merge-status ${checksData.mergeable ? "mergeable" : checksData.mergeable === false ? "blocked" : "unknown"}`}>
        <div className="flex items-center gap-3">
          {checksData.mergeable ? (
            <svg className="w-6 h-6 text-success" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042l2 2a.75.75 0 0 0 1.06 0Z" />
            </svg>
          ) : checksData.mergeable === false ? (
            <svg className="w-6 h-6 text-error" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.343 13.657A8 8 0 1 1 13.658 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042L6.94 8 4.97 9.97a.749.749 0 0 0 .326 1.275.749.749 0 0 0 .734-.217L8 9.06l1.97 1.97a.749.749 0 0 0 1.275-.326.749.749 0 0 0-.215-.734L9.06 8l1.97-1.97a.749.749 0 0 0-.326-1.275.749.749 0 0 0-.734.217L8 6.94Z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-warning" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
            </svg>
          )}
          <div>
            <p className="font-semibold text-foreground">
              {checksData.mergeable
                ? "This branch has no conflicts with the base branch"
                : checksData.mergeable === false
                  ? "This branch has conflicts that must be resolved"
                  : "Mergeability is being determined..."}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {passed} passed{failed > 0 ? `, ${failed} failed` : ""}{pending > 0 ? `, ${pending} pending` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Check runs */}
      <div className="pr-checks-list">
        {checksData.checks.map((check) => (
          <div key={check.id} className="pr-check-row">
            <CheckIcon conclusion={check.conclusion} status={check.status} />
            <div className="pr-check-info">
              <span className="pr-check-name">{check.name}</span>
              <span className="pr-check-app">{check.app}</span>
            </div>
            {check.url && (
              <a href={check.url} target="_blank" rel="noopener noreferrer" className="pr-check-details">
                Details
              </a>
            )}
          </div>
        ))}
        {checksData.statuses.map((status, i) => (
          <div key={i} className="pr-check-row">
            <StatusIcon state={status.state} />
            <div className="pr-check-info">
              <span className="pr-check-name">{status.context}</span>
              {status.description && (
                <span className="pr-check-app">{status.description}</span>
              )}
            </div>
            {status.targetUrl && (
              <a href={status.targetUrl} target="_blank" rel="noopener noreferrer" className="pr-check-details">
                Details
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckIcon({ conclusion, status }: { conclusion: string | null; status: string }) {
  if (status === "in_progress" || status === "queued") {
    return <div className="pr-check-icon pending" />;
  }
  if (conclusion === "success") {
    return (
      <svg className="w-4 h-4 text-success flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
      </svg>
    );
  }
  if (conclusion === "failure") {
    return (
      <svg className="w-4 h-4 text-error flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
      </svg>
    );
  }
  return <div className="pr-check-icon neutral" />;
}

function StatusIcon({ state }: { state: string }) {
  if (state === "success") return <CheckIcon conclusion="success" status="completed" />;
  if (state === "failure" || state === "error") return <CheckIcon conclusion="failure" status="completed" />;
  return <div className="pr-check-icon pending" />;
}

/* ============ Files Tab ============ */
function FilesTab({
  files,
  loading,
  expandedFiles,
  onToggleFile,
  headSha,
  onPostComment,
}: {
  files: PRFile[];
  loading: boolean;
  expandedFiles: Set<string>;
  onToggleFile: (filename: string) => void;
  headSha: string;
  onPostComment: (body: string, path?: string, line?: number) => void;
}) {
  const totalAdded = files.reduce((s, f) => s + f.additions, 0);
  const totalDeleted = files.reduce((s, f) => s + f.deletions, 0);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="pr-skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="pr-files-summary">
        Showing <strong>{files.length}</strong> changed file{files.length !== 1 ? "s" : ""} with{" "}
        <span className="text-success">{totalAdded} additions</span> and{" "}
        <span className="text-error">{totalDeleted} deletions</span>
      </div>

      <div className="pr-files-list">
        {files.map((file) => (
          <div key={file.filename} className="pr-file-block">
            <div className="pr-file-header" onClick={() => onToggleFile(file.filename)}>
              <div className="flex items-center gap-2 min-w-0">
                <svg
                  className={`w-3.5 h-3.5 flex-shrink-0 text-muted-foreground transition-transform ${expandedFiles.has(file.filename) ? "rotate-90" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <FileStatusBadge status={file.status} />
                <span className="font-mono text-xs text-foreground truncate">{file.filename}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono flex-shrink-0">
                <span className="text-success">+{file.additions}</span>
                <span className="text-error">-{file.deletions}</span>
              </div>
            </div>
            {expandedFiles.has(file.filename) && file.patch && (
              <DiffView
                patch={file.patch}
                filename={file.filename}
                onComment={(line, body) => onPostComment(body, file.filename, line)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FileStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; label: string }> = {
    added: { bg: "bg-success/10 text-success", label: "A" },
    modified: { bg: "bg-warning/10 text-warning", label: "M" },
    removed: { bg: "bg-error/10 text-error", label: "D" },
    renamed: { bg: "bg-info/10 text-info", label: "R" },
  };
  const style = map[status] || { bg: "bg-muted text-muted-foreground", label: status?.[0]?.toUpperCase() || "?" };

  return (
    <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${style.bg}`}>
      {style.label}
    </span>
  );
}

function DiffView({
  patch,
  filename,
  onComment,
}: {
  patch: string;
  filename: string;
  onComment: (line: number, body: string) => void;
}) {
  const [commentingLine, setCommentingLine] = useState<number | null>(null);
  const [lineComment, setLineComment] = useState("");
  const lines = patch.split("\n");

  const submitComment = (lineNum: number) => {
    if (lineComment.trim()) {
      onComment(lineNum, lineComment);
      setLineComment("");
      setCommentingLine(null);
    }
  };

  return (
    <div className="pr-diff">
      {lines.map((line, idx) => {
        const lineNum = idx + 1;
        const isAdd = line.startsWith("+") && !line.startsWith("+++");
        const isDel = line.startsWith("-") && !line.startsWith("---");
        const isHdr = line.startsWith("@@");

        return (
          <div key={idx}>
            <div className={`pr-diff-line ${isAdd ? "addition" : ""} ${isDel ? "deletion" : ""} ${isHdr ? "header" : ""}`}>
              <span className="pr-diff-num">{lineNum}</span>
              <span className="pr-diff-prefix">{isAdd ? "+" : isDel ? "-" : " "}</span>
              <span className="pr-diff-text">{line.slice(1) || " "}</span>
              <button
                className="pr-diff-comment-btn"
                onClick={() => setCommentingLine(commentingLine === lineNum ? null : lineNum)}
                title="Add review comment"
              >
                +
              </button>
            </div>
            {commentingLine === lineNum && (
              <div className="pr-inline-comment-form">
                <textarea
                  value={lineComment}
                  onChange={(e) => setLineComment(e.target.value)}
                  placeholder={`Comment on ${filename}:${lineNum}...`}
                  className="pr-textarea"
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => submitComment(lineNum)} disabled={!lineComment.trim()} className="pr-btn-primary text-xs">
                    Add review comment
                  </button>
                  <button onClick={() => { setCommentingLine(null); setLineComment(""); }} className="pr-btn-secondary text-xs">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
