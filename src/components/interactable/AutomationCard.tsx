"use client";

import type { AutomationCardProps } from "@/lib/schemas";

export function AutomationCard(props: AutomationCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="font-semibold">{props.title}</h3>
      <p className="text-sm text-muted">{props.description}</p>
    </div>
  );
}
