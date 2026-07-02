"use client";

import Fuse from "fuse.js";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SearchItem = {
  id: string;
  chapterSlug: string;
  chapterTitle: string;
  heading: string;
  anchor: string;
  text: string;
};

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

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ["chapterTitle", "heading", "text"],
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
        className="word-button"
        onClick={() => setIsOpen(true)}
      >
        WORDS
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
                    href={`/guide/${item.chapterSlug}#${item.anchor}`}
                    role="listitem"
                    onClick={() => setIsOpen(false)}
                    className="search-result"
                  >
                    <span>{item.chapterTitle}</span>
                    <strong>{item.heading}</strong>
                    <small>{item.text.slice(0, 150)}</small>
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
