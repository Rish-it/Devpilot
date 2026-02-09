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
    const { data } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: parseInt(number),
      per_page: 100,
    });

    return NextResponse.json(
      data.map((file) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch || "",
        previousFilename: file.previous_filename || undefined,
      }))
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
