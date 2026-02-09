export interface AutomationTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  automationType:
  | "standup"
  | "release_notes"
  | "bug_scan"
  | "ci_report"
  | "weekly_update";
  prompt: string;
}

export const automationTemplates: AutomationTemplate[] = [
  {
    id: "standup",
    title: "Standup Summary",
    description:
      "Summarize yesterday's git activity for standup.",
    icon: "calendar",
    automationType: "standup",
    prompt:
      "Summarize yesterday's git activity for standup for the repository {repo}. Get only the last 5 commits and check any recent PRs. Include recent commits, PR activity, key highlights, and any blockers. Use the StandupSummary component to display the results.",
  },
  {
    id: "release_notes",
    title: "Release Notes",
    description:
      "Draft weekly release notes from merged PRs (include links when available).",
    icon: "file-text",
    automationType: "release_notes",
    prompt:
      "Draft release notes for the repository {repo} based on the last 5 recently merged pull requests. Categorize changes into Features, Bug Fixes, Improvements, and Breaking Changes. Include PR links and contributors. Use the ReleaseNotes component to display the results.",
  },
  {
    id: "bug_scan",
    title: "Bug Scanner",
    description:
      "Scan recent commits (since the last run, or last 24h) for likely bugs and propose minimal fixes.",
    icon: "bug",
    automationType: "bug_scan",
    prompt:
      "Scan the last 5 recent commits for the repository {repo} for potential bugs. Look for risky patterns, missing error handling, potential null references, and other common issues. Propose minimal fixes for each finding. Use the BugScanReport component to display the results.",
  },
  {
    id: "ci_report",
    title: "CI Health Report",
    description:
      "Summarize CI failures and flaky tests from the last CI window; suggest top fixes.",
    icon: "activity",
    automationType: "ci_report",
    prompt:
      "Analyze the last 10 CI/CD workflow runs for the repository {repo}. Identify failing workflows, flaky tests, and calculate an overall health score. Suggest the top fixes. Use the CIReport component to display the results.",
  },
  {
    id: "weekly_update",
    title: "Weekly Update",
    description:
      "Synthesize this week's PRs, rollouts, incidents, and reviews into a weekly update.",
    icon: "newspaper",
    automationType: "weekly_update",
    prompt:
      "Generate a weekly update for the repository {repo}. Get the last 5 commits and 5 PRs. Include metrics (PRs opened, merged, closed, commits, active contributors), key changes with impact levels, any risks or incidents, and an outlook for next week. Use the WeeklyUpdate component to display the results.",
  },
  {
    id: "commit_explorer",
    title: "Commit Explorer",
    description:
      "View the last 5 commits in a GitHub-style interactive interface with commenting.",
    icon: "git-commit",
    automationType: "standup" as const,
    prompt:
      "Show me the last 5 commits for the repository {repo} in a GitHub-style interactive interface. Use the CommitViewer component to display the commits with their details, files changed, and diffs. Make it interactive so users can comment on code and conversations.",
  },
];
