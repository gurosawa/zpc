import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { GuideShell } from "@/components/guide-shell";
import { getChapters } from "@/lib/content";

export default function Home() {
  const chapters = getChapters();

  return (
    <GuideShell chapters={chapters}>
      <article className="doc-content">
        <p className="eyebrow">Interactive cryptography notebook</p>
        <h1>zkTLS Master Guide</h1>
        <p className="lead">
          TLS transcript, MPC, 영지식 증명, 로컬 검증 가능한 연산을 하나의 문서 흐름으로
          연결합니다. 모든 실습은 더미 데이터와 브라우저 로컬 시뮬레이션만 사용합니다.
        </p>
        <div className="callout">
          <ShieldCheck size={20} aria-hidden />
          <p>
            실제 금융/소셜 API, 계정 토큰, PII를 입력하지 않습니다. 이 사이트는
            프라이버시 보호 증명과 검증 가능한 계산을 학습하기 위한 로컬 문서입니다.
          </p>
        </div>
        <div className="chapter-grid">
          {chapters.map((chapter) => (
            <Link
              key={chapter.slug}
              href={`/guide/${chapter.slug}`}
              className="chapter-card"
            >
              <span>Chapter {chapter.order}</span>
              <strong>{chapter.title}</strong>
              <small>{chapter.summary}</small>
              <ArrowRight size={16} aria-hidden />
            </Link>
          ))}
        </div>
      </article>
    </GuideShell>
  );
}
