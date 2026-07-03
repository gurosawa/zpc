import Link from "next/link";
import { GuideShell } from "@/components/guide-shell";
import { getChapterNavItems } from "@/lib/content";

export default function NotFound() {
  return (
    <GuideShell chapters={getChapterNavItems()}>
      <article className="doc-content">
        <h1>문서를 찾을 수 없습니다</h1>
        <p className="lead">요청한 챕터가 없거나 주소가 변경되었습니다.</p>
        <Link className="text-link" href="/">
          홈으로 돌아가기
        </Link>
      </article>
    </GuideShell>
  );
}
