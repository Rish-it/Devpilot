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
    const { data } = await octokit.pulls.listCommits({
      owner,
      repo,
      pull_number: parseInt(number),
      per_page: 100,
    });

    return NextResponse.json(
      data.map((commit) => ({
        sha: commit.sha,
        shortSha: commit.sha.substring(0, 7),
        message: commit.commit.message,
        author: commit.author?.login || commit.commit.author?.name || "unknown",
        authorAvatar: commit.author?.avatar_url || "",
        date: commit.commit.author?.date || "",
        url: commit.html_url,
      }))
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
