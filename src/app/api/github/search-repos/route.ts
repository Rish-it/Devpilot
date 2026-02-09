import { getOctokit } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const octokit = getOctokit(request);
    const { data } = await octokit.search.repos({
      q,
      sort: "stars",
      order: "desc",
      per_page: 8,
    });

    return NextResponse.json(
      data.items.map((repo) => ({
        fullName: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        language: repo.language,
        owner: repo.owner?.login || "",
        name: repo.name,
      }))
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
