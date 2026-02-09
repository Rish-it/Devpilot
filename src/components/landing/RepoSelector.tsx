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
    "PR Review",
    "Release Notes",
    "Standup Summary",
    "CI Analysis",
    "Bug Scanner",
    "Dependency Drift",
];

const AUTOMATION_ICONS: Record<string, string> = {
    // Default or "Generate Unit Tests"
    "Generate Unit Tests": "M13 10V3L4 14h7v7l9-11h-7z",
    // Cards
    "PR Review": "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
    "Release Notes": "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    "Standup Summary": "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    "CI Analysis": "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    "Bug Scanner": "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
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
                className="repo-selector-trigger flex items-center justify-center gap-3 px-1 py-1 text-muted-foreground transition-colors hover:text-foreground group"
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
                <div className="neu-dropdown">
                    <div className="neu-dropdown-inner">
                        <p className="neu-dropdown-label">More Automations</p>
                        {PRESET_AUTOMATIONS.map((item) => {
                            const iconPath = AUTOMATION_ICONS[item] || AUTOMATION_ICONS["default"];
                            const isActive = item === selectedRepo;
                            return (
                                <button
                                    key={item}
                                    onClick={() => handleSelectRepo(item)}
                                    className={`neu-dropdown-item ${isActive ? "active" : ""}`}
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
