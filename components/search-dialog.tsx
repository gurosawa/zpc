"use client";

import Fuse from "fuse.js";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SearchItem = {
  id: string;
  chapterSlug: string;
  chapterTitle: string;
  articleSlug?: string;
  articleTitle?: string;
  heading: string;
  anchor: string;
  path?: string;
  text: string;
};

function hrefForItem(item: SearchItem) {
  const basePath =
    item.path ?? (item.articleSlug ? `/guide/${item.chapterSlug}/${item.articleSlug}` : `/guide/${item.chapterSlug}`);

  return `${basePath}#${item.anchor}`;
}

export function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/search-index.json")
      .then((response) => (response.ok ? response.json() : []))
      .then((payload: SearchItem[]) => setItems(payload))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ["chapterTitle", "articleTitle", "heading", "text"],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [items],
  );

  const results = query.trim()
    ? fuse.search(query.trim()).slice(0, 8).map((result) => result.item)
    : items.slice(0, 5);

  return (
    <>
      <button
        type="button"
        className="masthead-action-button search-trigger"
        aria-keyshortcuts="Control+K Meta+K"
        onClick={() => setIsOpen(true)}
      >
        SEARCH <span className="shortcut">Ctrl/⌘K</span>
      </button>
      {isOpen ? (
        <div className="search-backdrop" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="문서 검색"
            className="search-dialog"
          >
            <div className="search-row">
              <Search size={18} aria-hidden />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="zkTLS, MPC, 인증서..."
                aria-label="검색어"
              />
              <button
                type="button"
                className="icon-button"
                aria-label="검색 닫기"
                onClick={() => setIsOpen(false)}
              >
                <X size={17} aria-hidden />
              </button>
            </div>
            <div className="search-results" role="list">
              {results.length > 0 ? (
                results.map((item) => (
                  <Link
                    key={item.id}
                    href={hrefForItem(item)}
                    role="listitem"
                    onClick={() => setIsOpen(false)}
                    className="search-result"
                  >
                    <span className="search-result-heading">
                      <strong>{item.heading}</strong>
                      <span className="search-result-leader" aria-hidden />
                      <small>{item.chapterTitle}</small>
                    </span>
                    <span>{item.text.slice(0, 150)}</span>
                  </Link>
                ))
              ) : (
                <p className="empty-state">검색 결과가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
