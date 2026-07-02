"use client";

import { Cpu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { poseidonHashToy, wordsForInput } from "@/wasm";

type Engine = "webgpu-compute" | "canvas-fallback";

type WebGPUBuffer = {
  mapAsync(mode: number): Promise<void>;
  getMappedRange(): ArrayBuffer;
  unmap(): void;
};

type WebGPUComputePipeline = {
  getBindGroupLayout(index: number): unknown;
};

type WebGPUComputePass = {
  setPipeline(pipeline: WebGPUComputePipeline): void;
  setBindGroup(index: number, bindGroup: unknown): void;
  dispatchWorkgroups(count: number): void;
  end(): void;
};

type WebGPUCommandEncoder = {
  beginComputePass(): WebGPUComputePass;
  copyBufferToBuffer(
    source: WebGPUBuffer,
    sourceOffset: number,
    destination: WebGPUBuffer,
    destinationOffset: number,
    size: number,
  ): void;
  finish(): unknown;
};

type WebGPUDevice = {
  queue: {
    writeBuffer(buffer: WebGPUBuffer, offset: number, data: Uint32Array): void;
    submit(commandBuffers: unknown[]): void;
  };
  createBuffer(descriptor: { size: number; usage: number }): WebGPUBuffer;
  createShaderModule(descriptor: { code: string }): unknown;
  createComputePipeline(descriptor: {
    layout: "auto";
    compute: { module: unknown; entryPoint: string };
  }): WebGPUComputePipeline;
  createBindGroup(descriptor: {
    layout: unknown;
    entries: Array<{ binding: number; resource: { buffer: WebGPUBuffer } }>;
  }): unknown;
  createCommandEncoder(): WebGPUCommandEncoder;
};

type WebGPU = {
  requestAdapter(): Promise<{ requestDevice(): Promise<WebGPUDevice> } | null>;
};

const gpuBufferUsage = {
  MAP_READ: 1,
  COPY_SRC: 4,
  COPY_DST: 8,
  STORAGE: 128,
} as const;

const gpuMapModeRead = 1;

function toHex(value: number) {
  return (value >>> 0).toString(16).padStart(8, "0");
}

async function computeWithWebGPU(input: string): Promise<string | null> {
  const gpu = (navigator as Navigator & { gpu?: WebGPU }).gpu;
  if (!gpu) {
    return null;
  }

  try {
    const adapter = await gpu.requestAdapter();
    const device = await adapter?.requestDevice();
    if (!device) {
      return null;
    }

    const words = new Uint32Array(wordsForInput(input));
    const inputBuffer = device.createBuffer({
      size: words.byteLength,
      usage: gpuBufferUsage.STORAGE | gpuBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(inputBuffer, 0, words);

    const outputBuffer = device.createBuffer({
      size: 16,
      usage: gpuBufferUsage.STORAGE | gpuBufferUsage.COPY_SRC,
    });
    const readBuffer = device.createBuffer({
      size: 16,
      usage: gpuBufferUsage.COPY_DST | gpuBufferUsage.MAP_READ,
    });

    const shader = device.createShaderModule({
      code: `
        struct Input { words: array<u32> };
        struct Output { values: array<u32, 4> };
        @group(0) @binding(0) var<storage, read> input: Input;
        @group(0) @binding(1) var<storage, read_write> output: Output;

        fn mix32(raw: u32) -> u32 {
          var mixed = raw;
          mixed = (mixed ^ (mixed >> 16u)) * 0x7feb352du;
          mixed = (mixed ^ (mixed >> 15u)) * 0x846ca68bu;
          return mixed ^ (mixed >> 16u);
        }

        fn rotl(value: u32, shift: u32) -> u32 {
          return (value << shift) | (value >> (32u - shift));
        }

        @compute @workgroup_size(1)
        fn main() {
          var h0 = 0x243f6a88u;
          var h1 = 0x85a308d3u;
          var h2 = 0x13198a2eu;
          var h3 = 0x03707344u;
          let count = arrayLength(&input.words);
          for (var i = 0u; i < count; i = i + 1u) {
            let word = input.words[i];
            let round = (i + 1u) * 0x9e3779b9u;
            let value = mix32(word + round);
            h0 = mix32(h0 ^ value);
            h1 = mix32(h1 + (value * 0x85ebca6bu));
            h2 = mix32(h2 ^ rotl(value, (i % 31u) + 1u));
            h3 = mix32(h3 + word + value);
          }
          output.values[0] = h0;
          output.values[1] = h1;
          output.values[2] = h2;
          output.values[3] = h3;
        }
      `,
    });

    const pipeline = device.createComputePipeline({
      layout: "auto",
      compute: { module: shader, entryPoint: "main" },
    });
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: inputBuffer } },
        { binding: 1, resource: { buffer: outputBuffer } },
      ],
    });

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(1);
    pass.end();
    encoder.copyBufferToBuffer(outputBuffer, 0, readBuffer, 0, 16);
    device.queue.submit([encoder.finish()]);

    await readBuffer.mapAsync(gpuMapModeRead);
    const values = new Uint32Array(readBuffer.getMappedRange().slice(0));
    readBuffer.unmap();
    return Array.from(values).map(toHex).join("");
  } catch {
    return null;
  }
}

export function HashLab() {
  const [input, setInput] = useState("membershipTier=gold;points=1200");
  const [hash, setHash] = useState(() => poseidonHashToy(input));
  const [engine, setEngine] = useState<Engine>("canvas-fallback");

  useEffect(() => {
    let cancelled = false;
    computeWithWebGPU(input).then((webgpuHash) => {
      if (cancelled) {
        return;
      }
      if (webgpuHash) {
        setHash(webgpuHash);
        setEngine("webgpu-compute");
      } else {
        setHash(poseidonHashToy(input));
        setEngine("canvas-fallback");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  const particles = useMemo(() => Array.from(wordsForInput(input)), [input]);

  return (
    <section className="interactive-panel" aria-label="WebGPU toy hash lab">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">WebGPU toy hash</p>
          <h3>커밋먼트 파이프라인</h3>
        </div>
        <Cpu size={20} aria-hidden />
      </div>
      <label className="field-label" htmlFor="hash-input">
        로컬 입력
      </label>
      <textarea
        id="hash-input"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={3}
      />
      <div className="particle-track" aria-hidden>
        {particles.slice(0, 18).map((word, index) => (
          <span
            key={`${word}-${index}`}
            style={{
              width: `${18 + (word % 28)}px`,
              opacity: 0.42 + ((word % 41) / 100),
            }}
          />
        ))}
      </div>
      <dl className="hash-output">
        <div>
          <dt>Engine</dt>
          <dd>{engine}</dd>
        </div>
        <div>
          <dt>Commitment</dt>
          <dd>{hash}</dd>
        </div>
      </dl>
      <p className="panel-note">
        WebGPU가 실패하거나 미지원이면 같은 알고리즘의 Canvas/TypeScript fallback을 사용합니다.
      </p>
    </section>
  );
}
