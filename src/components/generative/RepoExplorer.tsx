"use client";

import { useState, useEffect, useCallback } from "react";

interface RepoExplorerProps {
  owner: string;
  repo: string;
  conversationMessages?: ConversationMessage[];
  renderedComponent?: React.ReactNode;
  isGenerating?: boolean;
  generationStage?: string;
}

interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface CommitData {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
  filesChanged?: number;
}

interface CommitDetail {
  sha: string;
  message: string;
  author: string;
  date: string;
  files: FileChange[];
}

interface FileChange {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
}

interface WorkflowRun {
  id: number;
  workflowName: string;
  status: string;
  conclusion: string | null;
  createdAt: string;
  url: string;
  headBranch: string;
  headSha: string;
}

type TabId = "conversation" | "commits" | "checks" | "files";

export function RepoExplorer({
  owner,
  repo,
  conversationMessages = [],
  renderedComponent,
  isGenerating = false,
  generationStage = "",
}: RepoExplorerProps) {
  const [activeTab, setActiveTab] = useState<TabId>("commits");
  const [commits, setCommits] = useState<CommitData[]>([]);
  const [checks, setChecks] = useState<WorkflowRun[]>([]);
  const [filesData, setFilesData] = useState<{ commit: string; files: FileChange[] }[]>([]);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState({ commits: true, checks: true, files: false });
  const [selectedCommitSha, setSelectedCommitSha] = useState<string | null>(null);

  const repoFullName = `${owner}/${repo}`;

  // Fetch commits
  useEffect(() => {
    if (!owner || !repo) return;
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    fetch(`/api/github/commits?owner=${owner}&repo=${repo}&since=${since}&per_page=10`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCommits(data);
        setLoading((p) => ({ ...p, commits: false }));
      })
      .catch(() => setLoading((p) => ({ ...p, commits: false })));
  }, [owner, repo]);

  // Fetch checks
  useEffect(() => {
    if (!owner || !repo) return;
    fetch(`/api/github/actions?owner=${owner}&repo=${repo}&per_page=15`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setChecks(data);
        setLoading((p) => ({ ...p, checks: false }));
      })
      .catch(() => setLoading((p) => ({ ...p, checks: false })));
  }, [owner, repo]);

  // Fetch file changes for a specific commit
  const fetchCommitFiles = useCallback(
    async (sha: string) => {
      if (filesData.some((f) => f.commit === sha)) return;
      setLoading((p) => ({ ...p, files: true }));
      try {
        const res = await fetch(`/api/github/commits/${sha}?owner=${owner}&repo=${repo}`);
        const data: CommitDetail = await res.json();
        if (data.files) {
          setFilesData((prev) => [...prev, { commit: sha, files: data.files }]);
        }
      } catch {
        // silently fail
      }
      setLoading((p) => ({ ...p, files: false }));
    },
    [owner, repo, filesData]
  );

  // When switching to files tab, load files for first commit
  useEffect(() => {
    if (activeTab === "files" && commits.length > 0 && !selectedCommitSha) {
      const firstSha = commits[0].sha;
      setSelectedCommitSha(firstSha);
      fetchCommitFiles(firstSha);
    }
  }, [activeTab, commits, selectedCommitSha, fetchCommitFiles]);

  const handleCommitSelect = (sha: string) => {
    setSelectedCommitSha(sha);
    fetchCommitFiles(sha);
    setActiveTab("files");
  };

  const toggleFile = (filename: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      return next;
    });
  };

  const selectedFiles = filesData.find((f) => f.commit === selectedCommitSha)?.files || [];

  const passedChecks = checks.filter((c) => c.conclusion === "success").length;
  const failedChecks = checks.filter((c) => c.conclusion === "failure").length;

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "conversation", label: "Conversation", count: conversationMessages.length },
    { id: "commits", label: "Commits", count: commits.length },
    { id: "checks", label: "Checks", count: checks.length },
    { id: "files", label: "Files changed", count: selectedFiles.length },
  ];

  return (
    <div className="explorer">
      {/* Header */}
      <div className="explorer-header">
        <div className="flex items-center gap-3">
          <div className="explorer-repo-icon">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5">
              <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{repoFullName}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              {commits.length > 0 && (
                <span className="landing-card-badge" style={{ marginBottom: 0 }}>
                  {commits.length} commits
                </span>
              )}
              {checks.length > 0 && (
                <span className="landing-card-badge" style={{ marginBottom: 0 }}>
                  {passedChecks} passed
                </span>
              )}
              {failedChecks > 0 && (
                <span className="landing-card-badge" style={{ marginBottom: 0, background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                  {failedChecks} failed
                </span>
              )}
            </div>
          </div>
        </div>
        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>{generationStage === "STREAMING_RESPONSE" ? "Generating..." : "Analyzing..."}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="explorer-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`explorer-tab ${activeTab === tab.id ? "active" : ""}`}
          >
            <TabIcon id={tab.id} />
            {tab.label}
            {tab.count > 0 && <span className="explorer-tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="explorer-content">
        {activeTab === "conversation" && (
          <ConversationTab
            messages={conversationMessages}
            renderedComponent={renderedComponent}
            isGenerating={isGenerating}
          />
        )}
        {activeTab === "commits" && (
          <CommitsTab
            commits={commits}
            loading={loading.commits}
            selectedSha={selectedCommitSha}
            onSelect={handleCommitSelect}
          />
        )}
        {activeTab === "checks" && (
          <ChecksTab
            checks={checks}
            loading={loading.checks}
            passed={passedChecks}
            failed={failedChecks}
          />
        )}
        {activeTab === "files" && (
          <FilesTab
            files={selectedFiles}
            commitSha={selectedCommitSha}
            loading={loading.files}
            expandedFiles={expandedFiles}
            onToggleFile={toggleFile}
            commits={commits}
            onCommitSelect={(sha) => {
              setSelectedCommitSha(sha);
              fetchCommitFiles(sha);
            }}
          />
        )}
      </div>
    </div>
  );
}

function TabIcon({ id }: { id: TabId }) {
  switch (id) {
    case "conversation":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "commits":
      return (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" />
        </svg>
      );
    case "checks":
      return (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042l2 2a.75.75 0 0 0 1.06 0Z" />
        </svg>
      );
    case "files":
      return (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1 1.75C1 .784 1.784 0 2.75 0h7.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-1.5a.75.75 0 0 1 0-1.5h1.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177l-2.914-2.914a.25.25 0 0 0-.177-.073H2.75a.25.25 0 0 0-.25.25v6.5a.75.75 0 0 1-1.5 0Zm.5 8.5a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5Z" />
        </svg>
      );
  }
}

// Conversation Tab
function ConversationTab({
  messages,
  renderedComponent,
  isGenerating,
}: {
  messages: ConversationMessage[];
  renderedComponent?: React.ReactNode;
  isGenerating: boolean;
}) {
  if (messages.length === 0 && !renderedComponent && !isGenerating) {
    return (
      <div className="explorer-empty">
        <svg className="w-12 h-12 text-muted-foreground mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-sm text-muted-foreground">Start a conversation to see AI analysis here</p>
        <p className="text-xs text-muted-foreground mt-1">Ask about commits, bugs, CI status, or anything about this repo</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className={`explorer-msg ${msg.role}`}>
          <div className="explorer-msg-avatar">
            {msg.role === "user" ? "Y" : "AI"}
          </div>
          <div className="explorer-msg-body">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
          </div>
        </div>
      ))}
      {renderedComponent && (
        <div className="explorer-rendered animate-fadeIn">
          {renderedComponent}
        </div>
      )}
      {isGenerating && !renderedComponent && (
        <div className="explorer-msg assistant">
          <div className="explorer-msg-avatar">AI</div>
          <div className="explorer-msg-body">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-muted-foreground">Analyzing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Commits Tab
function CommitsTab({
  commits,
  loading,
  selectedSha,
  onSelect,
}: {
  commits: CommitData[];
  loading: boolean;
  selectedSha: string | null;
  onSelect: (sha: string) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="explorer-skeleton" />
        ))}
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="explorer-empty">
        <p className="text-sm text-muted-foreground">No commits found</p>
      </div>
    );
  }

  return (
    <div className="explorer-commits">
      {commits.map((commit, idx) => (
        <div
          key={commit.sha}
          className={`explorer-commit ${selectedSha === commit.sha ? "selected" : ""}`}
          onClick={() => onSelect(commit.sha)}
        >
          <div className="explorer-commit-timeline">
            <div className="explorer-commit-dot" />
            {idx < commits.length - 1 && <div className="explorer-commit-line" />}
          </div>
          <div className="explorer-commit-avatar">
            {(commit.author || "?")[0]?.toUpperCase()}
          </div>
          <div className="explorer-commit-body">
            <p className="explorer-commit-msg">{commit.message}</p>
            <div className="explorer-commit-meta">
              <span className="font-semibold text-foreground">{commit.author}</span>
              <span>committed {formatRelativeTime(commit.date)}</span>
              <a
                href={commit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-sha"
                onClick={(e) => e.stopPropagation()}
              >
                {commit.sha.slice(0, 7)}
              </a>
            </div>
          </div>
          {commit.filesChanged !== undefined && (
            <div className="explorer-commit-files-count">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {commit.filesChanged}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Checks Tab
function ChecksTab({
  checks,
  loading,
  passed,
  failed,
}: {
  checks: WorkflowRun[];
  loading: boolean;
  passed: number;
  failed: number;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="explorer-skeleton" />
        ))}
      </div>
    );
  }

  if (checks.length === 0) {
    return (
      <div className="explorer-empty">
        <p className="text-sm text-muted-foreground">No workflow runs found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="explorer-checks-summary">
        <div className="flex items-center gap-2">
          {failed === 0 ? (
            <svg className="w-5 h-5 text-success" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042l2 2a.75.75 0 0 0 1.06 0Z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-error" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.343 13.657A8 8 0 1 1 13.658 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042L6.94 8 4.97 9.97a.749.749 0 0 0 .326 1.275.749.749 0 0 0 .734-.217L8 9.06l1.97 1.97a.749.749 0 0 0 1.275-.326.749.749 0 0 0-.215-.734L9.06 8l1.97-1.97a.749.749 0 0 0-.326-1.275.749.749 0 0 0-.734.217L8 6.94Z" />
            </svg>
          )}
          <span className="text-sm font-medium text-foreground">
            {failed === 0 ? "All checks have passed" : `${failed} check${failed > 1 ? "s" : ""} failed`}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="text-success">{passed} passed</span>
          {failed > 0 && <span className="text-error">{failed} failed</span>}
        </div>
      </div>

      {/* Check list */}
      <div className="explorer-checks-list">
        {checks.map((check) => (
          <div key={check.id} className="explorer-check">
            <CheckStatusIcon conclusion={check.conclusion} status={check.status} />
            <div className="explorer-check-body">
              <span className="explorer-check-name">{check.workflowName}</span>
              <span className="explorer-check-meta">
                {check.headBranch} &middot; {check.headSha}
              </span>
            </div>
            <div className="explorer-check-time">
              {formatRelativeTime(check.createdAt)}
            </div>
            <a
              href={check.url}
              target="_blank"
              rel="noopener noreferrer"
              className="explorer-check-link"
            >
              Details
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckStatusIcon({ conclusion, status }: { conclusion: string | null; status: string }) {
  if (status === "in_progress" || status === "queued") {
    return (
      <svg className="w-4 h-4 text-warning animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    );
  }
  if (conclusion === "success") {
    return (
      <svg className="w-4 h-4 text-success" viewBox="0 0 16 16" fill="currentColor">
        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
      </svg>
    );
  }
  if (conclusion === "failure") {
    return (
      <svg className="w-4 h-4 text-error" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
    </svg>
  );
}

// Files Changed Tab
function FilesTab({
  files,
  commitSha,
  loading,
  expandedFiles,
  onToggleFile,
  commits,
  onCommitSelect,
}: {
  files: FileChange[];
  commitSha: string | null;
  loading: boolean;
  expandedFiles: Set<string>;
  onToggleFile: (filename: string) => void;
  commits: CommitData[];
  onCommitSelect: (sha: string) => void;
}) {
  const totalAdditions = files.reduce((s, f) => s + f.additions, 0);
  const totalDeletions = files.reduce((s, f) => s + f.deletions, 0);

  return (
    <div>
      {/* Commit selector */}
      {commits.length > 0 && (
        <div className="explorer-files-selector">
          <label className="text-xs text-muted-foreground">Showing changes for:</label>
          <select
            value={commitSha || ""}
            onChange={(e) => onCommitSelect(e.target.value)}
            className="explorer-select"
          >
            {commits.map((c) => (
              <option key={c.sha} value={c.sha}>
                {c.sha.slice(0, 7)} - {c.message.slice(0, 60)}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="space-y-3 p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="explorer-skeleton" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="explorer-empty">
          <p className="text-sm text-muted-foreground">Select a commit to view file changes</p>
        </div>
      ) : (
        <>
          {/* Stats bar */}
          <div className="explorer-files-stats">
            <span className="text-sm text-muted-foreground">
              Showing <strong className="text-foreground">{files.length}</strong> changed file{files.length !== 1 ? "s" : ""} with{" "}
              <span className="text-success">{totalAdditions} additions</span> and{" "}
              <span className="text-error">{totalDeletions} deletions</span>
            </span>
          </div>

          {/* File list */}
          <div className="explorer-files-list">
            {files.map((file) => (
              <div key={file.filename} className="explorer-file">
                <div
                  className="explorer-file-header"
                  onClick={() => onToggleFile(file.filename)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <svg
                      className={`w-3.5 h-3.5 flex-shrink-0 text-muted-foreground transition-transform ${expandedFiles.has(file.filename) ? "rotate-90" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
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
                  <DiffView patch={file.patch} />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FileStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    added: "bg-success/10 text-success",
    modified: "bg-warning/10 text-warning",
    deleted: "bg-error/10 text-error",
    renamed: "bg-info/10 text-info",
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase flex-shrink-0 ${styles[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function DiffView({ patch }: { patch: string }) {
  const lines = patch.split("\n");

  return (
    <div className="explorer-diff">
      {lines.map((line, idx) => {
        const isAddition = line.startsWith("+") && !line.startsWith("+++");
        const isDeletion = line.startsWith("-") && !line.startsWith("---");
        const isHeader = line.startsWith("@@");

        return (
          <div
            key={idx}
            className={`explorer-diff-line ${isAddition ? "addition" : ""} ${isDeletion ? "deletion" : ""} ${isHeader ? "header" : ""}`}
          >
            <span className="explorer-diff-num">{idx + 1}</span>
            <span className="explorer-diff-prefix">
              {isAddition ? "+" : isDeletion ? "-" : " "}
            </span>
            <span className="explorer-diff-text">{line.slice(1) || " "}</span>
          </div>
        );
      })}
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
