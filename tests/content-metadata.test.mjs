import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content");
const requiredStringFields = [
  "guiding_question",
  "reader_promise",
  "illustration_idea",
  "interactive_idea",
  "visual_key",
];
const allowedStatuses = new Set(["draft", "review", "stable", "planned"]);

test("chapter frontmatter contains p1a editorial metadata", () => {
  const files = fs
    .readdirSync(contentDir)
    .filter((fileName) => fileName.endsWith(".mdx"));

  assert.equal(files.length, 5);

  for (const fileName of files) {
    const raw = fs.readFileSync(path.join(contentDir, fileName), "utf8");
    const { data } = matter(raw);

    assert.ok(allowedStatuses.has(data.status), `${fileName}: invalid status`);
    assert.equal(typeof data.expected_words, "number", `${fileName}: expected_words`);
    assert.ok(data.expected_words > 0, `${fileName}: expected_words must be positive`);
    assert.ok(Array.isArray(data.draft_outline), `${fileName}: draft_outline`);
    assert.ok(data.draft_outline.length >= 4, `${fileName}: draft_outline entries`);

    for (const field of requiredStringFields) {
      assert.equal(typeof data[field], "string", `${fileName}: ${field}`);
      assert.ok(data[field].trim(), `${fileName}: ${field} must not be empty`);
    }
  }
});
