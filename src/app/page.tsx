"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";
import { AutomationCard } from "@/components/landing/AutomationCard";
import { RepoSearchInput } from "@/components/landing/RepoSearchInput";
import { useAuth } from "@/providers/AuthProvider";

const automationCards = [
  {
    title: "PR Review",
    description:
      "Review pull requests with conversations, commits, checks, and file diffs — all interactive.",
    badge: "Interactive",
    templateId: "pr_review",
    comingSoon: false,
  },
  {
    title: "Release Notes",
    description:
      "Draft polished release notes from merged PRs with links and contributors.",
    badge: "Weekly",
    templateId: "release_notes",
    comingSoon: false,
  },
  {
    title: "Standup Summary",
    description: "Summarize yesterday's git activity for standup.",
    badge: "Daily",
    templateId: "standup",
    comingSoon: false,
  },
  {
    title: "CI Analysis",
    description:
      "Summarize CI failures and flaky tests; suggest top fixes.",
    badge: "Trigger",
    templateId: "ci_report",
    comingSoon: false,
  },
  {
    title: "Bug Scanner",
    description:
      "Scan recent commits for likely bugs and propose minimal fixes.",
    badge: "Daily",
    templateId: "bug_scan",
    comingSoon: false,
  },
  {
    title: "Dependency Drift",
    description:
      "Detect dependency and SDK drift and propose a minimal alignment plan.",
    badge: "Monthly",
    templateId: "dependency_drift",
    comingSoon: true,
  },
];

export default function Home() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState("");
  const { user, isLoading, login, logout } = useAuth();
  const router = useRouter();

  // Load selected repo from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("devpilot-repo");
    if (saved) setSelectedRepo(saved);
  }, []);

  const handleRepoChange = (repo: string) => {
    setSelectedRepo(repo);
    localStorage.setItem("devpilot-repo", repo);
  };

  const displayedCards = isExpanded ? automationCards : automationCards.slice(0, 3);

  const handleCardClick = (card: (typeof automationCards)[number]) => {
    if (card.comingSoon) return;
    if (!selectedRepo) return;
    router.push(`/automate?template=${card.templateId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="landing-page">
        <main className="landing-content">
          <AnimatedLogo />
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <div className="lov-spinner" />
          </div>
        </main>
      </div>
    );
  }

  // Not authenticated — show login
  if (!user) {
    return (
      <div className="landing-page">
        <main className="landing-content">
          <AnimatedLogo />

          <div className="flex flex-col items-center gap-3 mb-4">
            <h1 className="landing-title">Ship it</h1>
            <p style={{ fontSize: "0.9rem", color: "#6F6F6F", textAlign: "center", maxWidth: "360px" }}>
              Sign in with GitHub to automate your repos
            </p>
          </div>

          <button className="neu-login-btn" onClick={login}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Sign in with GitHub
          </button>
        </main>
      </div>
    );
  }

  // Authenticated — show user menu + repo search + cards
  return (
    <div className="landing-page">
      <main className="landing-content">
        {/* User menu — top right */}
        <div className="neu-user-menu">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="neu-user-avatar"
          />
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#282828" }}>
            {user.login}
          </span>
          <button className="neu-logout-btn" onClick={logout} title="Sign out">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        <AnimatedLogo />

        <div className="flex flex-col items-center gap-3 mb-4">
          <h1 className="landing-title">Ship it</h1>
          <RepoSearchInput
            selectedRepo={selectedRepo}
            onRepoChange={handleRepoChange}
          />
        </div>

        {!selectedRepo && (
          <p style={{ fontSize: "0.8rem", color: "#999", textAlign: "center", marginBottom: "16px" }}>
            Search and select a repository to get started
          </p>
        )}

        <div className="landing-cards" style={!selectedRepo ? { opacity: 0.4, pointerEvents: "none" } : undefined}>
          {displayedCards.map((card) => (
            <div
              key={card.title}
              onClick={() => handleCardClick(card)}
            >
              <AutomationCard
                title={card.title}
                description={card.comingSoon ? "Coming soon" : card.description}
                badge={card.badge}
                comingSoon={card.comingSoon}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 mb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer"
          >
            {isExpanded ? "Show less" : "Explore more"}
          </button>
        </div>
      </main>
    </div>
  );
}
