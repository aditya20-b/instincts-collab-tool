import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function GET() {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_PAT,
    });

    const owner = process.env.GITHUB_REPO_OWNER!;
    const repo = process.env.GITHUB_REPO_NAME!;

    const { data: branches } = await octokit.repos.listBranches({
      owner,
      repo,
      per_page: 100,
    });

    console.log(`[BRANCHES] Fetched ${branches.length} branches`);

    return NextResponse.json({
      success: true,
      branches: branches.map((b) => ({
        name: b.name,
        sha: b.commit.sha.substring(0, 7),
        protected: b.protected,
      })),
    });
  } catch (error) {
    console.error("[BRANCHES] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch branches: ${errorMessage}` },
      { status: 500 }
    );
  }
}
