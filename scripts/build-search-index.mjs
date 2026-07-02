import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const contentDir = path.join(root, "content");
const publicDir = path.join(root, "public");
const outFile = path.join(publicDir, "search-index.json");

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

function chunksForChapter(fileName) {
  const raw = fs.readFileSync(path.join(contentDir, fileName), "utf8");
  const { content, data } = matter(raw);
  const chapterSlug = String(data.slug);
  const chapterTitle = String(data.title);
  const searchableContent = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\r\n?/g, "\n");
  const blocks = searchableContent.split(/\n[ \t]*\n+/);
  const chunks = [];
  let currentHeading = chapterTitle;
  let currentAnchor = slugify(chapterTitle);

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
      id: `${chapterSlug}-${chunks.length + 1}`,
      chapterSlug,
      chapterTitle,
      heading: currentHeading,
      anchor: currentAnchor,
      text,
    });
  }

  return chunks;
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const index = fs.existsSync(contentDir)
  ? fs
      .readdirSync(contentDir)
      .filter((fileName) => fileName.endsWith(".mdx"))
      .flatMap(chunksForChapter)
  : [];

fs.writeFileSync(outFile, `${JSON.stringify(index, null, 2)}\n`);
console.log(`Wrote ${index.length} search chunks to ${path.relative(root, outFile)}`);
