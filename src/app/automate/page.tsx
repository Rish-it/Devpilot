"use client";

import { PRReview } from "@/components/generative/PRReview";
import { Suspense, useState, useRef, useEffect, useCallback } from "react";

function AutomateContent() {
    const [chatInput, setChatInput] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [leftWidth, setLeftWidth] = useState(420);
    const [isDragging, setIsDragging] = useState(false);
    const layoutRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setChatInput(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
        }
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
                            <span className="lov-project-icon">📦</span>
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

                    {/* Center - Empty state / Welcome */}
                    <div className="lov-center">
                        <div className="text-center space-y-2 opacity-60">
                            <div className="text-2xl">👋</div>
                            <p className="text-sm font-medium">How can I help you?</p>
                        </div>
                    </div>

                    {/* Bottom Input Section */}
                    <div className="lov-input-section">
                        <div className="lov-input-box">
                            <textarea
                                ref={inputRef}
                                value={chatInput}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask Lovable to create a web app that..."
                                rows={1}
                                className="lov-textarea"
                            />
                        </div>
                        <div className="lov-actions">
                            <button className="lov-action-btn">
                                <span>+</span>
                            </button>
                            <button className="lov-action-btn active">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
                                </svg>
                                <span>Visual edits</span>
                            </button>
                            <button className="lov-action-btn">
                                <span>Plan</span>
                            </button>
                            <div className="lov-spacer" />
                            <button className="lov-action-btn icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="M9 12h6M12 9v6" />
                                </svg>
                            </button>
                            <button className="lov-send-btn" disabled={!chatInput.trim()}>
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
                {/* Drag Handle - Pill shape on the edge */}
                <div
                    className={`lov-drag-pill ${isDragging ? "active" : ""}`}
                    onMouseDown={() => setIsDragging(true)}
                    title="Drag to resize"
                />

                <PRReview owner="tambo-ai" repo="tambo" />
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
