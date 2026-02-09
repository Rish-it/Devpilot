import { getOctokit } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const octokit = getOctokit(request);
  const { number } = await params;
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner") || process.env.DEFAULT_REPO_OWNER || "";
  const repo = searchParams.get("repo") || process.env.DEFAULT_REPO_NAME || "";

  try {
    const { data } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: parseInt(number),
    });

    return NextResponse.json({
      number: data.number,
      title: data.title,
      body: data.body || "",
      state: data.state,
      draft: data.draft,
      merged: data.merged,
      mergeable: data.mergeable,
      mergeableState: data.mergeable_state,
      author: data.user?.login || "unknown",
      authorAvatar: data.user?.avatar_url || "",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      mergedAt: data.merged_at,
      closedAt: data.closed_at,
      headBranch: data.head.ref,
      baseBranch: data.base.ref,
      headSha: data.head.sha,
      additions: data.additions,
      deletions: data.deletions,
      changedFiles: data.changed_files,
      commits: data.commits,
      comments: data.comments + data.review_comments,
      labels: data.labels.map((l) => ({ name: l.name || "", color: l.color || "" })),
      url: data.html_url,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
