import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import test from "node:test";

test("search index is generated from all chapters", () => {
  execFileSync(process.execPath, ["scripts/build-search-index.mjs"], {
    stdio: "pipe",
  });

  const index = JSON.parse(fs.readFileSync("public/search-index.json", "utf8"));
  const chapterItems = index.filter((item) => !item.articleSlug);
  const articleItems = index.filter((item) => item.articleSlug);
  const slugs = new Set(chapterItems.map((item) => item.chapterSlug));

  assert.equal(slugs.size, 5);
  assert.ok(index.length >= 20);
  assert.ok(index.every((item) => item.anchor && item.path && item.text));
  assert.ok(chapterItems.every((item) => item.path === `/guide/${item.chapterSlug}`));
  assert.ok(
    articleItems.every((item) => item.path === `/guide/${item.chapterSlug}/${item.articleSlug}`),
  );

  if (fs.existsSync("content/drafts")) {
    assert.ok(articleItems.some((item) => item.path === "/guide/security-thinking/cia-triad"));
  }
});
