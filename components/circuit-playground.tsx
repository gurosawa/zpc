"use client";

import { SandpackCodeEditor, SandpackProvider } from "@codesandbox/sandpack-react";
import { Braces } from "lucide-react";

const circuit = `pragma circom 2.0.0;

template MultiplierClaim() {
  signal private input a;
  signal private input b;
  signal public input expected;

  signal output valid;

  valid <== a * b;
  expected === valid;
}

component main = MultiplierClaim();`;

export function CircuitPlayground() {
  return (
    <section className="interactive-panel" aria-label="Circom toy circuit editor">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Sandpack editor</p>
          <h3>Toy circuit</h3>
        </div>
        <Braces size={20} aria-hidden />
      </div>
      <SandpackProvider
        template="vanilla"
        files={{
          "/circuit.circom": {
            code: circuit,
            active: true,
            readOnly: false,
          },
        }}
        options={{
          autorun: false,
          recompileMode: "delayed",
          recompileDelay: 1000,
        }}
      >
        <div className="sandpack-shell">
          <SandpackCodeEditor showLineNumbers showTabs={false} wrapContent />
        </div>
      </SandpackProvider>
      <p className="panel-note">
        이 편집기는 문법과 구조를 읽기 위한 교육용입니다. 증명 생성, 원격 실행, 외부 API 호출은 하지 않습니다.
      </p>
    </section>
  );
}
