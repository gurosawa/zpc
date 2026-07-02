import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const contentDir = path.join(root, "content");
const publicDir = path.join(root, "public");
const outFile = path.join(publicDir, "search-index.json");
const articleDraftDirs = [path.join(contentDir, "articles"), path.join(contentDir, "drafts")];

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripMdxNoise(value) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\{[^}]+\}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function chunksForDocument({
  filePath,
  idPrefix,
  chapterSlug,
  chapterTitle,
  articleSlug,
  articleTitle,
  routePath,
}) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { content } = matter(raw);
  const searchableContent = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\r\n?/g, "\n");
  const blocks = searchableContent.split(/\n[ \t]*\n+/);
  const chunks = [];
  let currentHeading = articleTitle ?? chapterTitle;
  let currentAnchor = slugify(currentHeading);

  for (const block of blocks) {
    const heading = block.match(/^##+\s+(.+)$/m);
    if (heading) {
      currentHeading = heading[1].trim();
      currentAnchor = slugify(currentHeading);
    }

    const text = stripMdxNoise(block.replace(/^##+\s+.+$/m, ""));
    if (text.length < 24) {
      continue;
    }

    chunks.push({
      id: `${idPrefix}-${chunks.length + 1}`,
      chapterSlug,
      chapterTitle,
      articleSlug,
      articleTitle,
      heading: currentHeading,
      anchor: currentAnchor,
      path: routePath,
      text,
    });
  }

  return chunks;
}

function chunksForChapter(fileName) {
  const filePath = path.join(contentDir, fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data } = matter(raw);
  const chapterSlug = String(data.slug);
  const chapterTitle = String(data.title);

  return chunksForDocument({
    filePath,
    idPrefix: chapterSlug,
    chapterSlug,
    chapterTitle,
    routePath: `/guide/${chapterSlug}`,
  });
}

function readArticleDrafts(draftRoot) {
  if (!fs.existsSync(draftRoot)) {
    return [];
  }

  return fs
    .readdirSync(draftRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((chapterEntry) => {
      const chapterSlug = chapterEntry.name;
      const chapterDir = path.join(draftRoot, chapterSlug);

      return fs
        .readdirSync(chapterDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
        .map((entry) => path.join(chapterDir, entry.name));
    });
}

function chunksForArticle(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data } = matter(raw);
  const chapterSlug = String(data.chapterSlug);
  const articleSlug = String(data.articleSlug);
  const articleTitle = String(data.title);
  const chapterTitle = String(data.chapter || chapterSlug);

  return chunksForDocument({
    filePath,
    idPrefix: `${chapterSlug}-${articleSlug}`,
    chapterSlug,
    chapterTitle,
    articleSlug,
    articleTitle,
    routePath: `/guide/${chapterSlug}/${articleSlug}`,
  });
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const chapterIndex = fs.existsSync(contentDir)
  ? fs
      .readdirSync(contentDir)
      .filter((fileName) => fileName.endsWith(".mdx"))
      .flatMap(chunksForChapter)
  : [];

const articleIndex = articleDraftDirs
  .flatMap(readArticleDrafts)
  .sort()
  .flatMap(chunksForArticle);

const index = [...chapterIndex, ...articleIndex];

fs.writeFileSync(outFile, `${JSON.stringify(index, null, 2)}\n`);
console.log(`Wrote ${index.length} search chunks to ${path.relative(root, outFile)}`);
