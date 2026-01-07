import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function GET() {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_PAT,
    });

    const owner = process.env.GITHUB_REPO_OWNER!;
    const repo = process.env.GITHUB_REPO_NAME!;

    const { data: collaborators } = await octokit.repos.listCollaborators({
      owner,
      repo,
      per_page: 100,
    });

    console.log(`[COLLABORATORS] Found ${collaborators.length} collaborators`);

    return NextResponse.json({
      success: true,
      collaborators: collaborators.map((c) => ({
        id: c.id,
        username: c.login,
        avatarUrl: c.avatar_url,
        profileUrl: c.html_url,
        role: c.role_name || (c.permissions?.admin ? "admin" : "collaborator"),
      })),
    });
  } catch (error) {
    console.error("[COLLABORATORS] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch collaborators: ${errorMessage}` },
      { status: 500 }
    );
  }
}
