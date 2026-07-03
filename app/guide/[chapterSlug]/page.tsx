import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";
import remarkGfm from "remark-gfm";
import { GuideShell } from "@/components/guide-shell";
import { MiniToc } from "@/components/mini-toc";
import { mdxComponents } from "@/components/mdx-components";
import { getChapterBySlug, getChapters } from "@/lib/content";
import { slugify } from "@/lib/slug";

type PageProps = {
  params: Promise<{ chapterSlug: string }>;
};

function headingsFor(body: string) {
  return Array.from(body.matchAll(/^##\s+(.+)$/gm)).map((match, index) => {
    const title = match[1].trim();

    return {
      id: slugify(title),
      order: index + 1,
      title,
    };
  });
}

export function generateStaticParams() {
  return getChapters().map((chapter) => ({ chapterSlug: chapter.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { chapterSlug: slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    return {};
  }

  return {
    title: `${chapter.title} | zkTLS Master Guide`,
    description: chapter.summary,
  };
}

export default async function ChapterPage({ params }: PageProps) {
  const { chapterSlug: slug } = await params;
  const chapters = getChapters();
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    notFound();
  }

  const chapterIndex = chapters.findIndex((item) => item.slug === chapter.slug);
  const previousChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex >= 0 ? chapters[chapterIndex + 1] ?? null : null;
  const headings = headingsFor(chapter.body);

  return (
    <GuideShell chapters={chapters} activeSlug={chapter.slug}>
      <div className="chapter-layout">
        <article className="doc-content">
          <p className="eyebrow">Chapter {chapter.order}</p>
          <h1>{chapter.title}</h1>
          <p className="lead">{chapter.readerPromise}</p>
          <MDXRemote
            source={chapter.body}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
          <nav className="chapter-footer" aria-label="Chapter navigation">
            {previousChapter ? (
              <Link href={`/guide/${previousChapter.slug}`}>
                <span>Prev</span>
                {previousChapter.title}
              </Link>
            ) : (
              <span />
            )}
            {nextChapter ? (
              <Link href={`/guide/${nextChapter.slug}`}>
                <span>Next</span>
                {nextChapter.title}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </article>
        <MiniToc items={headings} />
      </div>
    </GuideShell>
  );
}
