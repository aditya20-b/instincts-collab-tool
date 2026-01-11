import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { deployBranch } from "@/lib/vercel";

export async function POST(request: Request) {
  try {
    const { branch } = await request.json();

    if (!branch || typeof branch !== "string") {
      return NextResponse.json(
        { error: "Branch name is required" },
        { status: 400 }
      );
    }

    // Get the GitHub repo ID
    const octokit = new Octokit({
      auth: process.env.GITHUB_PAT,
    });

    const owner = process.env.GITHUB_REPO_OWNER!;
    const repo = process.env.GITHUB_REPO_NAME!;

    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    });

    const repoId = repoData.id;
    console.log(`[DEPLOY BRANCH] Deploying ${branch} from repo ${repoId}`);

    const deployment = await deployBranch(branch, repoId);

    return NextResponse.json({
      success: true,
      message: `Preview deployment for branch "${branch}" triggered!`,
      deployment: {
        id: deployment.uid,
        url: deployment.url,
        state: deployment.state,
      },
    });
  } catch (error) {
    console.error("[DEPLOY BRANCH] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to deploy branch: ${errorMessage}` },
      { status: 500 }
    );
  }
}
