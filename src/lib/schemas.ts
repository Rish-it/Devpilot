import { z } from "zod";

// ============================================
// Generative Component Schemas
// ============================================

export const standupSummarySchema = z.object({
  repoName: z.string().describe("The repository name (owner/repo)"),
  date: z.string().describe("The date being summarized (YYYY-MM-DD)"),
  commitsSummary: z
    .array(
      z.object({
        sha: z.string().describe("Short commit SHA"),
        message: z.string().describe("Commit message (first line)"),
        author: z.string().describe("Commit author username"),
        url: z.string().describe("Link to the commit on GitHub"),
      })
    )
    .describe("Key commits from the period"),
  prActivity: z
    .array(
      z.object({
        number: z.number().describe("PR number"),
        title: z.string().describe("PR title"),
        status: z
          .enum(["opened", "merged", "closed", "reviewed"])
          .describe("What happened"),
        author: z.string().describe("PR author"),
        url: z.string().describe("Link to the PR"),
      })
    )
    .describe("PR activity summary"),
  highlights: z
    .array(z.string())
    .describe("3-5 bullet point highlights for standup"),
  blockers: z
    .array(z.string())
    .optional()
    .describe("Any identified blockers"),
});

export const releaseNotesSchema = z.object({
  repoName: z.string().describe("Repository name"),
  periodStart: z.string().describe("Start date of the period"),
  periodEnd: z.string().describe("End date of the period"),
  version: z.string().optional().describe("Suggested version tag"),
  sections: z
    .array(
      z.object({
        category: z
          .enum([
            "Features",
            "Bug Fixes",
            "Improvements",
            "Breaking Changes",
            "Other",
          ])
          .describe("Category of changes"),
        items: z
          .array(
            z.object({
              description: z
                .string()
                .describe("Human-readable description of the change"),
              prNumber: z.number().describe("PR number"),
              prUrl: z.string().describe("Link to the PR"),
              author: z.string().describe("PR author"),
            })
          )
          .describe("Individual changes in this category"),
      })
    )
    .describe("Categorized changes"),
  contributors: z
    .array(z.string())
    .describe("List of contributors in this release"),
  markdownOutput: z
    .string()
    .describe("Full release notes in markdown format for copy-paste"),
});

export const bugScanReportSchema = z.object({
  repoName: z.string().describe("Repository name"),
  scanPeriod: z.string().describe("How far back commits were scanned"),
  findings: z
    .array(
      z.object({
        severity: z
          .enum(["high", "medium", "low"])
          .describe("Estimated severity"),
        commitSha: z
          .string()
          .describe("The commit SHA that introduced the potential bug"),
        commitUrl: z.string().describe("Link to the commit"),
        commitMessage: z.string().describe("Original commit message"),
        suspiciousPattern: z
          .string()
          .describe("What pattern looks risky"),
        suggestedFix: z.string().describe("Proposed minimal fix"),
        affectedFiles: z
          .array(z.string())
          .describe("Files likely affected"),
      })
    )
    .describe("Potential bugs found"),
  summary: z.string().describe("Executive summary of findings"),
  totalCommitsScanned: z
    .number()
    .describe("How many commits were analyzed"),
});

export const ciReportSchema = z.object({
  repoName: z.string().describe("Repository name"),
  period: z.string().describe("Period analyzed"),
  failingSuites: z
    .array(
      z.object({
        workflowName: z.string().describe("CI workflow/action name"),
        failureCount: z
          .number()
          .describe("Number of failures in period"),
        lastFailure: z
          .string()
          .describe("Date of most recent failure"),
        isFlaky: z
          .boolean()
          .describe("Whether this appears to be a flaky test"),
        errorSummary: z.string().describe("Common error pattern"),
        suggestedFix: z.string().describe("Recommended action"),
        url: z.string().describe("Link to the workflow run"),
      })
    )
    .describe("Failing CI workflows/tests"),
  overallHealthScore: z
    .number()
    .describe("CI health score 0-100"),
  summary: z.string().describe("Executive summary"),
  recommendations: z
    .array(z.string())
    .describe("Top 3 recommendations"),
});

export const weeklyUpdateSchema = z.object({
  repoName: z.string().describe("Repository name"),
  weekOf: z.string().describe("Week start date"),
  tldr: z.string().describe("One-paragraph executive summary"),
  metrics: z
    .object({
      prsOpened: z.number(),
      prsMerged: z.number(),
      prsClosed: z.number(),
      commitsTotal: z.number(),
      contributorsActive: z.number(),
    })
    .describe("Key metrics for the week"),
  keyChanges: z
    .array(
      z.object({
        title: z.string().describe("Change title"),
        description: z.string().describe("Brief description"),
        prUrl: z.string().describe("Link to related PR"),
        impact: z
          .enum(["high", "medium", "low"])
          .describe("Impact level"),
      })
    )
    .describe("Most significant changes"),
  risksAndIncidents: z
    .array(z.string())
    .optional()
    .describe("Any risks or incidents"),
  nextWeekOutlook: z
    .string()
    .optional()
    .describe("What to expect next week"),
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
export type AutomationCardProps = z.infer<typeof automationCardPropsSchema>;
