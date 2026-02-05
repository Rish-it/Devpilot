import { octokit } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner") || process.env.DEFAULT_REPO_OWNER || "";
  const repo = searchParams.get("repo") || process.env.DEFAULT_REPO_NAME || "";
  const state = (searchParams.get("state") || "all") as "open" | "closed" | "all";
  const since = searchParams.get("since") || undefined;
  const perPage = parseInt(searchParams.get("per_page") || "30");

  try {
    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state,
      sort: "updated",
      direction: "desc",
      per_page: Math.min(perPage, 100),
    });

    let filtered = data;
    if (since) {
      const sinceDate = new Date(since);
      filtered = data.filter(
        (pr) => new Date(pr.updated_at) >= sinceDate
      );
    }

    return NextResponse.json(
      filtered.map((pr) => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        author: pr.user?.login || "unknown",
        mergedAt: pr.merged_at,
        createdAt: pr.created_at,
        url: pr.html_url,
        labels: pr.labels.map((l) => (typeof l === "string" ? l : l.name || "")),
        body: pr.body?.substring(0, 300) || null,
      }))
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
