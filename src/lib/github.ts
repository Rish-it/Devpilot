import { Octokit } from "@octokit/rest";
import type { NextRequest } from "next/server";
import { getTokenFromRequest } from "./auth";

export function getOctokit(request: NextRequest): Octokit {
  const token = getTokenFromRequest(request);
  if (!token) {
    throw new Error("Not authenticated");
  }
  return new Octokit({ auth: token });
}
