"use client";

import type { WeeklyUpdateProps } from "@/lib/schemas";

export function WeeklyUpdate(props: WeeklyUpdateProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-lg font-semibold">Weekly Update</h3>
      <p className="text-sm text-muted">{props.repoName} &middot; Week of {props.weekOf}</p>
    </div>
  );
}
