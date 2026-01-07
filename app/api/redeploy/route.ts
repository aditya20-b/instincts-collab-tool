import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function POST() {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_PAT,
    });

    const owner = process.env.GITHUB_REPO_OWNER!;
    const repo = process.env.GITHUB_REPO_NAME!;

    // Get the default branch
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    });

    const defaultBranch = repoData.default_branch;

    // Get the latest commit SHA on the default branch
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });

    const latestCommitSha = refData.object.sha;

    // Get the commit to find the tree SHA
    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha,
    });

    // Create a new commit with the same tree (empty commit)
    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message: `chore: trigger redeploy [skip ci]\n\nTriggered via Instincts Collab Tool at ${new Date().toISOString()}`,
      tree: commitData.tree.sha,
      parents: [latestCommitSha],
    });

    // Update the branch reference to point to the new commit
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
      sha: newCommit.sha,
    });

    return NextResponse.json({
      success: true,
      message: `Redeploy triggered! Created commit ${newCommit.sha.substring(0, 7)} on ${defaultBranch}`,
      commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
    });
  } catch (error) {
    console.error("Error triggering redeploy:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: `Failed to trigger redeploy: ${errorMessage}` },
      { status: 500 }
    );
  }
}
