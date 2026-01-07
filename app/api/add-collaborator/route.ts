import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Octokit } from "@octokit/rest";
import { authOptions } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to add yourself as a collaborator" },
        { status: 401 }
      );
    }

    const username = (session.user as { username?: string }).username;

    if (!username) {
      return NextResponse.json(
        { error: "Could not determine your GitHub username" },
        { status: 400 }
      );
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_PAT,
    });

    const owner = process.env.GITHUB_REPO_OWNER!;
    const repo = process.env.GITHUB_REPO_NAME!;

    await octokit.repos.addCollaborator({
      owner,
      repo,
      username,
      permission: "push",
    });

    console.log(`[ADD COLLABORATOR] User: ${username} added to ${owner}/${repo} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${username} as a collaborator. Check your email for the invitation!`,
    });
  } catch (error) {
    console.error("Error adding collaborator:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("already a collaborator")) {
      return NextResponse.json({
        success: true,
        message: "You are already a collaborator on this repository!",
      });
    }

    return NextResponse.json(
      { error: `Failed to add collaborator: ${errorMessage}` },
      { status: 500 }
    );
  }
}
