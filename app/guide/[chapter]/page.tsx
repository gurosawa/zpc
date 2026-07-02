import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { GuideShell } from "@/components/guide-shell";
import { mdxComponents } from "@/components/mdx-components";
import { getChapterBySlug, getChapters } from "@/lib/content";

type PageProps = {
  params: Promise<{ chapter: string }>;
};

export function generateStaticParams() {
  return getChapters().map((chapter) => ({ chapter: chapter.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { chapter: slug } = await params;
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
  const { chapter: slug } = await params;
  const chapters = getChapters();
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    notFound();
  }

  return (
    <GuideShell chapters={chapters} activeSlug={chapter.slug}>
      <article className="doc-content">
        <p className="eyebrow">Chapter {chapter.order}</p>
        <h1>{chapter.title}</h1>
        <p className="lead">{chapter.summary}</p>
        <MDXRemote source={chapter.body} components={mdxComponents} />
      </article>
    </GuideShell>
  );
}
