import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function GET() {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_PAT,
    });

    const owner = process.env.GITHUB_REPO_OWNER!;
    const repo = process.env.GITHUB_REPO_NAME!;

    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 15,
    });

    console.log(`[COMMITS] Fetched ${commits.length} commits`);

    return NextResponse.json({
      success: true,
      commits: commits.map((c) => ({
        sha: c.sha.substring(0, 7),
        fullSha: c.sha,
        message: c.commit.message.split("\n")[0], // First line only
        author: {
          name: c.commit.author?.name || "Unknown",
          username: c.author?.login,
          avatarUrl: c.author?.avatar_url,
        },
        date: c.commit.author?.date,
        url: c.html_url,
      })),
    });
  } catch (error) {
    console.error("[COMMITS] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch commits: ${errorMessage}` },
      { status: 500 }
    );
  }
}
