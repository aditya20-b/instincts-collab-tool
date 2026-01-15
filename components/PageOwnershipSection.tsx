"use client";

import { useState, useEffect } from "react";
import { Page, PageOwner } from "@/types/pages";

interface Collaborator {
  id: number;
  username: string;
  avatarUrl: string;
  profileUrl: string;
  role: string;
}

export default function PageOwnershipSection() {
  const [pages, setPages] = useState<Page[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageDescription, setNewPageDescription] = useState("");
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editOwners, setEditOwners] = useState<string[]>([]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/pages");
      const data = await response.json();

      if (response.ok) {
        setPages(data.pages || []);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch pages");
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborators = async () => {
    try {
      const response = await fetch("/api/collaborators");
      const data = await response.json();

      if (response.ok) {
        setCollaborators(data.collaborators || []);
      }
    } catch {
      console.error("Failed to fetch collaborators");
    }
  };

  useEffect(() => {
    fetchPages();
    fetchCollaborators();
  }, []);

  const handleAddPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const owners: PageOwner[] = selectedOwners.map((username) => {
        const collab = collaborators.find((c) => c.username === username);
        return {
          username,
          githubId: username,
          avatarUrl: collab?.avatarUrl,
        };
      });

      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPageName,
          description: newPageDescription,
          owners,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: `Page "${newPageName}" added successfully!`, error: false });
        setNewPageName("");
        setNewPageDescription("");
        setSelectedOwners([]);
        setShowAddForm(false);
        await fetchPages();
      } else {
        setMessage({ text: data.error || "Failed to add page", error: true });
      }
    } catch {
      setMessage({ text: "Failed to add page", error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const owners: PageOwner[] = editOwners.map((username) => {
        const collab = collaborators.find((c) => c.username === username);
        return {
          username,
          githubId: username,
          avatarUrl: collab?.avatarUrl,
        };
      });

      const response = await fetch(`/api/pages/${editingPage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          owners,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: `Page updated successfully!`, error: false });
        setEditingPage(null);
        await fetchPages();
      } else {
        setMessage({ text: data.error || "Failed to update page", error: true });
      }
    } catch {
      setMessage({ text: "Failed to update page", error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePage = async (page: Page) => {
    if (!confirm(`Are you sure you want to delete "${page.name}"?`)) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/pages/${page.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message, error: false });
        await fetchPages();
      } else {
        setMessage({ text: data.error || "Failed to delete page", error: true });
      }
    } catch {
      setMessage({ text: "Failed to delete page", error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleOwner = (username: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditOwners((prev) =>
        prev.includes(username)
          ? prev.filter((u) => u !== username)
          : [...prev, username]
      );
    } else {
      setSelectedOwners((prev) =>
        prev.includes(username)
          ? prev.filter((u) => u !== username)
          : [...prev, username]
      );
    }
  };

  const startEdit = (page: Page) => {
    setEditingPage(page);
    setEditName(page.name);
    setEditDescription(page.description || "");
    setEditOwners(page.owners.map((o) => o.username));
    setShowAddForm(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Page Ownership</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchPages}
            disabled={loading}
            className="text-sm px-3 py-1 border border-gray-400 text-gray-700 bg-white rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingPage(null);
            }}
            className="text-sm px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            {showAddForm ? "Cancel" : "+ Add Page"}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Track who owns which pages and features in the website
      </p>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            message.error
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddPage} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Add New Page</h3>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              placeholder="e.g., Landing Page, Navigation, Footer"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newPageDescription}
              onChange={(e) => setNewPageDescription(e.target.value)}
              placeholder="Brief description of this page/feature"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Owners
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {collaborators.map((collab) => (
                <label
                  key={collab.id}
                  className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-white"
                >
                  <input
                    type="checkbox"
                    checked={selectedOwners.includes(collab.username)}
                    onChange={() => toggleOwner(collab.username)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <img
                    src={collab.avatarUrl}
                    alt={collab.username}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-700">@{collab.username}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || !newPageName}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Page"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Edit Form */}
      {editingPage && (
        <form onSubmit={handleEditPage} className="mb-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Edit Page</h3>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Owners
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {collaborators.map((collab) => (
                <label
                  key={collab.id}
                  className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-white"
                >
                  <input
                    type="checkbox"
                    checked={editOwners.includes(collab.username)}
                    onChange={() => toggleOwner(collab.username, true)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <img
                    src={collab.avatarUrl}
                    alt={collab.username}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-700">@{collab.username}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || !editName}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditingPage(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-gray-500 text-center py-8">Loading pages...</div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : pages.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No pages yet. Click &quot;Add Page&quot; to get started!
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <div
              key={page.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{page.name}</h3>
                  {page.description && (
                    <p className="text-sm text-gray-600 mt-1">{page.description}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => startEdit(page)}
                    disabled={submitting}
                    className="text-sm px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-md disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePage(page)}
                    disabled={submitting}
                    className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {page.owners.length === 0 ? (
                  <span className="text-sm text-gray-400 italic">No owners assigned</span>
                ) : (
                  page.owners.map((owner) => (
                    <div
                      key={owner.username}
                      className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full"
                    >
                      {owner.avatarUrl && (
                        <img
                          src={owner.avatarUrl}
                          alt={owner.username}
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                      <span className="text-sm font-medium text-purple-900">
                        @{owner.username}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                Updated {new Date(page.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Total: {pages.length} page{pages.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
