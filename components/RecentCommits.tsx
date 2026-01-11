"use client";

import { useState, useEffect } from "react";

interface Commit {
  sha: string;
  fullSha: string;
  message: string;
  author: {
    name: string;
    username?: string;
    avatarUrl?: string;
  };
  date: string;
  url: string;
}

interface Branch {
  name: string;
  sha: string;
}

interface Deployment {
  branch?: string;
}

export default function RecentCommits() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [latestBuildBranch, setLatestBuildBranch] = useState<string>("main");
  const [loading, setLoading] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch branches and latest deployment on mount
  useEffect(() => {
    const init = async () => {
      setBranchesLoading(true);

      // Fetch branches and latest deployment in parallel
      const [branchesRes, deploymentsRes] = await Promise.all([
        fetch("/api/branches").then(r => r.json()).catch(() => ({ branches: [] })),
        fetch("/api/vercel/deployments").then(r => r.json()).catch(() => ({ deployments: [] })),
      ]);

      if (branchesRes.branches) {
        setBranches(branchesRes.branches);
      }

      // Get the branch from the latest deployment
      const latestDeployment = deploymentsRes.deployments?.[0] as Deployment | undefined;
      const latestBranch = latestDeployment?.branch || "main";
      setLatestBuildBranch(latestBranch);
      setSelectedBranch(latestBranch);

      setBranchesLoading(false);
    };

    init();
  }, []);

  // Fetch commits when selected branch changes
  useEffect(() => {
    if (selectedBranch) {
      fetchCommits(selectedBranch);
    }
  }, [selectedBranch]);

  const fetchCommits = async (branch?: string) => {
    try {
      setLoading(true);
      const url = branch ? `/api/commits?branch=${encodeURIComponent(branch)}` : "/api/commits";
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setCommits(data.commits);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch commits");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const repoOwner = "aditya20-b";
  const repoName = "instincts-website-2026";

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Commits</h2>
        <button
          onClick={() => fetchCommits(selectedBranch)}
          disabled={loading}
          className="text-sm px-3 py-1 border border-gray-400 text-gray-700 bg-white rounded-md hover:bg-gray-100 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* Branch Selector */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Branch:</label>
          {branchesLoading ? (
            <span className="text-sm text-gray-400">Loading branches...</span>
          ) : (
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {branches.map((branch) => (
                <option key={branch.name} value={branch.name}>
                  {branch.name}
                  {branch.name === latestBuildBranch ? " (latest build)" : ""}
                </option>
              ))}
            </select>
          )}
          {selectedBranch !== latestBuildBranch && (
            <button
              onClick={() => setSelectedBranch(latestBuildBranch)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Reset to latest build
            </button>
          )}
        </div>
        {selectedBranch === latestBuildBranch && (
          <p className="text-xs text-gray-500 mt-1">
            Showing commits from the latest deployed branch
          </p>
        )}
      </div>

      {loading && commits.length === 0 ? (
        <div className="text-gray-500 text-center py-8">Loading commits...</div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : commits.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No commits found</div>
      ) : (
        <div className="space-y-3">
          {commits.map((commit) => (
            <a
              key={commit.fullSha}
              href={commit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-gray-200 rounded-lg p-3 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                {commit.author.avatarUrl ? (
                  <img
                    src={commit.author.avatarUrl}
                    alt={commit.author.name}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-gray-500">
                      {commit.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 font-medium truncate">
                    {commit.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                      {commit.sha}
                    </span>
                    <span>
                      {commit.author.username ? `@${commit.author.username}` : commit.author.name}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{formatTimeAgo(commit.date)}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <a
          href={`https://github.com/${repoOwner}/${repoName}/commits/${selectedBranch}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View all commits on {selectedBranch} →
        </a>
      </div>
    </div>
  );
}
