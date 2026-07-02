"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { TocSectionStatus } from "@/lib/content";

type MiniTocItem = {
  id: string;
  order: number;
  title: string;
};

type MiniTocProps = {
  items: MiniTocItem[];
  status: TocSectionStatus;
  wordCount: number;
};

function formatWords(words: number) {
  return `${(words / 1000).toFixed(1)}K`;
}

export function MiniToc({ items, status, wordCount }: MiniTocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    if (!items.length || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0.1 },
    );

    for (const item of items) {
      const heading = document.getElementById(item.id);
      if (heading) observer.observe(heading);
    }

    return () => observer.disconnect();
  }, [items]);

  if (!items.length) {
    return null;
  }

  return (
    <aside className="mini-toc" aria-label="Chapter sections">
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <Link
              className={item.id === activeId ? "active" : undefined}
              href={`#${item.id}`}
            >
              <span>{String(item.order).padStart(2, "0")}</span>
              {item.title}
            </Link>
          </li>
        ))}
      </ol>
      <dl>
        <div>
          <dt>WORDS</dt>
          <dd>{formatWords(wordCount)}</dd>
        </div>
        <div>
          <dt>STATUS</dt>
          <dd>{status.toUpperCase()}</dd>
        </div>
      </dl>
    </aside>
  );
}
