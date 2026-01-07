import { NextResponse } from "next/server";
import { listDeployments } from "@/lib/vercel";

export async function GET() {
  try {
    const { deployments } = await listDeployments(20);

    return NextResponse.json({
      success: true,
      deployments: deployments.map((d) => ({
        id: d.uid,
        url: d.url,
        state: d.state,
        created: d.created,
        target: d.target,
        branch: d.meta?.githubCommitRef,
        commitSha: d.meta?.githubCommitSha?.substring(0, 7),
        commitMessage: d.meta?.githubCommitMessage,
        creator: d.creator?.username,
      })),
    });
  } catch (error) {
    console.error("Error fetching deployments:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch deployments: ${errorMessage}` },
      { status: 500 }
    );
  }
}
