"use client";

import { useState, useEffect } from "react";

interface Deployment {
  id: string;
  url: string;
  state: string;
  created: number;
  target: string | null;
  branch?: string;
  commitSha?: string;
  commitMessage?: string;
  creator?: string;
}

interface LogEntry {
  timestamp: number;
  text: string;
  type: string;
}

export default function DeploymentsSection() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; error: boolean } | null>(null);

  const fetchDeployments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vercel/deployments");
      const data = await response.json();

      if (response.ok) {
        setDeployments(data.deployments);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch deployments");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (deploymentId: string) => {
    try {
      setLogsLoading(true);
      setSelectedDeployment(deploymentId);
      const response = await fetch(`/api/vercel/deployments/${deploymentId}/logs`);
      const data = await response.json();

      if (response.ok) {
        setLogs(data.logs);
      } else {
        setLogs([]);
      }
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleRedeploy = async () => {
    try {
      setActionLoading("redeploy");
      setActionMessage(null);
      const response = await fetch("/api/vercel/redeploy", { method: "POST" });
      const data = await response.json();

      if (response.ok) {
        setActionMessage({ text: data.message, error: false });
        fetchDeployments();
      } else {
        setActionMessage({ text: data.error, error: true });
      }
    } catch {
      setActionMessage({ text: "Failed to trigger redeploy", error: true });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRollback = async (deploymentId: string) => {
    try {
      setActionLoading(deploymentId);
      setActionMessage(null);
      const response = await fetch("/api/vercel/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deploymentId }),
      });
      const data = await response.json();

      if (response.ok) {
        setActionMessage({ text: data.message, error: false });
        fetchDeployments();
      } else {
        setActionMessage({ text: data.error, error: true });
      }
    } catch {
      setActionMessage({ text: "Failed to rollback", error: true });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, []);

  const getStateColor = (state: string) => {
    switch (state) {
      case "READY":
        return "bg-green-100 text-green-800";
      case "ERROR":
        return "bg-red-100 text-red-800";
      case "BUILDING":
      case "INITIALIZING":
      case "QUEUED":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Deployments</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchDeployments}
            disabled={loading}
            className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            onClick={handleRedeploy}
            disabled={actionLoading === "redeploy"}
            className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {actionLoading === "redeploy" ? "Deploying..." : "Redeploy"}
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            actionMessage.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 text-center py-8">Loading deployments...</div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : (
        <div className="space-y-3">
          {deployments.map((deployment, index) => (
            <div
              key={deployment.id}
              className={`border rounded-lg p-3 ${
                index === 0 ? "border-blue-200 bg-blue-50" : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${getStateColor(
                        deployment.state
                      )}`}
                    >
                      {deployment.state}
                    </span>
                    {deployment.target === "production" && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Production
                      </span>
                    )}
                    {index === 0 && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Latest
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-600 truncate">
                    {deployment.commitMessage || "No commit message"}
                  </div>
                  <div className="mt-1 text-xs text-gray-400 flex flex-wrap gap-2">
                    <span>{formatDate(deployment.created)}</span>
                    {deployment.branch && <span>Branch: {deployment.branch}</span>}
                    {deployment.commitSha && <span>Commit: {deployment.commitSha}</span>}
                  </div>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <button
                    onClick={() => fetchLogs(deployment.id)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Logs
                  </button>
                  {deployment.state === "READY" && index !== 0 && (
                    <button
                      onClick={() => handleRollback(deployment.id)}
                      disabled={actionLoading === deployment.id}
                      className="text-xs px-2 py-1 border border-orange-300 text-orange-600 rounded hover:bg-orange-50 disabled:opacity-50"
                    >
                      {actionLoading === deployment.id ? "..." : "Rollback"}
                    </button>
                  )}
                  <a
                    href={`https://${deployment.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Visit
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logs Modal */}
      {selectedDeployment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Build Logs</h3>
              <button
                onClick={() => setSelectedDeployment(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-900 text-gray-100 font-mono text-sm">
              {logsLoading ? (
                <div className="text-gray-400">Loading logs...</div>
              ) : logs.length === 0 ? (
                <div className="text-gray-400">No logs available</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="py-0.5">
                    <span className="text-gray-500 mr-2">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span>{log.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
