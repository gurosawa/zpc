import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Chapter = {
  slug: string;
  order: number;
  title: string;
  summary: string;
  body: string;
};

const contentDir = path.join(process.cwd(), "content");

function readChapter(fileName: string): Chapter {
  const raw = fs.readFileSync(path.join(contentDir, fileName), "utf8");
  const { content, data } = matter(raw);

  return {
    slug: String(data.slug),
    order: Number(data.order),
    title: String(data.title),
    summary: String(data.summary),
    body: content,
  };
}

export function getChapters() {
  return fs
    .readdirSync(contentDir)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map(readChapter)
    .sort((a, b) => a.order - b.order);
}

export function getChapterBySlug(slug: string) {
  return getChapters().find((chapter) => chapter.slug === slug) ?? null;
}
