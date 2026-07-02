import Link from "next/link";
import type { Chapter } from "@/lib/content";
import { SearchDialog } from "@/components/search-dialog";
import { ThemeToggle } from "@/components/theme-toggle";

type GuideShellProps = {
  chapters: Chapter[];
  activeSlug?: string;
  progressLabel?: string;
  wordsLabel?: string;
  children: React.ReactNode;
};

function formatWords(words: number) {
  return `${(words / 1000).toFixed(1)}K`;
}

export function GuideShell({
  chapters,
  activeSlug,
  progressLabel,
  wordsLabel,
  children,
}: GuideShellProps) {
  const activeChapter = chapters.find((chapter) => chapter.slug === activeSlug);
  const totalWords = chapters.reduce((total, chapter) => total + chapter.expectedWords, 0);

  return (
    <div className="site-shell">
      <header className="masthead">
        <Link href="/" className="masthead-title" aria-label="Table of Contents">
          {activeChapter ? activeChapter.title : "zkTLS Master Guide."}
        </Link>
        <span className="masthead-version">V1.0</span>
        <div className="masthead-line" aria-hidden />
        <div className="masthead-actions">
          <span className="masthead-metric">PROGRESS {progressLabel ?? `${chapters.length}/${chapters.length}`}</span>
          <span aria-hidden>·</span>
          <span className="masthead-metric">WORDS {wordsLabel ?? formatWords(totalWords)}</span>
          <span aria-hidden>·</span>
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
