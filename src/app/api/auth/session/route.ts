import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { getTokenFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.users.getAuthenticated();

    return NextResponse.json({
      id: data.id,
      login: data.login,
      name: data.name,
      avatar_url: data.avatar_url,
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
