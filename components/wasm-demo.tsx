"use client";

import { Binary } from "lucide-react";
import { useMemo, useState } from "react";
import { TEST_VECTORS, describeWasmRuntime, poseidonHashToy } from "@/wasm";

export function WasmDemo() {
  const [input, setInput] = useState("zkTLS");
  const runtime = useMemo(() => describeWasmRuntime(), []);
  const output = poseidonHashToy(input);

  return (
    <section className="interactive-panel" aria-label="WASM deterministic demo">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">WASM-compatible API</p>
          <h3>결정론적 데모 함수</h3>
        </div>
        <Binary size={20} aria-hidden />
      </div>
      <label className="field-label" htmlFor="wasm-input">
        입력
      </label>
      <input
        id="wasm-input"
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />
      <dl className="hash-output">
        <div>
          <dt>Runtime</dt>
          <dd>{runtime.engine}</dd>
        </div>
        <div>
          <dt>Output</dt>
          <dd>{output}</dd>
        </div>
      </dl>
      <div className="test-vectors">
        {TEST_VECTORS.map((vector) => (
          <button
            type="button"
            key={vector.input || "empty"}
            onClick={() => setInput(vector.input)}
          >
            {vector.input || "빈 문자열"}
          </button>
        ))}
      </div>
      <p className="panel-note">{runtime.note}</p>
    </section>
  );
}
