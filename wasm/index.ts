import {
  TEST_VECTORS,
  poseidonHashToy,
  wordsForInput,
} from "./deterministic.mjs";

export { TEST_VECTORS, poseidonHashToy, wordsForInput };

export function describeWasmRuntime() {
  return {
    engine: "typescript-deterministic-wrapper",
    note: "Rust wasm-pack is represented by the same deterministic API because rustc is not available in this local environment.",
  };
}
