"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTamboThread, useTamboSuggestions } from "@tambo-ai/react";
import { automationTemplates } from "@/lib/automation-templates";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractText(message: any): string {
    if (Array.isArray(message.content)) {
        return message.content
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((p: any) => p.type === "text" && p.text)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((p: any) => p.text)
            .join("\n");
    }
    return typeof message.content === "string" ? message.content : "";
}

function AutomateContent() {
    const searchParams = useSearchParams();
    const templateId = searchParams.get("template");
    const tambo = useTamboThread();
    const { suggestions, accept } = useTamboSuggestions({ maxSuggestions: 3 });

    const [chatInput, setChatInput] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [leftWidth, setLeftWidth] = useState(420);
    const [isDragging, setIsDragging] = useState(false);
    const hasSentInitialRef = useRef(false);
    const layoutRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Resolve the initial prompt from the template query param
    const initialPrompt = (() => {
        if (!templateId) return undefined;
        if (templateId === "pr_review") {
            return "Show me the open pull requests for tambo-ai/tambo so I can review them. Use the PRReview component.";
        }
        const template = automationTemplates.find((t) => t.id === templateId);
        if (!template) return undefined;
        return template.prompt.replace("{repo}", "tambo-ai/tambo");
    })();

    // Find the latest assistant message with a renderedComponent
    const messages = tambo.thread?.messages ?? [];
    const latestRendered = [...messages]
        .reverse()
        .find((msg) => msg.role === "assistant" && msg.renderedComponent);

    // Filter to visible messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const visibleMessages = messages.filter((msg: any) => {
        if (msg.role === "tool") return false;
        if (msg.role === "assistant" && msg.renderedComponent) return true;
        const text = extractText(msg);
        if (!text) return false;
        if (text.startsWith("[{") || text.startsWith('{"')) return false;
        return true;
    });

    const hasMessages = visibleMessages.length > 0;

    // Auto-send initial prompt (ref prevents double-fire in React strict mode)
    useEffect(() => {
        if (initialPrompt && !hasSentInitialRef.current && tambo.isIdle) {
            hasSentInitialRef.current = true;
            tambo.sendThreadMessage(initialPrompt, { streamResponse: true });
        }
    }, [initialPrompt, tambo]);

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging || !layoutRef.current) return;
            const layoutRect = layoutRef.current.getBoundingClientRect();
            const newWidth = e.clientX - layoutRect.left;
            setLeftWidth(Math.max(300, Math.min(newWidth, 560)));
        },
        [isDragging]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            return () => {
                document.body.style.cursor = "";
                document.body.style.userSelect = "";
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleSend = async (text: string) => {
        if (!text.trim() || !tambo.isIdle) return;
        setChatInput("");
        if (inputRef.current) inputRef.current.style.height = "auto";
        await tambo.sendThreadMessage(text, { streamResponse: true });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setChatInput(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(chatInput);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAcceptSuggestion = async (suggestion: any) => {
        await accept({ suggestion, shouldSubmit: true });
    };

    return (
        <div ref={layoutRef} className="lov-layout">
            {/* Left Sidebar */}
            {!isCollapsed ? (
                <div
                    className="lov-sidebar"
                    style={{ width: leftWidth, transition: isDragging ? "none" : undefined }}
                >
                    {/* Header - Project dropdown */}
                    <div className="lov-header">
                        <button className="lov-project-dropdown">
                            <span className="lov-project-icon">&#9889;</span>
                            <span className="lov-project-name">DevPilot</span>
                            <svg className="lov-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>
                        <button
                            className="lov-collapse-btn"
                            onClick={() => setIsCollapsed(true)}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <line x1="9" y1="3" x2="9" y2="21" />
                            </svg>
                        </button>
                    </div>

                    {/* Center - Messages or Welcome */}
                    <div className="lov-center" style={hasMessages ? { alignItems: "flex-start", overflow: "auto", padding: "12px 14px" } : undefined}>
                        {!hasMessages && !initialPrompt ? (
                            <div className="text-center space-y-2 opacity-60">
                                <div className="text-2xl">&#9889;</div>
                                <p className="text-sm font-medium">How can I help you?</p>
                                <p className="text-xs" style={{ color: "var(--lov-muted-soft)" }}>
                                    Describe what you want to build or analyze.
                                </p>
                            </div>
                        ) : (
                            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {visibleMessages.map((msg: any, i: number) => {
                                    const isUser = msg.role === "user";
                                    const text = extractText(msg);
                                    const hasComponent = !!msg.renderedComponent;

                                    if (!isUser && hasComponent && !text) {
                                        return (
                                            <div key={msg.id || i} style={{ display: "flex", justifyContent: "flex-start" }}>
                                                <div className="lov-msg lov-msg-assistant">
                                                    <span style={{ fontSize: "11px", color: "var(--lov-muted-soft)", display: "flex", alignItems: "center", gap: "4px" }}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Component rendered in preview
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (!text) return null;

                                    return (
                                        <div key={msg.id || i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                                            <div className={`lov-msg ${isUser ? "lov-msg-user" : "lov-msg-assistant"}`}>
                                                <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{text}</p>
                                                {hasComponent && (
                                                    <span style={{ fontSize: "11px", color: "var(--lov-muted-soft)", display: "flex", alignItems: "center", gap: "4px", marginTop: "6px", paddingTop: "6px", borderTop: "1px solid var(--lov-border-soft)" }}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Component rendered in preview
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Loading indicator */}
                                {!tambo.isIdle && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 0" }}>
                                        <div className="lov-spinner" />
                                        <span style={{ fontSize: "12px", color: "var(--lov-muted)" }}>
                                            {tambo.generationStage === "STREAMING_RESPONSE"
                                                ? "Generating..."
                                                : tambo.generationStage === "CHOOSING_COMPONENT"
                                                    ? "Choosing component..."
                                                    : tambo.generationStage === "HYDRATING_COMPONENT"
                                                        ? "Rendering..."
                                                        : "Thinking..."}
                                        </span>
                                    </div>
                                )}

                                {/* Suggestions */}
                                {tambo.isIdle && suggestions && suggestions.length > 0 && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", paddingTop: "4px" }}>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {suggestions.map((s: any, i: number) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAcceptSuggestion(s)}
                                                className="lov-action-btn"
                                                style={{ fontSize: "11px" }}
                                            >
                                                {s.title || s.content || s.message || "Suggestion"}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Bottom Input Section */}
                    <div className="lov-input-section">
                        <div className="lov-input-box">
                            <textarea
                                ref={inputRef}
                                value={chatInput}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Describe what you want..."
                                rows={1}
                                className="lov-textarea"
                            />
                        </div>
                        <div className="lov-actions">
                            <div className="lov-spacer" />
                            <button
                                className="lov-send-btn"
                                disabled={!chatInput.trim() || !tambo.isIdle}
                                onClick={() => handleSend(chatInput)}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 19V5m0 0l-7 7m7-7l7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="lov-collapsed">
                    <button
                        className="lov-expand-btn"
                        onClick={() => setIsCollapsed(false)}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="9" y1="3" x2="9" y2="21" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Right - Preview */}
            <div className="lov-preview relative group">
                {/* Drag Handle */}
                <div
                    className={`lov-drag-pill ${isDragging ? "active" : ""}`}
                    onMouseDown={() => setIsDragging(true)}
                    title="Drag to resize"
                />

                {latestRendered?.renderedComponent ? (
                    latestRendered.renderedComponent
                ) : (
                    <div className="flex flex-1 items-center justify-center h-full">
                        <div className="text-center space-y-3" style={{ opacity: 0.5 }}>
                            {!tambo.isIdle ? (
                                <>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                        <div className="lov-spinner" />
                                    </div>
                                    <p style={{ fontSize: "13px", color: "var(--lov-muted)" }}>
                                        {tambo.generationStage === "CHOOSING_COMPONENT"
                                            ? "Choosing component..."
                                            : tambo.generationStage === "STREAMING_RESPONSE"
                                                ? "Generating UI..."
                                                : tambo.generationStage === "HYDRATING_COMPONENT"
                                                    ? "Rendering component..."
                                                    : "Processing..."}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: "24px" }}>&#9889;</div>
                                    <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--lov-muted)" }}>
                                        Ask DevPilot to generate a component
                                    </p>
                                    <p style={{ fontSize: "11px", color: "var(--lov-muted-soft)", maxWidth: "280px" }}>
                                        Try &quot;Summarize yesterday&apos;s commits&quot; or &quot;Show me open PRs&quot;
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AutomatePage() {
    return (
        <Suspense
            fallback={
                <div className="lov-layout">
                    <div className="lov-sidebar" style={{ width: 420 }}>
                        <div className="lov-center">
                            <div className="text-center opacity-50">Loading...</div>
                        </div>
                    </div>
                    <div className="lov-preview" />
                </div>
            }
        >
            <AutomateContent />
        </Suspense>
    );
}
