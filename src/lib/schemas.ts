import { z } from "zod";

// ============================================
// Generative Component Schemas
// ============================================

export const standupSummarySchema = z.object({
  repoName: z.string().optional().default("").describe("The repository name (owner/repo)"),
  date: z.string().optional().default("").describe("The date being summarized (YYYY-MM-DD)"),
  commitsSummary: z
    .array(
      z.object({
        sha: z.string().optional().default("").describe("Short commit SHA"),
        message: z.string().optional().default("").describe("Commit message (first line)"),
        author: z.string().optional().default("").describe("Commit author username"),
        url: z.string().optional().default("#").describe("Link to the commit on GitHub"),
      })
    )
    .optional()
    .default([])
    .describe("Key commits from the period"),
  prActivity: z
    .array(
      z.object({
        number: z.number().optional().default(0).describe("PR number"),
        title: z.string().optional().default("").describe("PR title"),
        status: z
          .string()
          .optional()
          .default("opened")
          .describe("What happened (e.g. opened, merged, closed, reviewed)"),
        author: z.string().optional().default("").describe("PR author"),
        url: z.string().optional().default("#").describe("Link to the PR"),
      })
    )
    .optional()
    .default([])
    .describe("PR activity summary"),
  highlights: z
    .array(z.string())
    .optional()
    .default([])
    .describe("3-5 bullet point highlights for standup"),
  blockers: z
    .array(z.string())
    .optional()
    .default([])
    .describe("Any identified blockers"),
});

export const releaseNotesSchema = z.object({
  repoName: z.string().optional().default("").describe("Repository name"),
  periodStart: z.string().optional().default("").describe("Start date of the period"),
  periodEnd: z.string().optional().default("").describe("End date of the period"),
  version: z.string().optional().default("").describe("Suggested version tag"),
  sections: z
    .array(
      z.object({
        category: z
          .string()
          .optional()
          .default("Other")
          .describe("Category of changes (e.g. Features, Bug Fixes, Improvements, Breaking Changes, Other)"),
        items: z
          .array(
            z.object({
              description: z
                .string()
                .optional()
                .default("")
                .describe("Human-readable description of the change"),
              prNumber: z.number().optional().default(0).describe("PR number"),
              prUrl: z.string().optional().default("#").describe("Link to the PR"),
              author: z.string().optional().default("").describe("PR author"),
            })
          )
          .optional()
          .default([])
          .describe("Individual changes in this category"),
      })
    )
    .optional()
    .default([])
    .describe("Categorized changes"),
  contributors: z
    .array(z.string())
    .optional()
    .default([])
    .describe("List of contributors in this release"),
  markdownOutput: z
    .string()
    .optional()
    .default("")
    .describe("Full release notes in markdown format for copy-paste"),
});

export const bugScanReportSchema = z.object({
  repoName: z.string().optional().default("").describe("Repository name"),
  scanPeriod: z.string().optional().default("").describe("How far back commits were scanned"),
  findings: z
    .array(
      z.object({
        severity: z
          .string()
          .optional()
          .default("low")
          .describe("Estimated severity (high, medium, or low)"),
        commitSha: z
          .string()
          .optional()
          .default("")
          .describe("The commit SHA that introduced the potential bug"),
        commitUrl: z.string().optional().default("#").describe("Link to the commit"),
        commitMessage: z.string().optional().default("").describe("Original commit message"),
        suspiciousPattern: z
          .string()
          .optional()
          .default("")
          .describe("What pattern looks risky"),
        suggestedFix: z.string().optional().default("").describe("Proposed minimal fix"),
        affectedFiles: z
          .array(z.string())
          .optional()
          .default([])
          .describe("Files likely affected"),
      })
    )
    .optional()
    .default([])
    .describe("Potential bugs found"),
  summary: z.string().optional().default("").describe("Executive summary of findings"),
  totalCommitsScanned: z
    .number()
    .optional()
    .default(0)
    .describe("How many commits were analyzed"),
});

export const ciReportSchema = z.object({
  repoName: z.string().optional().default("").describe("Repository name"),
  period: z.string().optional().default("").describe("Period analyzed"),
  failingSuites: z
    .array(
      z.object({
        workflowName: z.string().optional().default("").describe("CI workflow/action name"),
        failureCount: z
          .number()
          .optional()
          .default(0)
          .describe("Number of failures in period"),
        lastFailure: z
          .string()
          .optional()
          .default("")
          .describe("Date of most recent failure"),
        isFlaky: z
          .boolean()
          .optional()
          .default(false)
          .describe("Whether this appears to be a flaky test"),
        errorSummary: z.string().optional().default("").describe("Common error pattern"),
        suggestedFix: z.string().optional().default("").describe("Recommended action"),
        url: z.string().optional().default("#").describe("Link to the workflow run"),
      })
    )
    .optional()
    .default([])
    .describe("Failing CI workflows/tests"),
  overallHealthScore: z
    .number()
    .optional()
    .default(0)
    .describe("CI health score 0-100"),
  summary: z.string().optional().default("").describe("Executive summary"),
  recommendations: z
    .array(z.string())
    .optional()
    .default([])
    .describe("Top 3 recommendations"),
});

