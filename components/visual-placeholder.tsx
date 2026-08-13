type VisualPlaceholderProps = {
  title: string;
  purpose: string;
  recommended: string;
  mustShow: string;
  alt: string;
  sequence?: string;
  evidence?: string;
  priority?: "must" | "should" | "could";
  status?: "planned" | "research-needed" | "ready-for-production";
};

const priorityLabels = {
  must: "필수",
  should: "권장",
  could: "선택",
} as const;

const statusLabels = {
  planned: "기획 완료",
  "research-needed": "근거 확인 필요",
  "ready-for-production": "제작 준비 완료",
} as const;

export function VisualPlaceholder({
  title,
  purpose,
  recommended,
  mustShow,
  alt,
  sequence,
  evidence,
  priority = "should",
  status = "planned",
}: VisualPlaceholderProps) {
  return (
    <figure
      className="visual-placeholder"
      data-priority={priority}
      data-status={status}
      aria-label={`시각 자료 자리표시자: ${title}`}
    >
      <div className="visual-placeholder-stage" aria-hidden="true">
        <span>VISUAL RESERVED</span>
        <strong>{title}</strong>
        <small>실제 이미지는 아직 제작하지 않음</small>
      </div>

      <figcaption className="visual-placeholder-brief">
        <div className="visual-placeholder-heading">
          <span>시각 자료 제작 브리프</span>
          <span>
            {priorityLabels[priority]} · {statusLabels[status]}
          </span>
        </div>
        <dl>
          <div>
            <dt>이 그림이 답할 질문</dt>
            <dd>{purpose}</dd>
          </div>
          <div>
            <dt>권장 형식</dt>
            <dd>{recommended}</dd>
          </div>
          <div>
            <dt>반드시 표시할 것</dt>
            <dd>{mustShow}</dd>
          </div>
          {sequence ? (
            <div>
              <dt>순서·상태 변화</dt>
              <dd>{sequence}</dd>
            </div>
          ) : null}
          <div>
            <dt>대체 텍스트 초안</dt>
            <dd>{alt}</dd>
          </div>
          {evidence ? (
            <div>
              <dt>근거</dt>
              <dd>{evidence}</dd>
            </div>
          ) : null}
        </dl>
      </figcaption>
    </figure>
  );
}
