import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { RoadmapArticleDraft } from "@/lib/content";

const contentDir = path.join(process.cwd(), "content");
const articleDraftDirs = [path.join(contentDir, "articles"), path.join(contentDir, "drafts")];

function getArticleDraftPath(chapterSlug: string, articleSlug: string) {
  return (
    articleDraftDirs
      .map((draftDir) => path.join(draftDir, chapterSlug, `${articleSlug}.mdx`))
      .find((candidate) => fs.existsSync(candidate)) ?? null
  );
}

export function getRoadmapArticleDraftBySlugs(
  chapterSlug: string,
  articleSlug: string,
): RoadmapArticleDraft | null {
  const draftPath = getArticleDraftPath(chapterSlug, articleSlug);

  if (!draftPath) {
    return null;
  }

  const raw = fs.readFileSync(draftPath, "utf8");
  const { content, data } = matter(raw);

  return {
    body: content,
    frontmatter: data,
  };
}
