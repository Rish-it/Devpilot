"use client";

import { AutomationGrid } from "@/components/grid/AutomationGrid";
import { ThreadView } from "@/components/thread/ThreadView";

interface MainContentProps {
  activeView: "grid" | "thread";
  selectedRepo: string;
  initialPrompt?: string;
  onRunAutomation: (automationId: string) => void;
  onThreadCreated?: (threadId: string, title: string) => void;
}

export function MainContent({
  activeView,
  selectedRepo,
  initialPrompt,
  onRunAutomation,
  onThreadCreated,
}: MainContentProps) {
  if (activeView === "thread") {
    return (
      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        <ThreadView
          initialPrompt={initialPrompt}
          onThreadCreated={onThreadCreated}
        />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-background">
      <AutomationGrid
        selectedRepo={selectedRepo}
        onRunAutomation={onRunAutomation}
      />
    </main>
  );
}
