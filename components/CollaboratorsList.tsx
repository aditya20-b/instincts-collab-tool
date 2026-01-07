"use client";

import { useState, useEffect } from "react";

interface Collaborator {
  id: number;
  username: string;
  avatarUrl: string;
  profileUrl: string;
  role: string;
}

export default function CollaboratorsList() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/collaborators");
      const data = await response.json();

      if (response.ok) {
        setCollaborators(data.collaborators);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch collaborators");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "maintain":
        return "bg-blue-100 text-blue-800";
      case "write":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
        <button
          onClick={fetchCollaborators}
          disabled={loading}
          className="text-sm px-3 py-1 border border-gray-400 text-gray-700 bg-white rounded-md hover:bg-gray-100 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        People with access to the instincts-website-2026 repository
      </p>

      {loading ? (
        <div className="text-gray-500 text-center py-8">Loading team members...</div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : collaborators.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No collaborators found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {collaborators.map((collab) => (
            <a
              key={collab.id}
              href={collab.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <img
                src={collab.avatarUrl}
                alt={collab.username}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  @{collab.username}
                </div>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${getRoleBadge(
                    collab.role
                  )}`}
                >
                  {collab.role}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Total: {collaborators.length} member{collaborators.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
