"use client";

interface SuggestionBarProps {
  onSuggestionClick: (suggestion: string) => void;
}

const DEFAULT_SUGGESTIONS = [
  "Generate release notes",
  "Scan for bugs",
  "Check CI status",
  "Weekly update",
];

export function SuggestionBar({ onSuggestionClick }: SuggestionBarProps) {
  return (
    <div className="border-t border-border bg-background/50 px-4 py-3">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Try:</span>
        {DEFAULT_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
