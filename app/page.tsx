"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import DeploymentsSection from "@/components/DeploymentsSection";
import EnvVariablesSection from "@/components/EnvVariablesSection";
import QuickLinks from "@/components/QuickLinks";
import CollaboratorsList from "@/components/CollaboratorsList";
import DashboardStats from "@/components/DashboardStats";
import RecentCommits from "@/components/RecentCommits";
import BranchDeploy from "@/components/BranchDeploy";
import PageOwnershipSection from "@/components/PageOwnershipSection";

type Tab = "deployments" | "preview" | "env" | "team" | "commits" | "links" | "pages";

export default function Home() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("deployments");
  const [collaboratorCheck, setCollaboratorCheck] = useState<{
    loading: boolean;
    isCollaborator: boolean;
    checked: boolean;
  }>({ loading: false, isCollaborator: false, checked: false });
  const [addCollaboratorStatus, setAddCollaboratorStatus] = useState<{
    loading: boolean;
    message: string | null;
    error: boolean;
  }>({ loading: false, message: null, error: false });

  // Check collaborator status when session is available
  useEffect(() => {
    if (session?.user && !collaboratorCheck.checked) {
      checkCollaboratorStatus();
    }
  }, [session, collaboratorCheck.checked]);

  const checkCollaboratorStatus = async () => {
    setCollaboratorCheck({ loading: true, isCollaborator: false, checked: false });

    try {
      const response = await fetch("/api/check-collaborator");
      const data = await response.json();

      setCollaboratorCheck({
        loading: false,
        isCollaborator: data.isCollaborator || false,
        checked: true,
      });
    } catch {
      setCollaboratorCheck({
        loading: false,
        isCollaborator: false,
        checked: true,
      });
    }
  };

  const handleAddCollaborator = async () => {
    setAddCollaboratorStatus({ loading: true, message: null, error: false });

    try {
      const response = await fetch("/api/add-collaborator", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setAddCollaboratorStatus({
          loading: false,
          message: data.message,
          error: false,
        });
        // Re-check collaborator status after adding
        setTimeout(() => {
          setCollaboratorCheck({ ...collaboratorCheck, checked: false });
        }, 2000);
      } else {
        setAddCollaboratorStatus({
          loading: false,
          message: data.error,
          error: true,
        });
      }
    } catch {
      setAddCollaboratorStatus({
        loading: false,
        message: "An unexpected error occurred",
        error: true,
      });
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "deployments", label: "Deployments" },
    { id: "preview", label: "Branch Preview" },
    { id: "commits", label: "Commits" },
    { id: "env", label: "Env Variables" },
    { id: "team", label: "Team" },
    { id: "pages", label: "Pages" },
    { id: "links", label: "Quick Links" },
  ];

  // Not authenticated - show login
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white shadow rounded-lg p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Instincts Collab Tool
              </h1>
              <p className="mt-2 text-gray-600">
                Self-service management for the Instincts 2026 website
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Sign in with GitHub to access the management tools.
              </p>

              <button
                onClick={() => signIn("github")}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Sign in with GitHub</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Instincts Website 2026 Management Tool
          </p>
        </div>
      </div>
    );
  }

  // Authenticated but checking collaborator status
  if (collaboratorCheck.loading || !collaboratorCheck.checked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Checking access...</div>
      </div>
    );
  }

  // Authenticated but not a collaborator - show add collaborator screen
  if (!collaboratorCheck.isCollaborator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white shadow rounded-lg p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Instincts Collab Tool
              </h1>
              <p className="mt-2 text-gray-600">
                Join the repository to access management tools
              </p>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg mb-6">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-sm text-gray-500">
                  @{(session.user as { username?: string }).username}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  You need to be a collaborator on the{" "}
                  <strong>instincts-website-2026</strong> repository to access
                  the management tools.
                </p>
              </div>

              <button
                onClick={handleAddCollaborator}
                disabled={addCollaboratorStatus.loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addCollaboratorStatus.loading
                  ? "Adding..."
                  : "Add me as collaborator"}
              </button>

              {addCollaboratorStatus.message && (
                <div
                  className={`p-3 rounded-md text-sm ${
                    addCollaboratorStatus.error
                      ? "bg-red-50 text-red-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {addCollaboratorStatus.message}
                </div>
              )}

              <button
                onClick={() => signOut()}
                className="w-full text-gray-600 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Instincts Website 2026 Management Tool
          </p>
        </div>
      </div>
    );
  }

  // Authenticated and is a collaborator - show full dashboard
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with user info */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Instincts Collab Tool
            </h1>
            <p className="mt-1 text-gray-600">
              Managing <strong>instincts-website-2026</strong>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {session.user?.name}
              </p>
              <button
                onClick={() => signOut()}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Collaborator badge */}
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-green-800">
              You have collaborator access to{" "}
              <strong>aditya20-b/instincts-website-2026</strong>
            </span>
          </div>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "deployments" && <DeploymentsSection />}
          {activeTab === "preview" && <BranchDeploy />}
          {activeTab === "commits" && <RecentCommits />}
          {activeTab === "env" && <EnvVariablesSection />}
          {activeTab === "team" && <CollaboratorsList />}
          {activeTab === "pages" && <PageOwnershipSection />}
          {activeTab === "links" && <QuickLinks />}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Instincts Website 2026 Management Tool
        </p>
      </div>
    </div>
  );
}
