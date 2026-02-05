"use client";

import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface RepoSelectorProps {
    selectedRepo: string;
    onRepoChange: (repo: string) => void;
    className?: string;
}

const PRESET_AUTOMATIONS = [
    "CI Analysis",
    "Classic Game",
    "Skill Suggestions",
    "Weekly Update",
    "Benchmark Check",
    "Dependency Drift",
];

const AUTOMATION_ICONS: Record<string, string> = {
    // Default or "Generate Unit Tests"
    "Generate Unit Tests": "M13 10V3L4 14h7v7l9-11h-7z",
    // Others
    "CI Analysis": "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    "Classic Game": "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    "Skill Suggestions": "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    "Weekly Update": "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    "Benchmark Check": "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    "Dependency Drift": "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
    // Fallback
    "default": "M13 10V3L4 14h7v7l9-11h-7z"
};

export function RepoSelector({ selectedRepo, onRepoChange, className }: RepoSelectorProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [inputValue, setInputValue] = useState(selectedRepo);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get current icon or default
    const currentIcon = AUTOMATION_ICONS[selectedRepo] || AUTOMATION_ICONS["default"];

    useEffect(() => {
        setInputValue(selectedRepo);
    }, [selectedRepo]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onRepoChange(inputValue.trim());
            setIsDropdownOpen(false);
        }
    };

    const handleSelectRepo = (repo: string) => {
        setInputValue(repo);
        onRepoChange(repo);
        setIsDropdownOpen(false);
    };

    return (
        <div className={twMerge("relative w-full", className)} ref={dropdownRef}>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center gap-3 px-1 py-1 text-muted-foreground transition-colors hover:text-foreground group"
            >
                <svg
                    className="h-6 w-6 shrink-0 md:h-8 md:w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d={currentIcon} />
                </svg>
                <span className="font-semibold text-2xl md:text-4xl tracking-tight">
                    {selectedRepo || "Select..."}
                </span>
                <svg
                    className={clsx("h-5 w-5 shrink-0 transition-transform mt-1", isDropdownOpen && "rotate-180")}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isDropdownOpen && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 top-full z-50 mt-4 w-[300px] rounded-2xl border border-[#e6e2d9] bg-card p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100"
                >
                    <div className="space-y-0.5">
                        <p className="mb-1 px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">More Automations</p>
                        {PRESET_AUTOMATIONS.map((item) => {
                            const iconPath = AUTOMATION_ICONS[item] || AUTOMATION_ICONS["default"];
                            return (
                                <button
                                    key={item}
                                    onClick={() => handleSelectRepo(item)}
                                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground/70 transition-colors hover:text-foreground"
                                >
                                    <svg
                                        className="h-4 w-4 shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                                    </svg>
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
