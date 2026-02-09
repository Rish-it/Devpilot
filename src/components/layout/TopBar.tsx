"use client";

import { useState, useRef, useEffect } from "react";

interface TopBarProps {
  selectedRepo: string;
  onRepoChange: (repo: string) => void;
}

const PRESET_REPOS = [
  "tambo-ai/tambo",
  "vercel/next.js",
  "facebook/react",
  "microsoft/typescript",
];

export function TopBar({ selectedRepo, onRepoChange }: TopBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState(selectedRepo);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-topbar-bg px-4">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <svg
              className="h-5 w-5 text-white"
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
          <span className="text-lg font-semibold tracking-tight">DevPilot</span>
        </div>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
          Beta
        </span>
      </div>

      {/* Repo Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:border-border-hover hover:bg-card-hover"
        >
          <svg
            className="h-4 w-4 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <span className="max-w-[200px] truncate text-foreground">{selectedRepo}</span>
          <svg
            className={`h-4 w-4 text-muted transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-72 animate-fadeIn rounded-lg border border-border bg-card p-2 shadow-lg">
            <form onSubmit={handleSubmit} className="mb-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="owner/repo"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted outline-none focus:border-accent"
                autoFocus
              />
            </form>
            <div className="border-t border-border pt-2">
              <p className="mb-1 px-2 text-xs text-muted">Suggested repositories</p>
              {PRESET_REPOS.map((repo) => (
                <button
                  key={repo}
                  onClick={() => handleSelectRepo(repo)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-card-hover ${
                    repo === selectedRepo ? "bg-card-active text-accent" : "text-foreground"
                  }`}
                >
                  <svg
                    className="h-4 w-4 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  {repo}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
