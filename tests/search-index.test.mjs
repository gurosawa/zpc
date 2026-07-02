import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import test from "node:test";

test("search index is generated from all chapters", () => {
  execFileSync(process.execPath, ["scripts/build-search-index.mjs"], {
    stdio: "pipe",
  });

  const index = JSON.parse(fs.readFileSync("public/search-index.json", "utf8"));
  const slugs = new Set(index.map((item) => item.chapterSlug));

  assert.equal(slugs.size, 5);
  assert.ok(index.length >= 20);
  assert.ok(index.every((item) => item.anchor && item.text));
});
