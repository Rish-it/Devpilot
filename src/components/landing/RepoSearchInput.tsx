"use client";

import { useState, useRef, useEffect } from "react";

interface RepoResult {
  fullName: string;
  description: string | null;
  stars: number;
  language: string | null;
  owner: string;
  name: string;
}

interface RepoSearchInputProps {
  selectedRepo: string;
  onRepoChange: (repo: string) => void;
}

export function RepoSearchInput({ selectedRepo, onRepoChange }: RepoSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RepoResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/github/search-repos?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          if (!Array.isArray(data)) {
            setResults([]);
          } else {
            setResults(data);
          }
        }
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (repo: RepoResult) => {
    onRepoChange(repo.fullName);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  function formatStars(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  }

  return (
    <div className="neu-repo-search-container" ref={containerRef}>
      {/* Selected repo display */}
      {selectedRepo && !isOpen && (
        <button
          className="neu-repo-selected"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ opacity: 0.5, flexShrink: 0 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="neu-repo-selected-name">{selectedRepo}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ opacity: 0.4, flexShrink: 0 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Search input */}
      {(isOpen || !selectedRepo) && (
        <div className="neu-repo-search-input-wrap">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ opacity: 0.4, flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="neu-repo-search-input"
            placeholder="Search any public repo..."
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            autoFocus={isOpen}
          />
          {isSearching && (
            <div className="lov-spinner" style={{ width: 14, height: 14 }} />
          )}
        </div>
      )}

      {/* Dropdown results */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="neu-dropdown" style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "8px", zIndex: 50 }}>
          <div className="neu-dropdown-inner">
            {results.length === 0 && !isSearching && query.length >= 2 && (
              <p style={{ fontSize: "0.75rem", color: "#999", padding: "8px 12px", textAlign: "center" }}>
                No repositories found
              </p>
            )}
            {results.length === 0 && isSearching && (
              <p style={{ fontSize: "0.75rem", color: "#999", padding: "8px 12px", textAlign: "center" }}>
                Searching...
              </p>
            )}
            {results.map((repo) => (
              <button
                key={repo.fullName}
                className={`neu-dropdown-item ${repo.fullName === selectedRepo ? "active" : ""}`}
                onClick={() => handleSelect(repo)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#282828", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {repo.fullName}
                  </div>
                  {repo.description && (
                    <div style={{ fontSize: "0.7rem", color: "#999", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {repo.description}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  {repo.language && (
                    <span style={{ fontSize: "0.6rem", color: "#6F6F6F", fontWeight: 600 }}>
                      {repo.language}
                    </span>
                  )}
                  <span style={{ fontSize: "0.6rem", color: "#999" }}>
                    {formatStars(repo.stars)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
