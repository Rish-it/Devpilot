import { z } from "zod";
import {
  commitSchema,
  pullRequestSchema,
  workflowRunSchema,
  commitDetailSchema,
  repoInfoSchema,
} from "./schemas";

// Tool definitions for Tambo - these call our Next.js API routes
// which proxy to GitHub via Octokit server-side

export const listRecentCommitsTool = {
  name: "list_recent_commits",
  description:
    "List recent commits for a GitHub repository. Returns commit messages, SHAs, authors, dates, and URLs. Use this for standup summaries, bug scanning, and activity reports.",
  tool: async ({
    owner,
    repo,
    since,
    until,
    perPage,
  }: {
    owner: string;
    repo: string;
    since: string;
    until?: string;
    perPage?: number;
  }) => {
    const params = new URLSearchParams({ owner, repo, since });
    if (until) params.set("until", until);
    if (perPage) params.set("per_page", String(perPage));
    const res = await fetch(`/api/github/commits?${params}`);
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    return res.json();
  },
  inputSchema: z.object({
    owner: z.string().describe("Repository owner"),
    repo: z.string().describe("Repository name"),
    since: z.string().describe("ISO date string - only commits after this date"),
    until: z
      .string()
      .optional()
      .describe("ISO date string - only commits before this date"),
    perPage: z
      .number()
      .optional()
      .describe("Number of commits to return (default 30, max 100)"),
  }),
  outputSchema: z.array(commitSchema),
};

export const listPullRequestsTool = {
  name: "list_pull_requests",
  description:
    "List pull requests for a GitHub repository. Can filter by state (open, closed, all) and date. Returns PR titles, numbers, authors, labels, merge status, and URLs. Use for release notes, weekly updates, and activity summaries.",
  tool: async ({
    owner,
    repo,
    state,
    since,
    perPage,
  }: {
    owner: string;
    repo: string;
    state?: string;
    since?: string;
    perPage?: number;
  }) => {
    const params = new URLSearchParams({ owner, repo });
    if (state) params.set("state", state);
    if (since) params.set("since", since);
    if (perPage) params.set("per_page", String(perPage));
    const res = await fetch(`/api/github/pulls?${params}`);
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    return res.json();
  },
  inputSchema: z.object({
    owner: z.string().describe("Repository owner"),
    repo: z.string().describe("Repository name"),
    state: z
      .enum(["open", "closed", "all"])
      .optional()
      .describe("PR state filter (default: all)"),
    since: z
      .string()
      .optional()
      .describe("ISO date - only PRs updated after this date"),
    perPage: z
      .number()
      .optional()
      .describe("Number of PRs to return (default 30)"),
  }),
  outputSchema: z.array(pullRequestSchema),
};

export const getWorkflowRunsTool = {
  name: "get_workflow_runs",
  description:
    "Get recent GitHub Actions workflow runs for a repository. Returns run status, conclusion, workflow name, and timing. Use for CI failure analysis and health reports.",
  tool: async ({
    owner,
    repo,
    status,
    perPage,
  }: {
    owner: string;
    repo: string;
    status?: string;
    perPage?: number;
  }) => {
    const params = new URLSearchParams({ owner, repo });
    if (status) params.set("status", status);
    if (perPage) params.set("per_page", String(perPage));
    const res = await fetch(`/api/github/actions?${params}`);
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    return res.json();
  },
  inputSchema: z.object({
    owner: z.string().describe("Repository owner"),
    repo: z.string().describe("Repository name"),
    status: z
      .enum(["completed", "failure", "success", "cancelled"])
      .optional()
      .describe("Filter by run conclusion"),
    perPage: z
      .number()
      .optional()
      .describe("Number of runs to return"),
  }),
  outputSchema: z.array(workflowRunSchema),
};

export const getCommitDetailsTool = {
  name: "get_commit_details",
  description:
    "Get detailed information about a specific commit including the diff/patch. Use for bug scanning to analyze code changes.",
  tool: async ({
    owner,
    repo,
    sha,
  }: {
    owner: string;
    repo: string;
    sha: string;
  }) => {
    const params = new URLSearchParams({ owner, repo });
    const res = await fetch(`/api/github/commits/${sha}?${params}`);
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    return res.json();
  },
  inputSchema: z.object({
    owner: z.string().describe("Repository owner"),
    repo: z.string().describe("Repository name"),
    sha: z.string().describe("Full or short commit SHA"),
  }),
  outputSchema: commitDetailSchema,
};

export const getRepoInfoTool = {
  name: "get_repo_info",
  description:
    "Get basic information about a GitHub repository including description, language, stars, and default branch. Useful for providing context in reports.",
  tool: async ({ owner, repo }: { owner: string; repo: string }) => {
    const params = new URLSearchParams({ owner, repo });
    const res = await fetch(`/api/github/repo?${params}`);
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    return res.json();
  },
  inputSchema: z.object({
    owner: z.string().describe("Repository owner"),
    repo: z.string().describe("Repository name"),
  }),
  outputSchema: repoInfoSchema,
};

export const allTools = [
  listRecentCommitsTool,
  listPullRequestsTool,
  getWorkflowRunsTool,
  getCommitDetailsTool,
  getRepoInfoTool,
];
