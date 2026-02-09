import { getOctokit } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const octokit = getOctokit(request);
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner") || process.env.DEFAULT_REPO_OWNER || "";
  const repo = searchParams.get("repo") || process.env.DEFAULT_REPO_NAME || "";
  const since = searchParams.get("since") || undefined;
  const until = searchParams.get("until") || undefined;
  const perPage = parseInt(searchParams.get("per_page") || "5");

  try {
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      since,
      until,
      per_page: Math.min(perPage, 100),
    });

    return NextResponse.json(
      data.map((commit) => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message.split("\n")[0],
        author:
          commit.author?.login || commit.commit.author?.name || "unknown",
        date: commit.commit.author?.date,
        url: commit.html_url,
        filesChanged: commit.files?.length,
      }))
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
