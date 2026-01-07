"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import DeploymentsSection from "@/components/DeploymentsSection";
import EnvVariablesSection from "@/components/EnvVariablesSection";

type Tab = "collaborator" | "deployments" | "env";

export default function Home() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("deployments");
  const [collaboratorStatus, setCollaboratorStatus] = useState<{
    loading: boolean;
    message: string | null;
    error: boolean;
  }>({ loading: false, message: null, error: false });

  const handleAddCollaborator = async () => {
    setCollaboratorStatus({ loading: true, message: null, error: false });

    try {
      const response = await fetch("/api/add-collaborator", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setCollaboratorStatus({
          loading: false,
          message: data.message,
          error: false,
        });
      } else {
        setCollaboratorStatus({
          loading: false,
          message: data.error,
          error: true,
        });
      }
    } catch {
      setCollaboratorStatus({
        loading: false,
        message: "An unexpected error occurred",
        error: true,
      });
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "deployments", label: "Deployments" },
    { id: "env", label: "Env Variables" },
    { id: "collaborator", label: "Join Repo" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Instincts Collab Tool
          </h1>
          <p className="mt-2 text-gray-600">
            Self-service management for the Instincts 2026 website
          </p>
        </div>

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

          {activeTab === "env" && <EnvVariablesSection />}

          {activeTab === "collaborator" && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Add Yourself as Collaborator
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Sign in with GitHub to add yourself as a collaborator to the
                instincts-website-2026 repository.
              </p>

              {status === "loading" ? (
                <div className="text-gray-500">Loading...</div>
              ) : session ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {session.user?.image && (
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {session.user?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        @{(session.user as { username?: string }).username}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleAddCollaborator}
                    disabled={collaboratorStatus.loading}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {collaboratorStatus.loading
                      ? "Adding..."
                      : "Add me as collaborator"}
                  </button>

                  {collaboratorStatus.message && (
                    <div
                      className={`p-3 rounded-md text-sm ${
                        collaboratorStatus.error
                          ? "bg-red-50 text-red-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {collaboratorStatus.message}
                    </div>
                  )}

                  <button
                    onClick={() => signOut()}
                    className="w-full text-gray-600 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn("github")}
                  className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
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
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Instincts Website 2026 Management Tool
        </p>
      </div>
    </div>
  );
}
