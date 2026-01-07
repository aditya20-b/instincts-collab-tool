import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { listDeployments } from "@/lib/vercel";

export async function GET() {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_PAT,
    });

    const owner = process.env.GITHUB_REPO_OWNER!;
    const repo = process.env.GITHUB_REPO_NAME!;

    // Fetch data in parallel
    const [issuesResponse, prsResponse, deploymentsResponse, siteCheck] = await Promise.all([
      octokit.issues.listForRepo({
        owner,
        repo,
        state: "open",
        per_page: 1,
      }),
      octokit.pulls.list({
        owner,
        repo,
        state: "open",
        per_page: 1,
      }),
      listDeployments(1).catch(() => ({ deployments: [] })),
      fetch(`https://${process.env.TARGET_VERCEL_PROJECT}.vercel.app`, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      }).then(() => true).catch(() => false),
    ]);

    // Get counts from headers (GitHub returns total count in link header pagination)
    // For simplicity, we'll do a separate count request
    const [issuesCount, prsCount] = await Promise.all([
      octokit.search.issuesAndPullRequests({
        q: `repo:${owner}/${repo} is:issue is:open`,
        per_page: 1,
      }),
      octokit.search.issuesAndPullRequests({
        q: `repo:${owner}/${repo} is:pr is:open`,
        per_page: 1,
      }),
    ]);

    const latestDeployment = deploymentsResponse.deployments[0];

    return NextResponse.json({
      success: true,
      stats: {
        openIssues: issuesCount.data.total_count,
        openPRs: prsCount.data.total_count,
        lastDeployment: latestDeployment ? {
          time: latestDeployment.created,
          state: latestDeployment.state,
          url: latestDeployment.url,
        } : null,
        siteOnline: siteCheck,
      },
    });
  } catch (error) {
    console.error("[STATS] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch stats: ${errorMessage}` },
      { status: 500 }
    );
  }
}
