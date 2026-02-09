import { octokit } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner") || process.env.DEFAULT_REPO_OWNER || "";
  const repo = searchParams.get("repo") || process.env.DEFAULT_REPO_NAME || "";

  try {
    // First get the PR to get head SHA and mergeable status
    const { data: pr } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: parseInt(number),
    });

    // Get check runs for the PR's head commit
    const { data: checkRuns } = await octokit.checks.listForRef({
      owner,
      repo,
      ref: pr.head.sha,
      per_page: 100,
    });

    // Get combined status (legacy status checks)
    const { data: combinedStatus } = await octokit.repos.getCombinedStatusForRef({
      owner,
      repo,
      ref: pr.head.sha,
    });

    return NextResponse.json({
      mergeable: pr.mergeable,
      mergeableState: pr.mergeable_state,
      headSha: pr.head.sha.substring(0, 7),
      checks: checkRuns.check_runs.map((run) => ({
        id: run.id,
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
        startedAt: run.started_at,
        completedAt: run.completed_at,
        url: run.html_url,
        app: run.app?.name || "Unknown",
      })),
      statuses: combinedStatus.statuses.map((s) => ({
        context: s.context,
        state: s.state,
        description: s.description,
        targetUrl: s.target_url,
      })),
      overallState: combinedStatus.state,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
