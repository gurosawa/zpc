import Link from "next/link";
import { GuideShell } from "@/components/guide-shell";
import { getChapters } from "@/lib/content";

const tocSections = [
  {
    number: "1.",
    title: "CRYPTOGRAPHIC PRIMITIVES",
    slug: "foundations-of-cryptography",
    items: [
      ["What is a commitment?", "2.4K WORDS"],
      ["Symmetric vs public-key crypto.", "3.1K WORDS"],
      ["Hashes and digital signatures.", "3.7K WORDS"],
      ["MAC, AEAD and AES-GCM.", "2.8K WORDS"],
    ],
  },
  {
    number: "2.",
    title: "TLS AND WEB TRUST",
    slug: "tls-protocol",
    items: [
      ["How HTTPS protects a request.", "2.9K WORDS"],
      ["TLS 1.2 vs TLS 1.3 handshakes.", "4.1K WORDS"],
      ["Certificates and X.509 chains.", "2.6K WORDS"],
      ["Where normal TLS stops short.", "3.0K WORDS"],
    ],
  },
  {
    number: "3.",
    title: "ZERO KNOWLEDGE SYSTEMS",
    slug: "advanced-cryptography",
    items: [
      ["Provers, verifiers and soundness.", "3.3K WORDS"],
      ["SNARKs and STARKs.", "3.8K WORDS"],
      ["MPC and garbled circuits.", "3.4K WORDS"],
      ["Proof statements as circuits.", "2.7K WORDS"],
    ],
  },
  {
    number: "4.",
    title: "ZKTLS ARCHITECTURES",
    slug: "zktls-architecture",
    items: [
      ["From Web2 data to private claims.", "2.8K WORDS"],
      ["Proxy vs MPC designs.", "3.5K WORDS"],
      ["DECO and TLSNotary lineage.", "3.1K WORDS"],
      ["Fetch, prove, verify.", "2.9K WORDS"],
    ],
  },
  {
    number: "5.",
    title: "HANDS-ON IMPLEMENTATION",
    slug: "implementation-and-runtime",
    items: [
      ["WebGPU toy commitment lab.", "3.2K WORDS"],
      ["Deterministic WASM-style runtime.", "2.5K WORDS"],
      ["Toy circuits in Sandpack.", "2.7K WORDS"],
      ["Local safety checklist.", "1.9K WORDS"],
    ],
  },
  {
    number: "6.",
    title: "WRITER BRIEF IDEAS",
    slug: "foundations-of-cryptography",
    items: [
      ["Opus: narrative protocol-first draft.", "BEST"],
      ["Gemini: technical fact-check pass.", "VERIFY"],
      ["Opus: visual analogy expansion.", "ALT"],
      ["Gemini: diagrams and edge cases.", "ALT"],
    ],
  },
];

const briefIdeas = [
  {
    title: "A. Protocol-first master guide",
    body: "추천안. TLS transcript에서 시작해 zkTLS가 왜 필요한지 자연스럽게 도달한다. Opus는 긴 원고와 비유를 쓰고, Gemini는 프로토콜 정확성, 용어, 다이어그램을 검증한다.",
  },
  {
    title: "B. Visual systems guide",
    body: "첨부 이미지 같은 시각 목차를 전면에 둔다. 각 장은 하나의 큰 그림, 하나의 toy model, 하나의 검증 질문으로 끝난다. 학습 속도는 빠르지만 세부 수식은 얕아질 수 있다.",
  },
  {
    title: "C. Implementation workbook",
    body: "제5장 실습을 중심축으로 두고 앞 장을 필요한 만큼만 설명한다. 개발자 친화적이지만 zkTLS 배경 설명은 별도 보강이 필요하다.",
  },
];

export default function Home() {
  const chapters = getChapters();

  return (
    <GuideShell chapters={chapters}>
      <article className="toc-page">
        <section className="toc-grid" aria-label="zkTLS 목차">
          {tocSections.map((section) => (
            <div className="toc-section" key={section.title}>
              <h2>
                <span>{section.number}</span>
                <Link href={`/guide/${section.slug}`}>{section.title}</Link>
              </h2>
              <ul>
                {section.items.map(([label, words]) => (
                  <li key={label}>
                    <Link href={`/guide/${section.slug}`}>
                      <span className="toc-bullet">•</span>
                      <span className="toc-label">{label}</span>
                      <span className="toc-dots" aria-hidden />
                      <span className="toc-words">{words}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="brief-board" aria-label="원고 작성 브리프">
          <div className="brief-title">
            <span>OPUS · GEMINI DRAFT BOARD</span>
            <p>
              목차별 원고는 Opus가 서사와 설명 밀도를 만들고, Gemini가 기술 정확성,
              표, 그림, 누락 조건을 보강하는 방식이 가장 안정적입니다.
            </p>
          </div>
          <div className="brief-grid">
            {briefIdeas.map((idea) => (
              <div className="brief-item" key={idea.title}>
                <h3>{idea.title}</h3>
                <p>{idea.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="chapter-index" aria-label="현재 구현된 챕터">
          {chapters.map((chapter) => (
            <Link key={chapter.slug} href={`/guide/${chapter.slug}`}>
              <span>{String(chapter.order).padStart(2, "0")}</span>
              <strong>{chapter.title}</strong>
              <small>{chapter.summary}</small>
            </Link>
          ))}
        </section>
      </article>
    </GuideShell>
  );
}
