import { StandupSummary } from "@/components/generative/StandupSummary";
import { ReleaseNotes } from "@/components/generative/ReleaseNotes";
import { BugScanReport } from "@/components/generative/BugScanReport";
import { CIReport } from "@/components/generative/CIReport";
import { WeeklyUpdate } from "@/components/generative/WeeklyUpdate";
import { CommitViewer } from "@/components/generative/CommitViewer";
import {
  standupSummarySchema,
  releaseNotesSchema,
  bugScanReportSchema,
  ciReportSchema,
  weeklyUpdateSchema,
  commitViewerSchema,
} from "@/lib/schemas";
import { allTools } from "@/lib/tools";

export const tamboComponents = [
  {
    name: "CommitViewer",
    description:
      "GitHub-style interactive commit viewer with tabs for Conversation, Commits, and Files. Supports inline code commenting, diff viewing, and reactions. Use this as the PRIMARY component when displaying commits, code changes, or when the user wants to see git activity in a GitHub-like interface.",
    component: CommitViewer,
    propsSchema: commitViewerSchema,
  },
  {
    name: "StandupSummary",
    description:
      "Displays a standup-ready summary of recent git activity including commits, PR activity, highlights, and blockers. Use when the user asks for standup prep, daily summary, or yesterday's activity.",
    component: StandupSummary,
    propsSchema: standupSummarySchema,
  },
  {
    name: "ReleaseNotes",
    description:
      "Renders formatted release notes from merged PRs, categorized by type (features, fixes, improvements). Includes contributor list and copyable markdown. Use when the user asks for release notes, changelog, or merged PR summary.",
    component: ReleaseNotes,
    propsSchema: releaseNotesSchema,
  },
  {
    name: "BugScanReport",
    description:
      "Shows potential bugs found by analyzing recent commits. Each finding has severity, affected files, and suggested fixes. Use when the user asks to scan for bugs, review commits for issues, or find risky changes.",
    component: BugScanReport,
    propsSchema: bugScanReportSchema,
  },
  {
    name: "CIReport",
    description:
      "Dashboard showing CI/CD health including failing workflows, flaky tests, health score, and recommendations. Use when the user asks about CI failures, test health, or build status.",
    component: CIReport,
    propsSchema: ciReportSchema,
  },
  {
    name: "WeeklyUpdate",
    description:
      "Newsletter-style weekly summary with metrics, key changes, risks, and outlook. Use when the user asks for a weekly update, team summary, or weekly report.",
    component: WeeklyUpdate,
    propsSchema: weeklyUpdateSchema,
  },
];

export const tamboTools = allTools;
