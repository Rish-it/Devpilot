"use client";

import { useState } from "react";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";
import { AutomationCard } from "@/components/landing/AutomationCard";
import { RepoSelector } from "@/components/landing/RepoSelector";

const automationCards = [
  {
    title: "Scan recent commits",
    description: "Scan recent commits (since the last run, or last 24h) for likely bugs and propose minimal fixes.",
    badge: "Daily",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Release Notes",
    description: "Draft polished release notes from merged PRs (include links when available).",
    badge: "Weekly",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    title: "Standup Summary",
    description: "Summarize yesterday's git activity for standup.",
    badge: "Daily",
    icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
  },
  {
    title: "CI Analysis",
    description: "Summarize CI failures and flaky tests from the last CI window; suggest top fixes.",
    badge: "Trigger",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Skill Suggestions",
    description: "From recent PRs and reviews, suggest next skills to deepen.",
    badge: "Weekly",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },
  {
    title: "Dependency Drift",
    description: "Detect dependency and SDK drift and propose a minimal alignment plan.",
    badge: "Monthly",
    icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
  },
];

export default function Home() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState("Generate Unit Tests");

  const displayedCards = isExpanded ? automationCards : automationCards.slice(0, 3);

  return (
    <div className="landing-page">
      <main className="landing-content">
        <AnimatedLogo />

        <div className="flex flex-col items-center gap-2 mb-8">
          <h1 className="landing-title">Let's build</h1>
          <RepoSelector
            selectedRepo={selectedRepo}
            onRepoChange={setSelectedRepo}
            className="w-auto min-w-[200px]"
          />
        </div>

        <div className="landing-cards">
          {displayedCards.map((card) => (
            <AutomationCard
              key={card.title}
              title={card.title}
              description={card.description}
              badge={card.badge}
              icon={card.icon}
            />
          ))}
        </div>

        <div className="mt-6 mb-2">
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
