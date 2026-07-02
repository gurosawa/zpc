import assert from "node:assert/strict";
import test from "node:test";
import { TEST_VECTORS, poseidonHashToy } from "../wasm/deterministic.mjs";

test("toy hash matches fixed vectors", () => {
  for (const vector of TEST_VECTORS) {
    assert.equal(poseidonHashToy(vector.input), vector.output);
  }
});

test("toy hash is deterministic across repeated calls", () => {
  const input = "membershipTier=gold;points=1200";
  assert.equal(poseidonHashToy(input), poseidonHashToy(input));
});
