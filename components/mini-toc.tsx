"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type MiniTocItem = {
  id: string;
  order: number;
  title: string;
};

type MiniTocProps = {
  items: MiniTocItem[];
  label?: string;
};

export function MiniToc({ items, label = "Chapter sections" }: MiniTocProps) {
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
    <aside className="mini-toc" aria-label={label}>
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
    </aside>
  );
}
