"use client";

import { useState, useEffect } from "react";

interface EnvVariable {
  id: string;
  key: string;
  target: string[];
  type: string;
  createdAt: number;
  updatedAt: number;
}

export default function EnvVariablesSection() {
  const [envs, setEnvs] = useState<EnvVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ key: "", value: "" });
  const [editValue, setEditValue] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const fetchEnvs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vercel/env");
      const data = await response.json();

      if (response.ok) {
        setEnvs(data.envs);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch environment variables");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setMessage(null);

      const response = await fetch("/api/vercel/env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message, error: false });
        setFormData({ key: "", value: "" });
        setShowAddForm(false);
        fetchEnvs();
      } else {
        setMessage({ text: data.error, error: true });
      }
    } catch {
      setMessage({ text: "Failed to create environment variable", error: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      setActionLoading(true);
      setMessage(null);

      const response = await fetch(`/api/vercel/env/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: editValue }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message, error: false });
        setEditingId(null);
        setEditValue("");
        fetchEnvs();
      } else {
        setMessage({ text: data.error, error: true });
      }
    } catch {
      setMessage({ text: "Failed to update environment variable", error: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, key: string) => {
    if (!confirm(`Are you sure you want to delete ${key}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      setMessage(null);

      const response = await fetch(`/api/vercel/env/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message, error: false });
        fetchEnvs();
      } else {
        setMessage({ text: data.error, error: true });
      }
    } catch {
      setMessage({ text: "Failed to delete environment variable", error: true });
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvs();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Environment Variables</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchEnvs}
            disabled={loading}
            className="text-sm px-3 py-1 border border-gray-400 text-gray-700 bg-white rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-sm px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            {showAddForm ? "Cancel" : "Add New"}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Note: After adding/updating env variables, you need to redeploy for changes to take effect.
      </p>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            message.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="grid gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key (e.g., API_KEY)
              </label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                placeholder="MY_API_KEY"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="secret_value_here"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              {actionLoading ? "Creating..." : "Create Variable"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-gray-500 text-center py-8">Loading environment variables...</div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : envs.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No environment variables found</div>
      ) : (
        <div className="space-y-2">
          {envs.map((env) => (
            <div
              key={env.id}
              className="border border-gray-200 rounded-lg p-3 flex justify-between items-center"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-medium text-gray-900">{env.key}</span>
                  <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                    {env.type}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Targets: {env.target.join(", ")} | Updated: {formatDate(env.updatedAt)}
                </div>

                {/* Edit Form */}
                {editingId === env.id && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="New value"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => handleUpdate(env.id)}
                      disabled={actionLoading}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditValue("");
                      }}
                      className="px-2 py-1 border border-gray-400 text-gray-700 bg-white rounded text-xs hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {editingId !== env.id && (
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => {
                      setEditingId(env.id);
                      setEditValue("");
                    }}
                    className="text-xs px-2 py-1 border border-gray-400 text-gray-700 bg-white rounded hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(env.id, env.key)}
                    disabled={actionLoading}
                    className="text-xs px-2 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
