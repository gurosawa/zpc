import Link from "next/link";
import { GitBranch } from "lucide-react";
import type { Chapter } from "@/lib/content";
import { SearchDialog } from "@/components/search-dialog";
import { ThemeToggle } from "@/components/theme-toggle";

type GuideShellProps = {
  chapters: Chapter[];
  activeSlug?: string;
  children: React.ReactNode;
};

export function GuideShell({ chapters, activeSlug, children }: GuideShellProps) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto grid min-h-screen max-w-[1180px] grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="sidebar">
          <Link href="/" className="site-mark" aria-label="zkTLS Master Guide 홈">
            <span>zkTLS</span>
            <small>Master Guide</small>
          </Link>
          <nav aria-label="챕터 목록" className="chapter-nav">
            <p className="nav-label">Chapters</p>
            {chapters.map((chapter) => {
              const isActive = chapter.slug === activeSlug;
              return (
                <Link
                  key={chapter.slug}
                  href={`/guide/${chapter.slug}`}
                  className={isActive ? "nav-item active" : "nav-item"}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span>{chapter.order}</span>
                  <strong>{chapter.title}</strong>
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">
          <header className="topbar">
            <Link href="/" className="topbar-title">
              zkTLS Master Guide
            </Link>
            <div className="topbar-actions">
              <SearchDialog />
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="icon-button"
                aria-label="GitHub 열기"
                title="GitHub"
              >
                <GitBranch size={17} aria-hidden />
              </a>
              <ThemeToggle />
            </div>
          </header>
          <main className="content-frame">{children}</main>
        </div>
      </div>
    </div>
  );
}
