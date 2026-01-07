"use client";

import { useState, useEffect } from "react";

interface Stats {
  openIssues: number;
  openPRs: number;
  lastDeployment: {
    time: number;
    state: string;
    url: string;
  } | null;
  siteOnline: boolean;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stats");
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading && !stats) {
    return (
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="text-gray-400 text-sm text-center">Loading stats...</div>
      </div>
    );
  }

  if (error && !stats) {
    return null; // Don't show error card, just hide it
  }

  if (!stats) return null;

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Site Status */}
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              stats.siteOnline ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <div>
            <div className="text-xs text-gray-500">Site Status</div>
            <div className="font-medium text-gray-900">
              {stats.siteOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>

        {/* Last Deploy */}
        <div className="flex items-center gap-3">
          <div className="text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-500">Last Deploy</div>
            <div className="font-medium text-gray-900">
              {stats.lastDeployment
                ? formatTimeAgo(stats.lastDeployment.time)
                : "Never"}
            </div>
          </div>
        </div>

        {/* Open Issues */}
        <a
          href={`https://github.com/aditya20-b/instincts-website-2026/issues`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
        >
          <div className="text-yellow-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-500">Open Issues</div>
            <div className="font-medium text-gray-900">{stats.openIssues}</div>
          </div>
        </a>

        {/* Open PRs */}
        <a
          href={`https://github.com/aditya20-b/instincts-website-2026/pulls`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
        >
          <div className="text-purple-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-500">Open PRs</div>
            <div className="font-medium text-gray-900">{stats.openPRs}</div>
          </div>
        </a>
      </div>
    </div>
  );
}
