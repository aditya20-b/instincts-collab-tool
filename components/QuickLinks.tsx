"use client";

const GITHUB_OWNER = "aditya20-b";
const GITHUB_REPO = "instincts-website-2026";
const VERCEL_PROJECT = "instincts-website-2026";

interface LinkItem {
  label: string;
  url: string;
  description: string;
  icon: "github" | "vercel" | "external" | "code";
}

const links: LinkItem[] = [
  {
    label: "Production Site",
    url: `https://${VERCEL_PROJECT}.vercel.app`,
    description: "Live website",
    icon: "external",
  },
  {
    label: "GitHub Repository",
    url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`,
    description: "Source code & issues",
    icon: "github",
  },
  {
    label: "Vercel Dashboard",
    url: `https://vercel.com/${GITHUB_OWNER}/${VERCEL_PROJECT}`,
    description: "Deployments & settings",
    icon: "vercel",
  },
  {
    label: "GitHub Actions",
    url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions`,
    description: "CI/CD workflows",
    icon: "code",
  },
  {
    label: "Open Issues",
    url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
    description: "Bug reports & features",
    icon: "github",
  },
  {
    label: "Pull Requests",
    url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/pulls`,
    description: "Code reviews",
    icon: "github",
  },
];

const icons = {
  github: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  vercel: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 22.525H0l12-21.05 12 21.05z" />
    </svg>
  ),
  external: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  code: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
};

export default function QuickLinks() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors group"
          >
            <div className="text-gray-500 group-hover:text-gray-700">
              {icons[link.icon]}
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">{link.label}</div>
              <div className="text-xs text-gray-500">{link.description}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
