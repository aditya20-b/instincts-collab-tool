/**
 * GitHub file operations for pages.json management
 */

import { Octokit } from "@octokit/rest";
import { PagesConfig } from "@/types/pages";

const PAGES_FILE_PATH = "pages.json";

/**
 * Get Octokit instance with PAT authentication
 */
function getOctokit(): Octokit {
  if (!process.env.GITHUB_PAT) {
    throw new Error("GITHUB_PAT environment variable is required");
  }
  return new Octokit({ auth: process.env.GITHUB_PAT });
}

/**
 * Get repository info from environment variables
 */
function getRepoInfo() {
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;

  if (!owner || !repo) {
    throw new Error("GITHUB_REPO_OWNER and GITHUB_REPO_NAME must be set");
  }

  return { owner, repo };
}

/**
 * Fetch pages.json from GitHub repository
 */
export async function getPagesConfig(): Promise<PagesConfig> {
  const octokit = getOctokit();
  const { owner, repo } = getRepoInfo();

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: PAGES_FILE_PATH,
    });

    // GitHub returns base64 encoded content
    if ("content" in data && data.content) {
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      const config = JSON.parse(content) as PagesConfig;
      return config;
    }

    throw new Error("Invalid file content");
  } catch (error: any) {
    // If file doesn't exist, return empty config
    if (error.status === 404) {
      return { pages: [] };
    }
    throw error;
  }
}

/**
 * Update pages.json in GitHub repository
 */
export async function updatePagesConfig(
  config: PagesConfig,
  commitMessage: string
): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo } = getRepoInfo();

  // Get current file SHA (required for updates)
  let sha: string | undefined;
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: PAGES_FILE_PATH,
    });

    if ("sha" in data) {
      sha = data.sha;
    }
  } catch (error: any) {
    // File doesn't exist yet, that's okay for creation
    if (error.status !== 404) {
      throw error;
    }
  }

  // Encode content as base64
  const content = Buffer.from(
    JSON.stringify(config, null, 2),
    "utf-8"
  ).toString("base64");

  // Create or update file
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: PAGES_FILE_PATH,
    message: commitMessage,
    content,
    sha,
  });
}

/**
 * Initialize pages.json with empty config if it doesn't exist
 */
export async function initializePagesConfig(): Promise<PagesConfig> {
  const config = await getPagesConfig();

  // If file doesn't exist, create it
  if (config.pages.length === 0) {
    await updatePagesConfig(
      { pages: [] },
      "Initialize page ownership configuration"
    );
  }

  return config;
}
