"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";
import { AutomationCard } from "@/components/landing/AutomationCard";
import { RepoSelector } from "@/components/landing/RepoSelector";

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
  const [selectedRepo, setSelectedRepo] = useState("Generate Unit Tests");
  const router = useRouter();

  const displayedCards = isExpanded ? automationCards : automationCards.slice(0, 3);

  const handleCardClick = (card: (typeof automationCards)[number]) => {
    if (card.comingSoon) return;
    router.push(`/automate?template=${card.templateId}`);
  };

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
            <div
              key={card.title}
              onClick={() => handleCardClick(card)}
              className={card.comingSoon ? "cursor-default" : "cursor-pointer"}
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
