"use client";

import { TamboProvider } from "@tambo-ai/react";
import { tamboComponents, tamboTools } from "@/lib/tambo";
import { repoContextHelper, currentTimeHelper } from "@/lib/context-helpers";

export function TamboSetup({ children }: { children: React.ReactNode }) {
  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={tamboComponents}
      tools={tamboTools}
      contextHelpers={{
        currentTime: currentTimeHelper,
        repoContext: repoContextHelper,
      }}
      streaming={true}
    >
      {children}
    </TamboProvider>
  );
}
