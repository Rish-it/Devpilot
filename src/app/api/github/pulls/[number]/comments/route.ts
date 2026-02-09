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
  const pullNumber = parseInt(number);

  try {
    // Fetch both issue comments (general) and review comments (on code) in parallel
    const [issueComments, reviewComments] = await Promise.all([
      octokit.issues.listComments({
        owner,
        repo,
        issue_number: pullNumber,
        per_page: 100,
      }),
      octokit.pulls.listReviewComments({
        owner,
        repo,
        pull_number: pullNumber,
        per_page: 100,
      }),
    ]);

    const general = issueComments.data.map((c) => ({
      id: c.id,
      type: "issue" as const,
      body: c.body || "",
      author: c.user?.login || "unknown",
      authorAvatar: c.user?.avatar_url || "",
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      url: c.html_url,
    }));

    const review = reviewComments.data.map((c) => ({
      id: c.id,
      type: "review" as const,
      body: c.body || "",
      author: c.user?.login || "unknown",
      authorAvatar: c.user?.avatar_url || "",
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      path: c.path,
      line: c.line || c.original_line || undefined,
      diffHunk: c.diff_hunk || "",
      inReplyToId: c.in_reply_to_id || undefined,
      url: c.html_url,
    }));

    // Merge and sort by creation date
    const all = [...general, ...review].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return NextResponse.json(all);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner") || process.env.DEFAULT_REPO_OWNER || "";
  const repo = searchParams.get("repo") || process.env.DEFAULT_REPO_NAME || "";
  const pullNumber = parseInt(number);

  try {
    const body = await request.json();

    if (body.inReplyToId) {
      // Reply to an existing review comment thread
      const { data } = await octokit.pulls.createReplyForReviewComment({
        owner,
        repo,
        pull_number: pullNumber,
        comment_id: body.inReplyToId,
        body: body.body,
      });
      return NextResponse.json({
        id: data.id,
        type: "review",
        body: data.body,
        author: data.user?.login || "unknown",
        authorAvatar: data.user?.avatar_url || "",
        createdAt: data.created_at,
        path: data.path,
        line: data.line,
        inReplyToId: data.in_reply_to_id,
      });
    } else if (body.type === "review" && body.path) {
      // Inline review comment on a file
      const { data } = await octokit.pulls.createReviewComment({
        owner,
        repo,
        pull_number: pullNumber,
        body: body.body,
        commit_id: body.commitId,
        path: body.path,
        line: body.line,
        side: "RIGHT",
      });
      return NextResponse.json({
        id: data.id,
        type: "review",
        body: data.body,
        author: data.user?.login || "unknown",
        authorAvatar: data.user?.avatar_url || "",
        createdAt: data.created_at,
        path: data.path,
        line: data.line,
      });
    } else {
      // General issue comment
      const { data } = await octokit.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body: body.body,
      });
      return NextResponse.json({
        id: data.id,
        type: "issue",
        body: data.body || "",
        author: data.user?.login || "unknown",
        authorAvatar: data.user?.avatar_url || "",
        createdAt: data.created_at,
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
