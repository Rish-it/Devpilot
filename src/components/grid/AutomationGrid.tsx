"use client";

import { automationTemplates, AutomationTemplate } from "@/lib/automation-templates";

interface AutomationGridProps {
  selectedRepo: string;
  onRunAutomation: (automationId: string) => void;
}

export function AutomationGrid({
  selectedRepo,
  onRunAutomation,
}: AutomationGridProps) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5">
            <svg
              className="h-8 w-8 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight">Automations</h1>
          <p className="max-w-md text-muted-foreground">
            Automate your development workflow with AI-powered tasks.
            Select a template to get started.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-full bg-card px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">
              Connected to <span className="text-foreground">{selectedRepo}</span>
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {automationTemplates.map((template, index) => (
            <AutomationCard
              key={template.id}
              template={template}
              onClick={() => onRunAutomation(template.id)}
              delay={index * 50}
            />
          ))}
        </div>

        {/* Footer hint */}
        <p className="mt-8 text-center text-sm text-muted">
          Or type a custom request in a new thread
        </p>
      </div>
    </div>
  );
}

interface AutomationCardProps {
  template: AutomationTemplate;
  onClick: () => void;
  delay: number;
}

function AutomationCard({ template, onClick, delay }: AutomationCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-border-hover hover:bg-card-hover hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-card-hover to-card text-xl">
        {getIcon(template.icon)}
      </div>

      {/* Title */}
      <h3 className="font-medium text-foreground">{template.title}</h3>

      {/* Description */}
      <p className="text-sm leading-relaxed text-muted-foreground">
        {template.description}
      </p>

      {/* Hover indicator */}
      <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
        <svg
          className="h-5 w-5 text-accent"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </div>
    </button>
  );
}

function getIcon(icon: string): string {
  const icons: Record<string, string> = {
    calendar: "📅",
    "file-text": "📄",
    bug: "🐛",
    activity: "📊",
    newspaper: "📰",
  };
  return icons[icon] || "⚙️";
}
