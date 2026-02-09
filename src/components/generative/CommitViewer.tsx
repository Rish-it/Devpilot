"use client";

import { useState } from "react";

interface Commit {
    sha: string;
    message: string;
    author: string;
    authorAvatar?: string;
    date: string;
    url: string;
    additions?: number;
    deletions?: number;
    filesChanged?: number;
    files?: FileChange[];
}

interface FileChange {
    filename: string;
    status: "added" | "modified" | "deleted" | "renamed";
    additions: number;
    deletions: number;
    patch?: string;
}

interface Comment {
    id: string;
    author: string;
    authorAvatar?: string;
    content: string;
    createdAt: string;
    lineNumber?: number;
    filename?: string;
}

interface CommitViewerProps {
    repoName: string;
    commits: Commit[];
    comments?: Comment[];
}

export function CommitViewer({ repoName = "", commits = [], comments = [] }: CommitViewerProps) {
    const safeCommits = Array.isArray(commits) ? commits : [];
    const safeComments = Array.isArray(comments) ? comments : [];
    const [activeTab, setActiveTab] = useState<"conversation" | "commits" | "files">("commits");
    const [selectedCommit, setSelectedCommit] = useState<Commit | null>(safeCommits[0] || null);
    const [localComments, setLocalComments] = useState<Comment[]>(safeComments);
    const [newComment, setNewComment] = useState("");
    const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

    const addComment = (content: string, lineNumber?: number, filename?: string) => {
        if (!content.trim()) return;
        const comment: Comment = {
            id: Date.now().toString(),
            author: "You",
            content: content.trim(),
            createdAt: new Date().toISOString(),
            lineNumber,
            filename,
        };
        setLocalComments([...localComments, comment]);
        setNewComment("");
    };

    const toggleFile = (filename: string) => {
        const next = new Set(expandedFiles);
        if (next.has(filename)) next.delete(filename);
        else next.add(filename);
        setExpandedFiles(next);
    };

    const totalAdditions = safeCommits.reduce((sum, c) => sum + (c.additions || 0), 0);
    const totalDeletions = safeCommits.reduce((sum, c) => sum + (c.deletions || 0), 0);
    const totalFiles = safeCommits.reduce((sum, c) => sum + (c.filesChanged || c.files?.length || 0), 0);

    return (
        <div className="github-viewer">
            {/* Header */}
            <div className="github-header">
                <div className="flex items-center gap-3">
                    <div className="github-avatar">
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5">
                            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">{repoName}</h2>
                        <p className="text-xs text-muted-foreground">
                            {safeCommits.length} commit{safeCommits.length !== 1 ? "s" : ""} •
                            <span className="text-success ml-1">+{totalAdditions}</span>
                            <span className="text-error ml-1">-{totalDeletions}</span>
                            <span className="ml-1">• {totalFiles} files</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="github-btn-success">
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Merge
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="github-tabs">
                <button
                    onClick={() => setActiveTab("conversation")}
                    className={`github-tab ${activeTab === "conversation" ? "active" : ""}`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Conversation
                    {localComments.length > 0 && (
                        <span className="github-tab-count">{localComments.length}</span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("commits")}
                    className={`github-tab ${activeTab === "commits" ? "active" : ""}`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Commits
                    <span className="github-tab-count">{safeCommits.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab("files")}
                    className={`github-tab ${activeTab === "files" ? "active" : ""}`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Files changed
                    <span className="github-tab-count">{totalFiles}</span>
                </button>
            </div>

            {/* Content */}
            <div className="github-content">
                {/* Conversation Tab */}
                {activeTab === "conversation" && (
                    <div className="space-y-4">
                        {localComments.length === 0 ? (
                            <div className="github-empty-state">
                                <svg className="w-12 h-12 text-muted-foreground mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-sm text-muted-foreground">No comments yet. Start the conversation!</p>
                            </div>
                        ) : (
                            localComments.map((comment) => (
                                <div key={comment.id} className="github-comment">
                                    <div className="github-comment-avatar">
                                        {comment.authorAvatar ? (
                                            <img src={comment.authorAvatar} alt={comment.author} />
                                        ) : (
                                            <span>{(comment.author || "?")[0]?.toUpperCase() || "?"}</span>
                                        )}
                                    </div>
                                    <div className="github-comment-body">
                                        <div className="github-comment-header">
                                            <span className="font-semibold text-foreground">{comment.author}</span>
                                            <span className="text-muted-foreground">commented {formatRelativeTime(comment.createdAt)}</span>
                                        </div>
                                        <div className="github-comment-content">
                                            {comment.filename && (
                                                <div className="text-xs text-muted-foreground mb-2 font-mono">
                                                    {comment.filename}{comment.lineNumber ? `:${comment.lineNumber}` : ""}
                                                </div>
                                            )}
                                            <p>{comment.content}</p>
                                        </div>
                                        <div className="github-comment-actions">
                                            <button className="github-reaction">👍</button>
                                            <button className="github-reaction">👎</button>
                                            <button className="github-reaction">😄</button>
                                            <button className="github-reaction">❤️</button>
                                            <button className="github-reaction">🎉</button>
                                            <button className="github-reaction">🚀</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* New comment form */}
                        <div className="github-comment-form">
                            <div className="github-comment-avatar">
                                <span>Y</span>
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Leave a comment..."
                                    className="github-textarea"
                                    rows={3}
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={() => addComment(newComment)}
                                        disabled={!newComment.trim()}
                                        className="github-btn-primary"
                                    >
                                        Comment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Commits Tab */}
                {activeTab === "commits" && (
                    <div className="github-commits-list">
                        {safeCommits.map((commit, idx) => (
                            <div
                                key={commit.sha}
                                className={`github-commit-row ${selectedCommit?.sha === commit.sha ? "selected" : ""}`}
                                onClick={() => setSelectedCommit(commit)}
                            >
                                <div className="github-commit-timeline">
                                    <div className="github-commit-dot" />
                                    {idx < safeCommits.length - 1 && <div className="github-commit-line" />}
                                </div>
                                <div className="github-commit-avatar">
                                    {commit.authorAvatar ? (
                                        <img src={commit.authorAvatar} alt={commit.author} />
                                    ) : (
                                        <span>{(commit.author || "?")[0]?.toUpperCase() || "?"}</span>
                                    )}
                                </div>
                                <div className="github-commit-content">
                                    <p className="github-commit-message">{commit.message}</p>
                                    <div className="github-commit-meta">
                                        <span className="font-semibold">{commit.author}</span>
                                        <span>committed {formatRelativeTime(commit.date)}</span>
                                        <a
                                            href={commit.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="github-sha"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {commit.sha.slice(0, 7)}
                                        </a>
                                    </div>
                                </div>
                                <div className="github-commit-stats">
                                    {commit.additions !== undefined && (
                                        <span className="text-success">+{commit.additions}</span>
                                    )}
                                    {commit.deletions !== undefined && (
                                        <span className="text-error">-{commit.deletions}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Files Tab */}
                {activeTab === "files" && selectedCommit && (
                    <div className="github-files">
                        <div className="github-files-header">
                            <span className="text-sm text-muted-foreground">
                                Showing changes from commit{" "}
                                <span className="font-mono text-foreground">{selectedCommit.sha.slice(0, 7)}</span>
                            </span>
                        </div>
                        {selectedCommit.files?.map((file) => (
                            <div key={file.filename} className="github-file-block">
                                <div
                                    className="github-file-header"
                                    onClick={() => toggleFile(file.filename)}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg
                                            className={`w-4 h-4 transition-transform text-muted-foreground ${expandedFiles.has(file.filename) ? "rotate-90" : ""}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                        <FileStatusBadge status={file.status} />
                                        <span className="font-mono text-sm text-foreground">{file.filename}</span>
                                    </div>
                                    <div className="github-file-stats">
                                        <span className="text-success">+{file.additions}</span>
                                        <span className="text-error">-{file.deletions}</span>
                                    </div>
                                </div>
                                {expandedFiles.has(file.filename) && file.patch && (
                                    <div className="github-diff">
                                        <DiffView
                                            patch={file.patch}
                                            onAddComment={(line, content) => addComment(content, line, file.filename)}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                        {(!selectedCommit.files || selectedCommit.files.length === 0) && (
                            <div className="github-empty-state">
                                <p className="text-sm text-muted-foreground">No file changes available for this commit.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
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
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${styles[status] || "bg-muted text-muted-foreground"}`}>
            {status}
        </span>
    );
}

function DiffView({
    patch,
    onAddComment,
}: {
    patch: string;
    onAddComment: (line: number, content: string) => void;
}) {
    const [commentingLine, setCommentingLine] = useState<number | null>(null);
    const [lineComment, setLineComment] = useState("");

    const lines = patch.split("\n");

    const submitLineComment = (lineNum: number) => {
        if (lineComment.trim()) {
            onAddComment(lineNum, lineComment);
            setLineComment("");
            setCommentingLine(null);
        }
    };

    return (
        <div className="github-diff-content">
            {lines.map((line, idx) => {
                const lineNum = idx + 1;
                const isAddition = line.startsWith("+") && !line.startsWith("+++");
                const isDeletion = line.startsWith("-") && !line.startsWith("---");
                const isHeader = line.startsWith("@@");

                return (
                    <div key={idx}>
                        <div
                            className={`github-diff-line ${isAddition ? "addition" : ""} ${isDeletion ? "deletion" : ""} ${isHeader ? "header" : ""}`}
                        >
                            <span className="github-diff-line-number">{lineNum}</span>
                            <span className="github-diff-line-prefix">
                                {isAddition ? "+" : isDeletion ? "-" : " "}
                            </span>
                            <span className="github-diff-line-content">{line.slice(1) || " "}</span>
                            <button
                                className="github-diff-comment-btn"
                                onClick={() => setCommentingLine(commentingLine === lineNum ? null : lineNum)}
                                title="Add comment"
                            >
                                +
                            </button>
                        </div>
                        {commentingLine === lineNum && (
                            <div className="github-inline-comment">
                                <textarea
                                    value={lineComment}
                                    onChange={(e) => setLineComment(e.target.value)}
                                    placeholder={`Comment on line ${lineNum}...`}
                                    className="github-textarea"
                                    rows={2}
                                    autoFocus
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => submitLineComment(lineNum)}
                                        disabled={!lineComment.trim()}
                                        className="github-btn-primary text-xs"
                                    >
                                        Add Comment
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCommentingLine(null);
                                            setLineComment("");
                                        }}
                                        className="github-btn-secondary text-xs"
                                    >
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

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
}
