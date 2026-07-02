"use client";

import { Network } from "lucide-react";
import { useState } from "react";
import { PipelineDiagram, type PipelineMode } from "@/components/pipeline-diagram";

type Mode = PipelineMode;

const modes: Array<{ id: Mode; label: string; steps: string[] }> = [
  {
    id: "tls12",
    label: "TLS 1.2",
    steps: ["ClientHello", "ServerHello", "Certificate", "Key Exchange", "Finished"],
  },
  {
    id: "tls13",
    label: "TLS 1.3",
    steps: ["ClientHello + KeyShare", "ServerHello", "EncryptedExtensions", "Finished"],
  },
  {
    id: "zktls",
    label: "zkTLS",
    steps: ["Fetch", "Transcript Commit", "Notary Check", "Proof", "Verify"],
  },
];

export function InteractiveTLS() {
  const [mode, setMode] = useState<Mode>("tls13");
  const active = modes.find((item) => item.id === mode) ?? modes[1];

  return (
    <section className="interactive-panel" aria-label="TLS 흐름 SVG 다이어그램">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">SVG flow diagram</p>
          <h3>핸드셰이크 흐름 비교</h3>
        </div>
        <Network size={20} aria-hidden />
      </div>
      <div className="segmented-control" aria-label="TLS 모드 선택">
        {modes.map((item) => (
          <button
            type="button"
            key={item.id}
            className={item.id === mode ? "selected" : ""}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="tls-canvas">
        <PipelineDiagram mode={mode} />
      </div>
      <div className="flow-steps">
        {active.steps.map((step, index) => (
          <span key={step}>
            {index + 1}. {step}
          </span>
        ))}
      </div>
      <p className="panel-note">
        모든 흐름은 로컬 SVG line drawing으로 표시합니다. 실제 네트워크 요청이나 외부 TLS 세션은 만들지 않습니다.
      </p>
    </section>
  );
}