export const weeklyUpdateSchema = z.object({
  repoName: z.string().optional().default("").describe("Repository name"),
  weekOf: z.string().optional().default("").describe("Week start date"),
  tldr: z.string().optional().default("").describe("One-paragraph executive summary"),
  metrics: z
    .object({
      prsOpened: z.number().optional().default(0),
      prsMerged: z.number().optional().default(0),
      prsClosed: z.number().optional().default(0),
      commitsTotal: z.number().optional().default(0),
      contributorsActive: z.number().optional().default(0),
    })
    .optional()
    .default({
      prsOpened: 0,
      prsMerged: 0,
      prsClosed: 0,
      commitsTotal: 0,
      contributorsActive: 0,
    })
    .describe("Key metrics for the week"),
  keyChanges: z
    .array(
      z.object({
        title: z.string().optional().default("").describe("Change title"),
        description: z.string().optional().default("").describe("Brief description"),
        prUrl: z.string().optional().default("#").describe("Link to related PR"),
        impact: z
          .string()
          .optional()
          .default("medium")
          .describe("Impact level (high, medium, or low)"),
      })
    )
    .optional()
    .default([])
    .describe("Most significant changes"),
  risksAndIncidents: z
    .array(z.string())
    .optional()
    .default([])
    .describe("Any risks or incidents"),
  nextWeekOutlook: z
    .string()
    .optional()
    .default("")
    .describe("What to expect next week"),
});

export const commitViewerSchema = z.object({
  repoName: z.string().optional().default("").describe("Repository name (owner/repo)"),
  commits: z
    .array(
      z.object({
        sha: z.string().optional().default("").describe("Full commit SHA"),
        message: z.string().optional().default("").describe("Commit message"),
        author: z.string().optional().default("Unknown").describe("Author username"),
        authorAvatar: z.string().optional().describe("Author avatar URL"),
        date: z.string().optional().default(new Date().toISOString()).describe("Commit date ISO string"),
        url: z.string().optional().default("#").describe("Link to commit on GitHub"),
        additions: z.number().optional().default(0).describe("Lines added"),
        deletions: z.number().optional().default(0).describe("Lines deleted"),
        filesChanged: z.number().optional().describe("Number of files changed"),
        files: z
          .array(
            z.object({
              filename: z.string().optional().default("").describe("File path"),
              status: z.string().optional().default("modified").describe("Change type (added, modified, deleted, or renamed)"),
              additions: z.number().optional().default(0).describe("Lines added"),
              deletions: z.number().optional().default(0).describe("Lines deleted"),
              patch: z.string().optional().describe("Diff patch for this file"),
            })
          )
          .optional()
          .default([])
          .describe("Files changed in this commit"),
      })
    )
    .optional()
    .default([])
    .describe("List of commits to display"),
  comments: z
    .array(
      z.object({
        id: z.string().optional().default("").describe("Comment ID"),
        author: z.string().optional().default("").describe("Comment author"),
        authorAvatar: z.string().optional().describe("Author avatar URL"),
        content: z.string().optional().default("").describe("Comment text"),
        createdAt: z.string().optional().default(new Date().toISOString()).describe("Comment date ISO string"),
        lineNumber: z.number().optional().describe("Line number if inline comment"),
        filename: z.string().optional().describe("Filename if inline comment"),
      })
    )
    .optional()
    .default([])
    .describe("Existing comments on the commits"),
});

export const prReviewSchema = z.object({
  owner: z.string().optional().default("").describe("GitHub repository owner (e.g. 'tambo-ai')"),
  repo: z.string().optional().default("").describe("GitHub repository name (e.g. 'tambo')"),
});

// ============================================
// Interactable Component Schemas
// ============================================

export const automationCardPropsSchema = z.object({
  id: z.string().describe("Unique automation ID"),
  title: z.string().describe("Automation title"),
  description: z.string().describe("What this automation does"),
  icon: z.string().describe("Icon identifier"),
  schedule: z
    .enum(["manual", "daily", "weekly"])
    .optional()
    .describe("Run schedule"),
  repo: z.string().optional().describe("Target repository (owner/repo)"),
  automationType: z
    .enum([
      "standup",
      "release_notes",
      "bug_scan",
      "ci_report",
      "weekly_update",
    ])
    .describe("Type of automation"),
  lastRun: z
    .string()
    .optional()
    .describe("ISO timestamp of last run"),
});

// ============================================
// Tool Output Schemas
// ============================================

export const commitSchema = z.object({
  sha: z.string(),
  message: z.string(),
  author: z.string(),
  date: z.string(),
  url: z.string(),
  filesChanged: z.number().optional(),
});

export const pullRequestSchema = z.object({
  number: z.number(),
  title: z.string(),
  state: z.string(),
  author: z.string(),
  mergedAt: z.string().nullable(),
  createdAt: z.string(),
  url: z.string(),
  labels: z.array(z.string()),
  body: z.string().nullable(),
});

export const workflowRunSchema = z.object({
  id: z.number(),
  workflowName: z.string(),
  status: z.string(),
  conclusion: z.string().nullable(),
  createdAt: z.string(),
  url: z.string(),
  headBranch: z.string(),
  headSha: z.string(),
});

export const commitDetailSchema = z.object({
  sha: z.string(),
  message: z.string(),
  author: z.string(),
  date: z.string(),
  files: z.array(
    z.object({
      filename: z.string(),
      status: z.string(),
      additions: z.number(),
      deletions: z.number(),
      patch: z.string().optional(),
    })
  ),
});

export const repoInfoSchema = z.object({
  fullName: z.string(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  defaultBranch: z.string(),
  stars: z.number(),
  openIssues: z.number(),
});

// ============================================
// Type Exports
// ============================================

export type StandupSummaryProps = z.infer<typeof standupSummarySchema>;
export type ReleaseNotesProps = z.infer<typeof releaseNotesSchema>;
export type BugScanReportProps = z.infer<typeof bugScanReportSchema>;
export type CIReportProps = z.infer<typeof ciReportSchema>;
export type WeeklyUpdateProps = z.infer<typeof weeklyUpdateSchema>;
export type CommitViewerProps = z.infer<typeof commitViewerSchema>;
export type AutomationCardProps = z.infer<typeof automationCardPropsSchema>;
export type PRReviewProps = z.infer<typeof prReviewSchema>;
