"use client";

import { useState, useEffect } from "react";

interface Branch {
  name: string;
  sha: string;
  protected: boolean;
}

interface DeploymentResult {
  id: string;
  url: string;
  state: string;
}

export default function BranchDeploy() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [deploying, setDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/branches");
      const data = await response.json();

      if (response.ok) {
        setBranches(data.branches);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch branches");
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!selectedBranch) return;

    try {
      setDeploying(true);
      setMessage(null);
      setDeploymentResult(null);

      const response = await fetch("/api/vercel/deploy-branch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch: selectedBranch }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message, error: false });
        setDeploymentResult(data.deployment);
      } else {
        setMessage({ text: data.error, error: true });
      }
    } catch {
      setMessage({ text: "Failed to deploy branch", error: true });
    } finally {
      setDeploying(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Branch Preview</h2>
          <p className="text-sm text-gray-500 mt-1">
            Deploy any branch to get a preview URL without affecting production
          </p>
        </div>
        <button
          onClick={fetchBranches}
          disabled={loading}
          className="text-sm px-3 py-1 border border-gray-400 text-gray-700 bg-white rounded-md hover:bg-gray-100 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            message.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 text-center py-8">Loading branches...</div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a branch...</option>
              {branches.map((branch) => (
                <option key={branch.name} value={branch.name}>
                  {branch.name} ({branch.sha})
                </option>
              ))}
            </select>
            <button
              onClick={handleDeploy}
              disabled={!selectedBranch || deploying}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deploying ? "Deploying..." : "Deploy Preview"}
            </button>
          </div>

          {deploymentResult && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">Preview Deployment Started</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    {deploymentResult.state}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Preview URL:</span>{" "}
                  <a
                    href={`https://${deploymentResult.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    https://{deploymentResult.url}
                  </a>
                </p>
                <p className="text-xs text-green-600 mt-2">
                  The deployment is building. Check the Deployments tab for progress.
                </p>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <p className="font-medium mb-1">Available branches ({branches.length}):</p>
            <div className="flex flex-wrap gap-1">
              {branches.slice(0, 10).map((branch) => (
                <span
                  key={branch.name}
                  className={`px-2 py-0.5 rounded ${
                    branch.name === "main"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {branch.name}
                </span>
              ))}
              {branches.length > 10 && (
                <span className="px-2 py-0.5 text-gray-400">
                  +{branches.length - 10} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
