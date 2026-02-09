"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";
import { automationTemplates } from "@/lib/automation-templates";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ChatPanelProps {
  tambo: any;
  initialPrompt?: string;
  onCollapse?: () => void;
}

const SUGGESTION_CHIPS = automationTemplates.map((t) => ({
  label: t.title,
  prompt: t.prompt.replace("{repo}", "tambo-ai/tambo"),
}));

export function ChatPanel({ tambo, initialPrompt, onCollapse }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [hasSentInitial, setHasSentInitial] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messages = tambo.thread?.messages ?? [];

  // Filter to only user and assistant messages with actual text content
  // Skip tool role messages and messages that are just raw JSON/tool results
  const visibleMessages = messages.filter((msg: any) => {
    if (msg.role === "tool") return false;
    // Get text content
    const text = extractText(msg);
    // Skip messages with no text, or messages that look like raw JSON tool output
    if (!text) return false;
    if (text.startsWith("[{") || text.startsWith("{\"")) return false;
    return true;
  });

  const hasMessages = visibleMessages.length > 0;

  // Auto-send initial prompt from landing page
  useEffect(() => {
    if (initialPrompt && !hasSentInitial && tambo.isIdle) {
      setHasSentInitial(true);
      tambo.sendThreadMessage(initialPrompt, { streamResponse: true });
    }
  }, [initialPrompt, hasSentInitial, tambo]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (text: string) => {
    if (!text.trim() || !tambo.isIdle) return;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    await tambo.sendThreadMessage(text, { streamResponse: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
          <svg
            className="h-5 w-5 text-accent-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <span className="text-base font-semibold tracking-tight text-foreground">
          DevPilot
        </span>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Beta
        </span>
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Collapse sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages / Empty State */}
      <div className="chat-messages">
        {!hasMessages && !initialPrompt ? (
          <EmptyState
            onChipClick={(prompt) => handleSend(prompt)}
            isIdle={tambo.isIdle}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {visibleMessages.map((msg: any, i: number) => (
              <MessageBubble key={msg.id || i} message={msg} />
            ))}
            {!tambo.isIdle && (
              <div className="flex items-center gap-2 py-2">
                <LoadingDots />
                <span className="text-xs text-muted-foreground">
                  {tambo.generationStage === "STREAMING_RESPONSE"
                    ? "Generating..."
                    : "Thinking..."}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <form onSubmit={handleSubmit}>
          <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2 transition-colors focus-within:border-border-hover">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want..."
              rows={1}
              className="max-h-[160px] min-h-[40px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder-muted-foreground outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || !tambo.isIdle}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                />
              </svg>
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}

function extractText(message: any): string {
  if (Array.isArray(message.content)) {
    return message.content
      .filter((p: any) => p.type === "text" && p.text)
      .map((p: any) => p.text)
      .join("\n");
  }
  return typeof message.content === "string" ? message.content : "";
}

function EmptyState({
  onChipClick,
  isIdle,
}: {
  onChipClick: (prompt: string) => void;
  isIdle: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <AnimatedLogo />
      <h2 className="landing-title" style={{ fontSize: "1.75rem", marginBottom: "8px" }}>
        What shall we build?
      </h2>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-[280px]">
        Describe your component or app idea, and I&apos;ll generate it instantly.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTION_CHIPS.map((chip) => (
          <button
            key={chip.label}
            onClick={() => onChipClick(chip.prompt)}
            disabled={!isIdle}
            className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border-hover hover:text-foreground disabled:opacity-50"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: any }) {
  const isUser = message.role === "user";
  const text = extractText(message);

  if (!text) return null;

  return (
    <div
      className={`flex animate-slideUp ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isUser
            ? "bg-foreground text-background rounded-br-sm"
            : "bg-background border border-border rounded-bl-sm text-foreground"
          }`}
      >
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "0ms" }} />
      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "150ms" }} />
      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "300ms" }} />
    </div>
  );
}
