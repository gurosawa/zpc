"use client";

import * as THREE from "three";
import { Network } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Mode = "tls12" | "tls13" | "zktls";

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
  const mountRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("tls13");
  const [webgpuAvailable, setWebgpuAvailable] = useState(false);
  const [webglReady, setWebglReady] = useState(true);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      setWebgpuAvailable(Boolean("gpu" in navigator));
    });
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    const width = mount.clientWidth || 720;
    const height = 340;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 7);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
    } catch {
      window.setTimeout(() => setWebglReady(false), 0);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.replaceChildren(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xd03801 });
    const passiveMaterial = new THREE.MeshBasicMaterial({ color: 0x6b6b67 });
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x8b8b85 });
    const packetMaterial = new THREE.MeshBasicMaterial({ color: 0xe8552e });

    const positions = {
      client: new THREE.Vector3(-2.6, -0.8, 0),
      server: new THREE.Vector3(2.6, -0.8, 0),
      notary: new THREE.Vector3(0, 1.35, 0),
    };

    function sphere(position: THREE.Vector3, material: THREE.Material) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 32), material);
      mesh.position.copy(position);
      group.add(mesh);
      return mesh;
    }

    sphere(positions.client, nodeMaterial);
    sphere(positions.server, nodeMaterial);
    const notary = sphere(positions.notary, mode === "zktls" ? nodeMaterial : passiveMaterial);
    notary.visible = mode === "zktls";

    const mainLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([positions.client, positions.server]),
      lineMaterial,
    );
    group.add(mainLine);

    const notaryLineA = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([positions.client, positions.notary]),
      lineMaterial,
    );
    const notaryLineB = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([positions.notary, positions.server]),
      lineMaterial,
    );
    notaryLineA.visible = mode === "zktls";
    notaryLineB.visible = mode === "zktls";
    group.add(notaryLineA, notaryLineB);

    const packet = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), packetMaterial);
    group.add(packet);

    const startedAt = performance.now();
    let frame = 0;

    function animate() {
      const elapsed = (performance.now() - startedAt) / 1000;
      const route =
        mode === "zktls"
          ? [positions.client, positions.notary, positions.server, positions.notary, positions.client]
          : [positions.client, positions.server, positions.client];
      const segment = Math.floor(elapsed * 0.75) % (route.length - 1);
      const localT = (elapsed * 0.75) % 1;
      packet.position.lerpVectors(route[segment], route[segment + 1], localT);
      group.rotation.y = Math.sin(elapsed * 0.22) * 0.18;
      frame = window.requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();

    const resizeObserver = new ResizeObserver(([entry]) => {
      const nextWidth = entry.contentRect.width || width;
      camera.aspect = nextWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, height);
    });
    resizeObserver.observe(mount);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.dispose();
      mount.replaceChildren();
    };
  }, [mode]);

  const active = modes.find((item) => item.id === mode) ?? modes[1];

  return (
    <section className="interactive-panel" aria-label="TLS 흐름 3D 시뮬레이터">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">3D flow simulator</p>
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
      <div className="tls-canvas" ref={mountRef}>
        {!webglReady ? (
          <svg viewBox="0 0 720 340" role="img" aria-label="TLS 흐름 fallback">
            <line x1="110" y1="210" x2="610" y2="210" stroke="currentColor" />
            <circle cx="110" cy="210" r="28" />
            <circle cx="610" cy="210" r="28" />
            {mode === "zktls" ? <circle cx="360" cy="90" r="28" /> : null}
          </svg>
        ) : null}
      </div>
      <div className="flow-steps">
        {active.steps.map((step, index) => (
          <span key={step}>
            {index + 1}. {step}
          </span>
        ))}
      </div>
      <p className="panel-note">
        {webgpuAvailable
          ? "WebGPU 사용 가능 환경입니다. 안정 렌더링은 Three.js WebGL로 수행합니다."
          : "WebGPU 미지원 환경입니다. Three.js WebGL 또는 SVG fallback으로 표시합니다."}
      </p>
    </section>
  );
}
