import Link from "next/link";
import type { Chapter } from "@/lib/content";
import { SearchDialog } from "@/components/search-dialog";
import { ThemeToggle } from "@/components/theme-toggle";

type GuideShellProps = {
  chapters: Chapter[];
  activeSlug?: string;
  children: React.ReactNode;
};

export function GuideShell({
  chapters,
  activeSlug,
  children,
}: GuideShellProps) {
  const activeChapter = chapters.find((chapter) => chapter.slug === activeSlug);

  return (
    <div className="site-shell">
      <header className="masthead">
        <Link href="/" className="masthead-title" aria-label="Table of Contents">
          {activeChapter ? activeChapter.title : "zkTLS Master Guide."}
        </Link>
        <span className="masthead-version">V1.0</span>
        <div className="masthead-line" aria-hidden />
        <div className="masthead-actions">
          <SearchDialog />
          <span aria-hidden>·</span>
          <ThemeToggle />
        </div>
      </header>
      <main className={activeSlug ? "content-frame article-frame" : "content-frame home-frame"}>
        {children}
      </main>
    </div>
  );
}
