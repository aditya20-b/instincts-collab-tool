import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Octokit } from "@octokit/rest";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated", isCollaborator: false },
        { status: 401 }
      );
    }

    const username = (session.user as { username?: string }).username;

    if (!username) {
      return NextResponse.json(
        { error: "Could not determine GitHub username", isCollaborator: false },
        { status: 400 }
      );
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_PAT,
    });

    const owner = process.env.GITHUB_REPO_OWNER!;
    const repo = process.env.GITHUB_REPO_NAME!;

    try {
      // Check if user is a collaborator
      const { status } = await octokit.repos.checkCollaborator({
        owner,
        repo,
        username,
      });

      const isCollaborator = status === 204;

      console.log(`[COLLAB CHECK] User: ${username}, IsCollaborator: ${isCollaborator}`);

      return NextResponse.json({
        success: true,
        isCollaborator,
        username,
        repo: `${owner}/${repo}`,
      });
    } catch (error) {
      // 404 means not a collaborator
      if ((error as { status?: number }).status === 404) {
        console.log(`[COLLAB CHECK] User: ${username}, IsCollaborator: false (not found)`);
        return NextResponse.json({
          success: true,
          isCollaborator: false,
          username,
          repo: `${owner}/${repo}`,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("[COLLAB CHECK] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to check collaborator status: ${errorMessage}`, isCollaborator: false },
      { status: 500 }
    );
  }
}
