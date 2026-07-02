import assert from "node:assert/strict";
import test from "node:test";
import { validateContentDrafts, requiredDraftHeadings } from "../scripts/validate-content-drafts.mjs";

test("article drafts align with roadmap metadata when present", () => {
  const result = validateContentDrafts();

  assert.deepEqual(result.errors, []);
  assert.ok(requiredDraftHeadings.includes("Core Model"));
  assert.ok(result.drafts.every((draft) => draft.route.startsWith("/guide/")));
});
