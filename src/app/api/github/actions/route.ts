import { octokit } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner") || process.env.DEFAULT_REPO_OWNER || "";
  const repo = searchParams.get("repo") || process.env.DEFAULT_REPO_NAME || "";
  const status = searchParams.get("status") || undefined;
  const perPage = parseInt(searchParams.get("per_page") || "10");

  try {
    const params: Record<string, unknown> = {
      owner,
      repo,
      per_page: Math.min(perPage, 100),
    };
    if (status) {
      params.status = status as "completed" | "in_progress" | "queued" | "requested" | "waiting" | "pending";
    }

    const { data } = await octokit.actions.listWorkflowRunsForRepo(
      params as Parameters<typeof octokit.actions.listWorkflowRunsForRepo>[0]
    );

    return NextResponse.json(
      data.workflow_runs.map((run) => ({
        id: run.id,
        workflowName: run.name || "Unknown",
        status: run.status,
        conclusion: run.conclusion,
        createdAt: run.created_at,
        url: run.html_url,
        headBranch: run.head_branch || "",
        headSha: run.head_sha.substring(0, 7),
      }))
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
