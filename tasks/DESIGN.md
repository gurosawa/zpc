# zkTLS Master Guide — Design Direction

> 이 문서는 구현 전 디자인 의사 결정을 고정하기 위한 것이다. 코드 변경은 하지 않는다.

---

## 1. Design Goal

이 사이트는 SaaS 랜딩페이지가 아니다. **정교하게 조판된 기술 참고서**처럼 보여야 한다. 첫 화면을 열었을 때 독자는 "잘 편집된 원고 뭉치"를 펼쳐 놓은 듯한 밀도감을 느껴야 하며, 히어로 배너나 CTA 버튼이 아니라 **목차와 메타 정보의 격자**가 시선을 지배해야 한다. 종이 위에 Departure Mono, Neo둥근모 Code, D2Coding으로 인쇄된 기술 매뉴얼을 웹에서 열었을 때, 선과 숫자와 점선이 미세하게 살아 움직이는 느낌 — 그것이 이 사이트의 정체성이다.

핵심 은유: **"타이프라이터로 찍은 프로토콜 사양서가 브라우저 안에서 숨 쉬기 시작한 것"**

---

## 2. Reference Analysis

makingsoftware.com에서 가져올 디자인 원칙:

| 원칙 | makingsoftware의 표현 | zkTLS에 재해석할 방향 |
|------|----------------------|---------------------|
| **Editorial table of contents** | 챕터 제목과 세부 항목이 잡지 목차처럼 밀도 높게 배치된다. 텍스트가 주인공이고, 여백이 계층을 만든다. | 3단 그리드 TOC를 유지하되, 각 항목에 word count · guiding question · status label을 dotted leader로 연결한다. |
| **Dotted leaders** | 목차 제목과 페이지 번호 사이를 점선이 연결한다. 인쇄 편집물의 가장 클래식한 장치. | 항목 라벨과 word count 사이를 `border-bottom: dotted`로 연결. hover 시 점선이 미세하게 재계산되듯 흐른다. |
| **Version / progress label** | 상단에 작은 모노 폰트로 버전, 상태, 메타 정보가 터미널 상태 표시처럼 존재한다. | `V1.0`, `PROGRESS`, `WORDS` 라벨을 유지·확장. 각 챕터에 `DRAFT / REVIEW / FINAL` 상태와 word count를 표시한다. |
| **Dense column grid** | 좁은 그리드 안에 텍스트가 촘촘하게 들어가고, 카드나 박스가 아니라 baseline과 rule이 구조를 만든다. | `grid-template-columns: repeat(3, 1fr)` 유지. 항목 사이는 카드가 아니라 수평선(`hr`) + baseline 정렬로 구분한다. |
| **Manual-like tone** | 기술 문서이지만 잡지 편집의 호흡으로 작성된다. 길고 밀도 높은 문단, 문장이 끊기지 않는 서술. | 챕터 콘텐츠는 블로그 톤이 아니라 기술 해설 원고 톤으로 유지. 코드 예제도 인라인 주석으로 설명한다. |
| **Schematic illustrations** | 손으로 그린 듯한 정밀 다이어그램. SVG 기반, 얇은 선, 최소한의 색. | TLS handshake, zkTLS pipeline, circuit 구조를 SVG line drawing으로 그린다. 색은 흑 + accent 1색만. |
| **Content-first whitespace** | 여백이 "비어 있는 것"이 아니라 "계층을 만드는 장치"로 기능한다. | 큰 마진은 섹션 경계에서만 사용. 목차 항목 내부는 촘촘하게 배치한다. |

---

## 3. Visual System

### 3.1 Typography

#### Font Stack 구조

```
Layer A — Departure Mono (영문 technical · lo-fi · 숫자 · 코드)
  적용: 영문 label, chapter number, word count, status tag,
        Latin code token, inline code, eyebrow, metadata, masthead-version
  로드: /fonts/DepartureMono-Regular.woff2 (이미 존재)
  weight: 400 only

Layer B — Neo둥근모 Code (한글 pixel · terminal · editorial meta)
  적용: 한글 제목(h1~h3), 한글이 포함된 TOC label,
        section heading, callout label, 검색 결과 제목,
        한글 editorial metadata
  로드: self-host woff2 권장
  weight: 400 only

Layer C — D2Coding (한글 가독성 fallback · code fallback)
  적용: 한글 본문 fallback, 한글 code/comment fallback,
        Neo둥근모 Code가 긴 문단에서 과하게 픽셀화될 때의 보정
  로드: self-host woff2 권장
  weight: 400 only
```

> **결정 완료**: 폰트 시스템은 Departure Mono + Neo둥근모 Code + D2Coding으로 확정한다. Pretendard/Noto Sans KR 계열은 기본 후보에서 제외한다. Phase 1(p1b)에서 Neo둥근모 Code와 D2Coding을 self-host하고, 로딩 실패 시 시스템 고정폭/한글 fallback으로 내려간다.

#### 적용 범위 매트릭스

| 요소 | 영문 부분 | 한글 부분 | 비고 |
|------|----------|----------|------|
| **h1** (챕터 제목) | Departure Mono | Neo둥근모 Code → D2Coding | 한글 제목은 pixel/editorial 톤 우선. 영문 전용 제목은 Departure Mono. |
| **h2** (섹션 제목) | Departure Mono | Neo둥근모 Code → D2Coding | 혼합 시 font-family 스택에서 자동 fallback. |
| **h3** (소제목) | Departure Mono | Neo둥근모 Code → D2Coding | 상동. |
| **body** (본문 p, li) | Departure Mono fallback | Neo둥근모 Code → D2Coding | 한글 본문은 Neo둥근모 Code를 기본으로 하되 긴 문단 가독성은 D2Coding fallback으로 보완. |
| **label** (TOC words, status, meta) | Departure Mono | Neo둥근모 Code | 한글 editorial meta가 필요하면 Neo둥근모 Code를 사용. |
| **eyebrow** (Chapter N) | Departure Mono | — | 영문/숫자 전용. |
| **code** (인라인/블록) | Departure Mono | D2Coding | 코드는 모노 전용. 한글 주석은 D2Coding fallback. |
| **masthead-title** | Departure Mono | Neo둥근모 Code | serif accent 제거. |
| **.toc-bullet**, **.toc-dots** | Departure Mono | — | 시각 장치. |
| **.callout**, **blockquote** | Departure Mono fallback | Neo둥근모 Code → D2Coding | 읽기 콘텐츠. |

#### CSS 구현 전략

```css
/* 확정 font-family */
--font-technical: 'Departure Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
--font-korean-pixel: 'Neo둥근모 Code', 'D2Coding', 'Apple SD Gothic Neo', 'Malgun Gothic', monospace;
--font-code: 'Departure Mono', 'D2Coding', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

/* 기존 --font-body를 재정의 */
--font-body: var(--font-korean-pixel);

/* 한글 본문 요소에는 pixel/readability stack을 직접 지정 */
.doc-content p,
.doc-content li,
.doc-content blockquote,
.callout p { font-family: var(--font-korean-pixel); }

code,
pre { font-family: var(--font-code); }
```

#### 타이포그래피 스케일

| 용도 | font-size | line-height | letter-spacing | weight | font |
|------|-----------|-------------|----------------|--------|------|
| `h1` (챕터 제목) | 2.8rem (≈31px @11px root) | 1.08 | 0 | 400 | Neo둥근모 Code / Departure |
| `h2` (섹션 제목) | 1.9rem | 1.2 | 0.01em | 400 | Neo둥근모 Code / Departure |
| `h3` (소제목) | 1.5rem | 1.35 | 0 | 400 | Neo둥근모 Code / Departure |
| `body` (본문) | 1.4rem | 1.85 | 0 | 400 | Neo둥근모 Code → D2Coding |
| `label` (TOC words, meta) | 1rem | 1.4 | 0.02em | 400, uppercase | Departure Mono |
| `eyebrow` (Chapter N) | 1rem | 1.25 | 0.02em | 400, uppercase | Departure Mono |
| `code` (인라인/블록) | 1.1rem | 1.55 | 0 | 400 | Departure Mono → D2Coding |

> 본문 line-height를 1.75 → **1.85**로 올린다. 한글은 영문보다 글리프 높이가 크므로 여유가 필요하다.

#### 한영 혼합 Baseline 안정화 규칙

한글 Neo둥근모 Code/D2Coding과 Departure Mono 영문이 같은 줄에 섞일 때 baseline이 깨지는 문제를 방지한다:

1. **`font-size-adjust` 검토**: Departure Mono의 x-height 비율을 기준으로 Neo둥근모 Code/D2Coding의 시각 크기를 미세 조정한다. 브라우저 지원 부족 시 무시되므로 안전하다.
2. **`line-height`를 unitless로 유지**: `1.85`처럼 unitless 값을 사용하여 font-size에 비례하게 한다. `px`이나 `rem` 고정값 금지.
3. **역할 분리**: 영문 technical/number/code는 Departure Mono, 한글 pixel/editorial meta는 Neo둥근모 Code, 한글 code/comment fallback은 D2Coding을 사용한다.
4. **vertical-align 보정**: 인라인에서 Departure Mono `<code>`가 한글 본문 안에 들어갈 때, `vertical-align: -0.05em` 정도의 미세 보정을 적용한다. 정확한 값은 font pairing 후 시각 테스트로 확정.
5. **테스트 기준**: "가나다 ABC 123" 혼합 문장에서 한글 'ㅎ' 하단과 영문 baseline이 시각적으로 정렬되어야 한다.

> 세 폰트 모두 400 weight 중심으로 운용한다. 계층은 크기 · 대소문자 · 색상 · 간격으로만 만든다. bold 금지.

### 3.2 Color

**"종이 위의 잉크"** — 흑백 기반, 포인트 컬러는 1개.

```
Light mode:
  --bg-primary:      #f7f7f5    ← 거의 종이색 (유지)
  --bg-secondary:    #eeeeeb    ← 코드 블록, 보조 배경
  --text-primary:    #050505    ← 짙은 잉크
  --text-secondary:  #60666f    ← 보조 텍스트, leader line
  --accent:          #001eff    ← 제한적 포인트 (링크, 인라인 코드, 활성 상태)
  --border:          #151515    ← 얇은 rule, 강한 경계선
  --border-light:    #c8c8c0    ← dotted leader, 약한 구분선 (신규)
  --rule:            #151515    ← horizontal rule 전용 (border와 동일하되 의미 분리)

Dark mode:
  --bg-primary:      #0d0d0c
  --bg-secondary:    #171716
  --text-primary:    #f0f0ea
  --text-secondary:  #a8a89e
  --accent:          #8fa2ff
  --border:          #e8e8df
  --border-light:    #3a3a35
  --rule:            #e8e8df
```

**금지 색상**: 파랑/보라 그라디언트, gradient blob, 과한 shadow, glassmorphism 어디에도 사용하지 않는다.

### 3.3 Grid & Spacing

```
Root font-size: 11px (유지)
Site shell padding: 1.4rem 2.4rem 5rem (유지)
Max content width: 150rem (유지)

TOC grid: 3-column, gap 4.2rem × 6.2rem (유지)
Chapter page max-width: 78rem (유지)
Sidebar: 없음. 현재 구조는 header + full-width 본문. 유지한다.
```

> makingsoftware 레퍼런스의 사이드바를 따르지 않는다. 현재 masthead + full-width 구조가 "펼쳐진 원고" 은유에 더 적합하다. 챕터 내 네비게이션은 sticky mini-TOC로 해결한다.

### 3.4 Lines & Rules

| 요소 | 스타일 | 용도 |
|------|--------|------|
| **Masthead rule** | `1px solid var(--border)` | 제목 행과 콘텐츠 구분. 첫 로드 시 왼→오른 애니메이션. |
| **Section divider** | `1px solid var(--border)` | h2 상단, 섹션 구분 |
| **Dotted leader** | `1px dotted var(--border-light)` | TOC 항목 라벨 ↔ word count 연결 |
| **Chapter index row** | `1px dotted var(--border-light)` | 하단 챕터 목록 행 구분 |
| **Callout left border** | `3px solid var(--border)` | callout 블록 표시 |

### 3.4.1 Border-Radius 정책

**원칙**: 이 사이트의 시각 언어는 직선과 직각이다. 둥근 카드, SaaS 스타일 pill 버튼, 과한 radius는 편집 디자인 톤을 파괴한다.

**기본값**: `border-radius: 0` — 모든 컨테이너, 패널, 코드 블록, 다이어그램 프레임에 적용.

**예외 허용 (0~2px)**:

| 요소 | 허용 radius | 이유 |
|------|------------|------|
| `<input>`, `<textarea>` | 1px | 텍스트 입력 필드에 미세한 radius를 주면 "클릭 가능한 영역"이라는 affordance가 강해진다. 0px도 기능적으로 문제없지만, 특히 다크 모드에서 border와 배경이 강하게 대비될 때 1px radius가 시각적 거칠음을 줄인다. |
| `:focus-visible` outline | 2px | 키보드 네비게이션 시 focus ring이 콘텐츠 모서리에 딱 붙으면 시각적으로 공격적이다. 2px radius로 outline의 모서리를 살짝 둥글리면 접근성 사용자에게 더 부드러운 시각 피드백을 제공한다. WCAG 2.2 focus indicator 가이드라인과 무관하게 순수 시각 품질 판단. |
| 작은 interactive control (토글, 칩) | 2px | 12px 이하의 매우 작은 터치 타겟에서 0px radius는 의도한 "날카로운" 느낌보다 "깨져 보이는" 느낌에 가깝다. 2px까지만 허용. |

**금지 (변경 없음)**:
- `border-radius` ≥ 4px 어디에서든
- 카드형 컨테이너에 radius
- pill 모양 버튼 (`border-radius: 999px`)
- `box-shadow` + `border-radius` 조합
- 코드 블록, 다이어그램, interactive-panel에 radius

### 3.5 Icon & Diagram Style

- lucide-react 아이콘은 최소한으로만 사용 (검색, 닫기 등 functional 용도).
- 장식 아이콘 금지. 시각 자료는 모두 SVG line drawing으로 직접 제작.
- 다이어그램 색상: `var(--text-primary)` 선 + `var(--accent)` 활성 노드/경로. 면 채우기 최소화.
- 선 두께: 1px or 1.5px. 과한 stroke-width 금지.

---

## 4. Page Architecture

### 4.1 Home / Table of Contents

```
┌──────────────────────────────────────────────────────┐
│ MASTHEAD                                             │
│ [Title: Departure/Neo] [V1.0] ───── PROGRESS · WORDS │
│                         (animated rule)       · MODE │
├──────────────────────────────────────────────────────┤
│                                                      │
│ TOC GRID (3-column)                                  │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│ │ 1.            │ │ 2.            │ │ 3.            │ │
│ │ CRYPTOGRAPHIC │ │ TLS AND WEB  │ │ ZERO KNOW-   │ │
│ │ PRIMITIVES    │ │ TRUST        │ │ LEDGE SYSTEMS│ │
│ │               │ │               │ │               │ │
│ │ • What is a.. │ │ • How HTTPS..│ │ • Provers,.. │ │
│ │   ···· 2.4K W │ │   ···· 2.9K W│ │   ···· 3.3K W│ │
│ │ • Symmetric.. │ │ • TLS 1.2 vs │ │ • SNARKs and │ │
│ │   ···· 3.1K W │ │   ···· 4.1K W│ │   ···· 3.8K W│ │
│ │ ...           │ │ ...          │ │ ...          │ │
│ ├──────────────┤ ├──────────────┤ ├──────────────┤ │
│ │ 4.            │ │ 5.            │ │ 6.            │ │
│ │ ZKTLS ARCHI-  │ │ HANDS-ON     │ │ TRUST MODELS │ │
│ │ TECTURES      │ │ IMPLEMEN-    │ │ & ECOSYSTEM  │ │
│ │               │ │ TATION       │ │               │ │
│ │ ...           │ │ ...          │ │ ...          │ │
│ └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                      │
│ ──────────────────────────────────────── (rule)       │
│ OPUS · GEMINI DRAFT BOARD                            │
│ (brief grid — 유지)                                    │
│                                                      │
│ ──────────────────────────────────────── (rule)       │
│ CHAPTER INDEX (구현된 챕터 목록)                         │
│  01  기초 암호학 ···· 해시, 대칭키, 공개키...              │
│  02  TLS 프로토콜 ···· HTTPS 연결에서...                │
│  ...                                                  │
└──────────────────────────────────────────────────────┘
```

**핵심 변화**:
- 현재 구조를 대부분 유지하되, 각 TOC 항목이 "원고 슬롯"처럼 보이도록 guiding question, status(`DRAFT`), progress indicator를 추가한다.
- hero 문구 없음. 목차 자체가 첫 화면의 주인공.
- 섹션 번호는 타이프라이터 느낌의 큰 숫자(`1.`)를 왼쪽에 고정.

### 4.2 Chapter Page

```
┌──────────────────────────────────────────────────────┐
│ MASTHEAD (챕터 제목으로 전환)                             │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Chapter 01                          ← eyebrow        │
│ 기초 암호학                           ← h1             │
│ 해시, 대칭키, 공개키...                ← lead           │
│                                                      │
│ ┌─ MINI-TOC (sticky, 우측)──┐                        │
│ │ 01 암호학은 비밀보다...      │ ← 현재 섹션 하이라이트   │
│ │ 02 대칭키와 공개키          │                         │
│ │ 03 해시와 디지털 서명       │                         │
│ │ 04 MAC, AEAD, 커밋먼트     │                         │
│ │ ─── ─── ─── ───           │                         │
│ │ WORDS: 2,847              │                         │
│ │ STATUS: DRAFT             │                         │
│ └───────────────────────────┘                         │
│                                                      │
│ ── 01 ──────────────────────── (section rule)         │
│ 본문...                                               │
│                                                      │
│ [코드 블록]                                            │
│                                                      │
│ ── 02 ──────────────────────── (section rule)         │
│ 본문...                                               │
│                                                      │
│ [SVG 다이어그램 — line drawing]                         │
│                                                      │
│ ── PREV / NEXT ─────────────── (nav footer)           │
└──────────────────────────────────────────────────────┘
```

**핵심 변화**:
- `h2` 상단의 rule에 섹션 번호를 삽입한다 (`── 01 ──`).
- 우측에 sticky mini-TOC를 추가. 현재 보고 있는 섹션이 accent 색으로 하이라이트.
- 하단에 word count, status, prev/next 챕터 네비게이션.
- 3D Three.js 시뮬레이터를 SVG 기반 flow diagram으로 교체 검토. 3D는 편집 디자인 톤과 충돌한다. 대안: SVG line drawing + 스크롤 연동 활성화.

### 4.3 Navigation & Search

- **Primary nav**: masthead 제목 클릭 → 홈(TOC)으로 이동 (현재와 동일).
- **챕터 간 이동**: chapter page 하단의 prev/next footer.
- **섹션 내 이동**: sticky mini-TOC (새로 추가).

#### Search UX 재정의

현재 `WORDS` 버튼이 검색 모달을 여는데, 이는 의미적으로 혼란스럽다. `WORDS`는 상태 라벨(총 단어 수 표시)이고, 검색은 별도 트리거로 분리한다.

**Masthead 우측 영역 레이아웃**:

```
PROGRESS 3/8 · WORDS 24.7K · SEARCH ⌘K · MODE
```

| 요소 | 역할 | 동작 |
|------|------|------|
| `PROGRESS 3/8` | 상태 라벨 — 완료 챕터 / 전체 | 클릭 불가. Departure Mono, `--text-secondary`. |
| `WORDS 24.7K` | 상태 라벨 — 총 단어 수 | 클릭 불가. Departure Mono, `--text-secondary`. 페이지 전환 시 숫자가 lerp 애니메이션으로 업데이트. |
| `SEARCH ⌘K` | 검색 트리거 | 클릭 → 검색 모달. `⌘K`는 키보드 힌트로 라벨 옆에 작게 표시. Departure Mono, `--accent` 색상. |
| `MODE` | 다크/라이트 토글 | 클릭 → 즉시 전환 (현재와 동일). |

**검색 트리거 스타일**:
- `SEARCH` 텍스트 + 옆에 `⌘K` 또는 `Ctrl+K`를 작은 command label(`border: 1px solid var(--border-light); padding: 0.15rem 0.4rem; font-size: 0.85rem`)로 표시.
- hover 시 `SEARCH` 텍스트 색상이 `--text-primary`로 진해짐 (baseline shift 없음, 텍스트 라벨이므로).
- 검색 모달 내부: border-radius 0, 결과 항목에 dotted leader로 챕터명 ↔ 섹션 연결.

**키보드**: `Cmd/Ctrl+K` → 검색 모달.

### 4.4 Progress / Words / Meta UI

- Masthead 우측: `PROGRESS 3/8` + `WORDS 24.7K` — 둘 다 **읽기 전용 상태 라벨**. 클릭 동작 없음.
- 각 TOC 항목 우측: `2.4K WORDS` (유지) + `DRAFT` / `REVIEW` / `FINAL` 라벨 (신규).
- Chapter page mini-TOC 하단: 해당 챕터 word count + status.
- 영문/숫자 라벨은 Departure Mono, 한글 editorial meta가 필요한 경우 Neo둥근모 Code를 사용한다. uppercase, `var(--text-secondary)` 색상. **터미널 상태 표시**처럼 건조하게.

---

## 5. Content Model for Chapters

각 챕터 MDX frontmatter에 아래 필드를 추가한다:

```yaml
---
title: "기초 암호학"
slug: "foundations-of-cryptography"
order: 1
status: "DRAFT"                    # DRAFT | REVIEW | FINAL
summary: "해시, 대칭키, 공개키, 서명, MAC, AEAD를 zkTLS 관점에서 다시 정리합니다."
guiding_question: "zkTLS가 필요로 하는 암호학 재료는 무엇이고, 왜 그런 조합이 필요한가?"
reader_promise: "이 장을 읽으면 TLS transcript와 영지식 증명이 왜 해시·대칭키·공개키를 모두 필요로 하는지 직관을 세울 수 있다."
expected_words: 2800
draft_outline:
  - "암호학은 비밀보다 검증의 기술입니다"
  - "대칭키 암호화와 공개키 암호화"
  - "해시 함수와 디지털 서명"
  - "MAC, AEAD, 커밋먼트"
illustration_idea: "AES-GCM 레코드 구조를 얇은 선으로 분해한 SVG 다이어그램. 입력 → nonce → counter → encrypt → tag 흐름."
interactive_idea: "브라우저 내장 crypto.subtle로 입력값의 SHA-256 해시를 실시간 계산하고, 입력이 1글자 바뀔 때 출력이 완전히 달라지는 avalanche 효과를 bar chart로 시각화."
---
```

각 필드의 역할:

| 필드 | 역할 |
|------|------|
| `guiding_question` | 이 챕터가 답해야 할 핵심 질문. 집필 방향타. |
| `reader_promise` | 독자가 이 챕터를 읽고 나면 할 수 있게 되는 것. |
| `expected_words` | 목표 단어 수. TOC에 표시되고 실제 word count와 비교 가능. |
| `draft_outline` | 초안 섹션 목록. 원고 작성 시 가이드. |
| `illustration_idea` | Opus/Gemini가 SVG 다이어그램을 그릴 때 참조할 아이디어. |
| `interactive_idea` | 인터랙티브 데모 아이디어. 구현 난이도와 교육 효과를 기준으로 선별. |

---

## 6. Proposed Table of Contents

6~8개 섹션, 각 섹션 3~5개 article. zkTLS 학습이 자연스럽게 이어지는 순서.

각 섹션에는 최소 1개의 **visual slot** — 목차 영역에 삽입되는 도식/이미지 아이디어 — 이 포함된다. 이 visual slot은 장식이 아니라 **editorial artifact**다. 원고 작성자(Opus/Gemini)가 해당 섹션의 콘텐츠 방향을 시각적으로 확인하고, 글의 밀도와 구조를 잡는 데 쓴다. 목차 페이지에서 visual slot은 섹션 제목 아래 또는 article 목록 옆에 작은 SVG 썸네일(~80×48px)로 표시된다.

---

### Section 1. CRYPTOGRAPHIC PRIMITIVES
> 질문: zkTLS를 이해하려면 어떤 암호학 도구가 필요한가?

**Visual Slot — "Key Anatomy Strip"**: AES-GCM 레코드의 내부를 얇은 선으로 분해한 가로형 strip diagram. nonce | counter | plaintext | → | ciphertext | tag 순서로 각 필드가 좁은 칸으로 나뉜다. 인쇄된 기술 사양서의 비트 필드 다이어그램처럼. 이 strip을 보면 "이 섹션은 암호학 재료의 내부 구조를 다룬다"는 방향이 즉시 잡힌다.

| # | Article | Guiding Question | Words | Diagram Idea |
|---|---------|-----------------|-------|-------------|
| 1.1 | What is a commitment? | 값을 감추면서 나중에 열어 보일 수 있는 구조는 왜 필요한가? | 2,400 | commit-reveal 2단계 시퀀스 다이어그램 |
| 1.2 | Symmetric vs public-key crypto | AES와 ECDH는 TLS에서 각각 어떤 역할을 맡는가? | 3,100 | 대칭키/공개키 키 흐름 비교 split-view |
| 1.3 | Hashes and digital signatures | SHA-256과 ECDSA는 transcript 검증에서 어떻게 쓰이는가? | 3,700 | avalanche effect 시각화 (interactive) |
| 1.4 | MAC, AEAD and AES-GCM | TLS 레코드를 보호하는 AEAD의 내부 구조는 무엇인가? | 2,800 | AES-GCM 레코드 분해 SVG |

---

### Section 2. TLS AND WEB TRUST
> 질문: 브라우저와 서버 사이의 TLS 세션은 정확히 어떤 보장을 제공하는가?

**Visual Slot — "TLS Record Strip"**: TLS 레코드 하나를 가로로 펼친 strip. content type | version | length | encrypted payload | MAC/tag 필드가 좁은 칸으로 나뉜다. 마치 네트워크 패킷 캡처의 hex dump를 정제한 모습. 이 strip은 "이 섹션은 TLS가 실제로 와이어에 내보내는 구조를 다룬다"는 신호.

| # | Article | Guiding Question | Words | Diagram Idea |
|---|---------|-----------------|-------|-------------|
| 2.1 | How HTTPS protects a request | 평문 HTTP가 TLS 레코드로 감싸지는 과정은? | 2,900 | HTTP request → TLS record 변환 SVG |
| 2.2 | TLS 1.2 vs TLS 1.3 handshakes | 핸드셰이크 왕복이 줄어든 이유와 증명 관점의 차이는? | 4,100 | 두 프로토콜 시퀀스 비교 (SVG + 스크롤 연동) |
| 2.3 | Certificates and X.509 chains | 인증서 체인 검증은 zkTLS 증명에 어떤 영향을 주는가? | 2,600 | cert chain trust path SVG |
| 2.4 | Where normal TLS stops short | 제3자 검증이 불가능한 구조적 이유는 무엇인가? | 3,000 | "TLS는 양자 간 신뢰" 개념 다이어그램 |

---

### Section 3. ZERO-KNOWLEDGE FOUNDATIONS
> 질문: 영지식 증명의 핵심 속성은 무엇이고, zkTLS는 그 중 어떤 것을 활용하는가?

**Visual Slot — "Circuit Grid"**: R1CS 제약 조건 매트릭스를 아주 작게 축소한 격자. 행=제약, 열=변수. 대부분 빈 칸이고 드문드문 점이 찍혀 있는 sparse matrix 느낌. 회로의 "밀도"가 시각적으로 드러난다. 이 도식은 "이 섹션은 증명 시스템의 수학적 구조를 다룬다"는 방향을 잡아준다.

| # | Article | Guiding Question | Words | Diagram Idea |
|---|---------|-----------------|-------|-------------|
| 3.1 | Provers, verifiers and soundness | Completeness, Soundness, Zero-knowledge 세 속성의 직관적 의미는? | 3,300 | prover-verifier 대화 시퀀스 |
| 3.2 | SNARKs and STARKs | 두 증명 체계의 tradeoff는 무엇이고, zkTLS에서 각각 어디에 적합한가? | 3,800 | 비교 표 + trusted setup 유무 다이어그램 |
| 3.3 | MPC and garbled circuits | 2PC/MPC가 TLS 키 분할에서 왜 등장하는가? | 3,400 | garbled circuit 회로 게이트 SVG |
| 3.4 | Proof statements as circuits | 산술 회로가 "무엇을 증명할 수 있는가"를 어떻게 정의하는가? | 2,700 | R1CS 제약 조건 시각화 |

---

### Section 4. THE ZKTLS PIPELINE
> 질문: TLS transcript에서 영지식 증명까지, 데이터는 어떤 변환을 거치는가?

**Visual Slot — "Proof Pipeline"**: 이 섹션의 핵심 도식이자 사이트 전체의 대표 다이어그램. request → TLS session → transcript → proof → verifier 5개 노드가 얇은 수평선으로 연결된다. 각 노드는 작은 사각형 + 라벨. 목차 페이지에서는 이 파이프라인이 축소된 썸네일로 표시되고, 챕터 페이지에서는 스크롤 연동으로 점진적 활성화. 이 도식이 "zkTLS의 전체 여정을 한 줄로 요약한 지도"임을 원고 작성자에게 전달한다.

| # | Article | Guiding Question | Words | Diagram Idea |
|---|---------|-----------------|-------|-------------|
| 4.1 | From Web2 data to private claims | 왜 스크린샷이나 API 응답 복사로는 충분하지 않은가? | 2,800 | 신뢰 모델 비교 (screenshot vs zkTLS) |
| 4.2 | Proxy vs MPC architectures | DECO와 TLSNotary의 아키텍처 차이는 무엇인가? | 3,500 | 두 아키텍처 병렬 흐름도 |
| 4.3 | Fetch → Proof → Verify pipeline | 요청, TLS 세션, transcript, 증명, 검증의 전체 파이프라인은? | 3,100 | **핵심 흐름도** — request → TLS session → transcript → proof → verifier. 스크롤에 따라 선이 점진적 활성화. |
| 4.4 | Security models and trust assumptions | 각 설계에서 어떤 당사자를 얼마나 신뢰하는가? | 2,900 | trust assumption 매트릭스 |

---

### Section 5. IMPLEMENTATIONS IN THE WILD
> 질문: 실제 프로젝트들은 zkTLS를 어떻게 구현했고, 어떤 한계가 있는가?

**Visual Slot — "Transcript Receipt"**: TLSNotary가 생성하는 공증 결과물을 모방한 "영수증" 형태 도식. 상단에 세션 ID, 중간에 redacted transcript (일부가 ████로 가려진), 하단에 notary signature와 timestamp. 마치 은행 전표를 스캔한 듯한 건조한 문서 느낌. 이 도식은 "이 섹션은 실제 프로토콜이 만들어내는 결과물을 분석한다"는 방향.

| # | Article | Guiding Question | Words | Diagram Idea |
|---|---------|-----------------|-------|-------------|
| 5.1 | TLSNotary deep dive | TLSNotary의 2PC 기반 키 분할은 어떻게 동작하는가? | 3,400 | TLSNotary 아키텍처 분해 SVG |
| 5.2 | DECO and oracle patterns | DECO의 3자 프로토콜과 오라클 패턴은 어떤 use case에 적합한가? | 3,000 | DECO 프로토콜 시퀀스 |
| 5.3 | Reclaim, zkPass and emerging protocols | 최신 프로젝트들은 어떤 tradeoff를 선택했는가? | 2,800 | 프로토콜 비교 매트릭스 |

---

### Section 6. HANDS-ON LAB
> 질문: 브라우저 안에서 핵심 개념을 직접 만져볼 수 있는가?

**Visual Slot — "Verifier Stamp"**: 증명이 검증 완료되었을 때의 상태를 나타내는 "도장" 형태 도식. 원이 아니라 직사각형 stamp — `VERIFIED · 2026-07-02 · POSEIDON · 32B` 같은 메타데이터가 Departure Mono로 찍혀 있다. 우표나 검인 느낌. 이 도식은 "이 섹션은 실제로 무언가를 실행하고 결과를 확인하는 곳"이라는 신호.

| # | Article | Guiding Question | Words | Diagram Idea |
|---|---------|-----------------|-------|-------------|
| 6.1 | Hash & commitment playground | SHA-256 해시와 커밋먼트의 avalanche 효과를 눈으로 확인할 수 있는가? | 2,500 | interactive: crypto.subtle hash 시각화 |
| 6.2 | Toy circuit in the browser | Circom 회로의 구조를 편집하고 제약 조건을 이해할 수 있는가? | 2,700 | Sandpack + 회로 그래프 SVG |
| 6.3 | WASM deterministic runtime | Rust로 구현한 Poseidon 해시를 브라우저에서 실행할 수 있는가? | 2,500 | WASM 모듈 로드 → 계산 → 결과 흐름 |
| 6.4 | Local safety checklist | 교육용 데모의 보안 경계를 어떻게 설정하는가? | 1,900 | 체크리스트 (텍스트 기반) |

---

### Section 7. TRUST MODELS & ECOSYSTEM
> 질문: zkTLS는 더 넓은 Web3 신뢰 인프라에서 어떤 위치에 있는가?

**Visual Slot — "Trust Layer Stack"**: 계층도. 맨 아래 TLS, 그 위에 zkTLS, 그 위에 on-chain verifier, 맨 위에 application. 각 계층이 얇은 수평 밴드로 나뉘고, 층 사이를 점선 화살표가 연결. 지질학 단면도처럼 "신뢰가 어떻게 쌓이는가"를 시각화. 원고 작성자에게 "이 섹션은 zkTLS를 더 큰 신뢰 인프라 맥락에 놓는다"는 방향.

| # | Article | Guiding Question | Words | Diagram Idea |
|---|---------|-----------------|-------|-------------|
| 7.1 | Oracles, attestations and zkTLS | 오라클 문제와 zkTLS의 관계는 무엇인가? | 2,600 | oracle trust 계층 다이어그램 |
| 7.2 | On-chain verification patterns | 증명을 온체인에서 검증하는 일반적인 패턴은? | 2,400 | smart contract verification flow |
| 7.3 | Privacy, compliance and selective disclosure | 선택 공개는 규제 환경에서 어떤 가능성을 여는가? | 2,800 | selective disclosure venn diagram |

---

### Section 8. APPENDIX & REFERENCE
> 보조 자료

| # | Article | Words |
|---|---------|-------|
| 8.1 | Glossary of terms | 1,200 |
| 8.2 | Protocol comparison matrix | 800 |
| 8.3 | Further reading & sources | 600 |

---

**총 예상 분량**: ~78,000 words (30개 article)

---

## 7. Motion & Interaction Direction

### 원칙

> "Figma로 만든 듯한 정적 편집물이 브라우저 안에서 미세하게 숨 쉬기 시작한다."
> 과한 애니메이션 금지. 모든 모션은 **인쇄물에서 불가능한 것 중 가장 절제된 것**이어야 한다.

### 구체적 인터랙션 명세

#### 7.1 Masthead Rule 그리기
- **트리거**: 첫 로드 (페이지 진입 시 1회)
- **동작**: `.masthead-line`이 `scaleX(0)` → `scaleX(1)`로 왼쪽에서 오른쪽으로 0.8초에 걸쳐 그려진다.
- **구현**: CSS `transform: scaleX()` + `transform-origin: left` + `transition` or `@keyframes`.
- **이징**: `cubic-bezier(0.22, 1, 0.36, 1)` — 처음에 빠르고 끝에서 자연스럽게 감속.

#### 7.2 Dotted Leader Line 반응
- **트리거**: TOC 항목 hover
- **동작**: 항목 라벨과 word count 사이의 dotted leader가 미세하게 "다시 계산되듯" 흐른다. 점선의 `background-position`이 살짝 이동하는 방식.
- **구현**: CSS `background: repeating-linear-gradient(90deg, ...)` + `background-position` transition (0.4s).
- **대안**: `border-bottom: dotted` 대신 background gradient로 전환하여 애니메이션 제어.

#### 7.3 Chapter Number Mechanical Counter
- **트리거**: 각 TOC 섹션이 viewport에 진입 시 (`IntersectionObserver`)
- **동작**: 섹션 번호(`1.`, `2.`, ...)가 `0`에서 목표 숫자까지 mechanical counter처럼 짧게 tick된다. 0.3~0.5초.
- **구현**: JS — `IntersectionObserver`로 감지 → CSS `translateY` 기반 숫자 롤링 또는 JS counter increment.
- **이징**: `steps(N)` 또는 `cubic-bezier` snap 느낌.

#### 7.4 TOC 항목 Hover — Baseline Shift
- **트리거**: TOC 항목 hover
- **동작**: 카드처럼 튀어나오지 **않는다**. 대신 baseline이 살짝 (1~2px) 밀리며, 텍스트 색상이 `--text-primary` → 더 짙은 잉크(opacity 1.0)로 진해진다. "잉크가 진해지는" 느낌.
- **구현**: CSS `transform: translateY(-1px)` + `color` transition (0.2s).
- **금지**: scale, shadow, background-color 변화, border 변화.

#### 7.5 Progress/Words Label 업데이트
- **트리거**: 페이지 전환 시
- **동작**: `WORDS 24.7K` 숫자가 이전 값에서 새 값으로 터미널 상태 표시처럼 빠르게 카운트된다. 0.2~0.3초.
- **구현**: JS — 이전 값 → 현재 값 사이를 lerp하며 `textContent` 업데이트.

#### 7.6 Chapter Page 다이어그램 — SVG Line Drawing
- **트리거**: 다이어그램이 viewport에 진입 시
- **동작**: SVG path가 `stroke-dasharray` + `stroke-dashoffset` 애니메이션으로 선이 그려진다. 0.6~1.2초.
- **구현**: CSS `@keyframes` + `stroke-dashoffset` 또는 JS `IntersectionObserver` → CSS class 토글.

#### 7.7 zkTLS 핵심 흐름도 — 점진적 활성화
- **트리거**: Section 4.3의 파이프라인 흐름도. 스크롤에 따라 활성화.
- **동작**: `request → TLS session → transcript → proof → verifier`가 얇은 선으로 연결되어 있고, 스크롤 위치에 따라 각 단계의 선과 노드가 순차적으로 `var(--accent)` 색으로 활성화된다. 비활성 구간은 `var(--border-light)`.
- **구현**: JS — `IntersectionObserver` 또는 `scroll` event로 진행률 계산 → CSS custom property `--progress`로 전달 → SVG 선 색상 전환.

#### 7.8 Parallax — 극도로 약하게
- **트리거**: 마우스 이동
- **동작**: 배경에 깔린 격자선이나 다이어그램이 마우스 위치에 따라 0.5~1.5px 정도만 미세하게 이동. "인쇄된 도면을 빛 아래에서 기울여 보는 정도".
- **구현**: JS — `mousemove` event → `transform: translate(calc(...), calc(...))` with `will-change: transform`.
- **적용 범위**: 홈 페이지의 배경 요소에만. 텍스트에는 절대 적용하지 않는다.

---

## 8. Implementation Notes

구현을 3개 Phase로 나눈다. 각 Phase는 독립적으로 배포 가능하며, 이전 Phase가 완료되어야 다음으로 진행한다.

---

### Phase 1: Home / Table of Contents Editorial Redesign

> 목표: 첫 화면을 열었을 때 "SaaS 랜딩페이지"가 아니라 "편집된 기술 참고서의 목차"로 보이게 한다.

#### 영향 파일

| 파일 | 변경 내용 | 분류 |
|------|----------|------|
| `app/globals.css` | `--font-technical`, `--font-korean-pixel`, `--font-code` 토큰 추가. `--border-light` 토큰 추가. masthead rule 애니메이션 `@keyframes`. dotted leader를 `background: repeating-linear-gradient`로 변경. TOC hover baseline shift. border-radius 정책 적용 (기본 0, 예외 1~2px). Neo둥근모 Code/D2Coding `@font-face` 선언. | CSS-first |
| `app/page.tsx` | TOC 항목 구조에 `status`, `guiding_question` 필드 추가. 섹션 번호 mechanical counter wrapper. visual slot 썸네일 영역 추가. | React |
| `components/guide-shell.tsx` | masthead 우측을 `PROGRESS · WORDS · SEARCH ⌘K · MODE`로 재구성. `WORDS`를 상태 라벨로, `SEARCH`를 검색 트리거로 분리. word count 집계, PROGRESS 숫자 반영. | React (서버 컴포넌트) |
| `components/search-dialog.tsx` | `WORDS` 버튼 → `SEARCH ⌘K` 버튼으로 변경. border-radius 제거. 결과 항목에 dotted leader 적용. `Cmd/Ctrl+K` 키보드 바인딩 추가. | React (client) |
| `components/toc-counter.tsx` (신규) | 섹션 번호 mechanical counter. `IntersectionObserver`로 viewport 진입 감지 → CSS `translateY` 기반 숫자 롤링. | React (client) |
| `lib/content.ts` | `Chapter` 타입에 `status`, `guiding_question`, `reader_promise`, `expected_words` 필드 추가. | TypeScript |
| `content/*.mdx` | 모든 챕터 frontmatter에 새 필드 추가 (`status`, `guiding_question`, `reader_promise`, `expected_words`, `illustration_idea`, `interactive_idea`). | Content |
| `public/fonts/` | Neo둥근모 Code, D2Coding woff2 파일 추가. Departure Mono는 기존 파일 유지. | Asset |

#### 완료 기준

- [ ] 첫 화면이 3단 TOC 그리드 + dotted leader + word count + status label로 구성된다.
- [ ] `SEARCH ⌘K`가 검색 모달을 열고, `WORDS`는 읽기 전용 상태 라벨이다.
- [ ] masthead rule이 왼→오른 0.8초 애니메이션으로 그려진다.
- [ ] TOC 항목 hover 시 baseline shift + 잉크 진해짐 (카드 튀어나옴 없음).
- [ ] chapter number가 viewport 진입 시 mechanical counter tick.
- [ ] 한글 본문/제목이 Neo둥근모 Code → D2Coding 스택으로 렌더링되고, 영문 technical/number/code label은 Departure Mono.
- [ ] 한영 혼합 문장에서 baseline이 시각적으로 정렬된다.
- [ ] `pnpm dev`로 에러 없이 동작.

#### 리스크

| 리스크 | 심각도 | 대응 |
|--------|--------|------|
| Neo둥근모 Code/D2Coding 웹폰트 로딩 지연 | 중 | p1b에서 self-host 우선. 로딩 실패 시 system monospace/한글 fallback으로 내려간다. |
| Departure Mono + Neo둥근모 Code/D2Coding baseline 불일치 | 중 | `font-size-adjust`, `vertical-align` 미세 보정으로 대응. 최악의 경우 `line-height`를 1.9로 올림. |
| `SEARCH` 분리로 인한 masthead 폭 초과 (모바일) | 하 | 720px 이하에서 `SEARCH` 라벨을 아이콘(🔍)으로 축소. `⌘K` 힌트 숨김. |

---

### Phase 2: Chapter Page Typography, Mini-TOC, Frontmatter Metadata

> 목표: 챕터 페이지가 "잘 조판된 기술 원고"처럼 읽히게 한다.

#### 영향 파일

| 파일 | 변경 내용 | 분류 |
|------|----------|------|
| `app/globals.css` | `.doc-content` 본문 typography를 Neo둥근모 Code → D2Coding 기반으로 재정의. h2 섹션 번호 rule (`── 01 ──`). mini-TOC sticky 스타일. prev/next footer 스타일. `line-height: 1.85` 적용. | CSS-first |
| `app/guide/[chapter]/page.tsx` | mini-TOC 영역 추가. h2에 섹션 번호 삽입. word count / status / guiding question 표시. prev/next footer. | React |
| `components/mini-toc.tsx` (신규) | chapter page sticky mini-TOC. `IntersectionObserver`로 현재 섹션 추적. accent 하이라이트. 하단에 word count + status. | React (client) |
| `components/mdx-components.tsx` | `createHeading`에 섹션 번호 삽입 로직 추가. | React |
| `components/theme-toggle.tsx` | 변경 없음 (유지). | — |

#### 완료 기준

- [ ] 챕터 페이지에 sticky mini-TOC가 우측에 표시되고, 현재 섹션이 accent 하이라이트.
- [ ] h2 상단에 `── 01 ──` 형태의 섹션 번호 rule.
- [ ] 한글 본문이 Neo둥근모 Code → D2Coding, `line-height: 1.85`로 렌더링.
- [ ] 챕터 하단에 prev/next 네비게이션.
- [ ] 챕터 메타 정보 (word count, status, guiding question)가 표시됨.
- [ ] `prefers-reduced-motion: reduce` 시 mini-TOC 전환 애니메이션 비활성화.

#### 리스크

| 리스크 | 심각도 | 대응 |
|--------|--------|------|
| mini-TOC가 좁은 화면에서 본문과 겹침 | 중 | 1040px 이하에서 mini-TOC를 본문 상단 접힘형으로 전환. |
| h2 섹션 번호 자동 계산이 MDX 파싱과 충돌 | 하 | `mdx-components.tsx`에서 render 시점에 counter 증가. SSR/CSR 불일치 가능 → 서버 컴포넌트에서 처리. |

---

### Phase 3: SVG Diagrams and Organic Motion

> 목표: 정적 편집물이 브라우저에서 "미세하게 숨 쉬기 시작한다."

#### 영향 파일

| 파일 | 변경 내용 | 분류 |
|------|----------|------|
| `components/svg-draw.tsx` (신규) | 범용 SVG line drawing wrapper. `IntersectionObserver` → CSS class 토글 → `stroke-dashoffset` 애니메이션. | React (client) |
| `components/pipeline-diagram.tsx` (신규) | zkTLS 핵심 흐름도 SVG + 스크롤 연동. `--progress` CSS custom property로 단계별 활성화. | React (client) |
| `components/interactive-tls.tsx` | Three.js 3D → SVG 2D line drawing으로 교체. `three` 의존성 제거. | React (client) |
| `app/globals.css` | SVG line drawing `@keyframes`. dotted leader hover `background-position` transition. parallax `will-change` 선언. `prefers-reduced-motion` 미디어 쿼리 일괄 적용. | CSS |
| `package.json` | `three`, `@types/three` 의존성 제거 (SVG 교체 시). | Config |
| `content/*.mdx` | SVG 다이어그램 컴포넌트 삽입 (기존 mermaid 코드 블록 교체). | Content |

#### 완료 기준

- [ ] SVG 다이어그램이 viewport 진입 시 line drawing 방식 (0.6~1.2초)으로 그려진다.
- [ ] zkTLS 핵심 흐름도가 스크롤에 따라 5단계로 점진적 활성화.
- [ ] dotted leader hover 시 점선 `background-position`이 0.4초로 흐른다.
- [ ] parallax가 홈 페이지 배경 요소에 0.5~1.5px만 적용 (텍스트 미적용).
- [ ] `prefers-reduced-motion: reduce` 시 모든 애니메이션 비활성화.
- [ ] Three.js → SVG 교체 후 `three` 의존성이 `package.json`에서 제거됨.
- [ ] 모든 모션이 글 읽기를 방해하지 않는다.

#### 리스크

| 리스크 | 심각도 | 대응 |
|--------|--------|------|
| Three.js 제거 시 기존 TLS 시뮬레이터 기능 손실 | 중 | SVG 대안이 동일한 정보를 전달하는지 먼저 프로토타입. 사용자가 3D 유지를 원하면 `scene.background`를 투명으로 변경하고 스타일만 맞춤. |
| 스크롤 연동 흐름도의 성능 (repaint) | 하 | CSS custom property + `will-change: opacity, stroke` 사용. `requestAnimationFrame` 기반 throttle. |
| SVG line drawing이 복잡한 다이어그램에서 느려짐 | 하 | `stroke-dasharray` 길이를 path 수에 비례하여 최적화. 총 path 수를 다이어그램당 20개 이하로 제한. |

---

### 구조적 판단 (전체 Phase 공통)

- **Three.js 의존성 (`three`)**: Phase 3에서 SVG line drawing으로 교체하면 제거 가능. 편집 디자인 톤에 3D는 과하다. 단, 사용자가 3D 유지를 원하면 `scene.background`를 투명으로 변경하고 스타일을 맞춘다.
- **Tailwind CSS v4**: 현재 `@import "tailwindcss"` + `@theme` 구조를 유지. 추가 커스텀 토큰만 확장.
- **다크 모드**: 기존 class 기반 토글 유지. 새 토큰(`--border-light`, `--rule`, `--font-technical`, `--font-korean-pixel`, `--font-code`) dark mode 값 추가.
- **반응형**: 모바일에서 3단 TOC → 1단, mini-TOC는 접힘/토글 방식으로.

---

## 9. Acceptance Criteria

구현이 완료된 후 디자인이 성공했다고 판단하는 체크리스트:

### 시각 언어

- [ ] 첫 화면을 열었을 때 "SaaS 랜딩페이지"가 아니라 "편집된 기술 참고서의 목차"처럼 보인다.
- [ ] Departure Mono가 영문 technical, lo-fi label, 숫자, Latin code, metadata의 주 서체이다.
- [ ] 한글 본문/제목/editorial meta는 Neo둥근모 Code → D2Coding 스택으로 렌더링된다.
- [ ] 한영 혼합 문장에서 baseline이 시각적으로 정렬된다.
- [ ] serif 계열은 기본 디자인 시스템에서 제외된다.
- [ ] 배경이 거의 종이색(`#f7f7f5`)이고, 과한 그라디언트·카드·둥근 박스가 없다.
- [ ] 흑백 기반이며 accent 색상(`#001eff`)은 링크, 인라인 코드, 활성 상태에만 최소 사용된다.
- [ ] 파랑/보라 gradient가 어디에도 없다.
- [ ] `border-radius: 0`이 기본이며, input/focus/tiny control에만 0~2px 예외가 적용된다.

### 목차 & 콘텐츠 모델

- [ ] 각 TOC 항목에 title, dotted leader, word count가 표시된다.
- [ ] 각 TOC 항목이 "원고 슬롯"처럼 보인다 — guiding question 또는 status label이 표시된다.
- [ ] 챕터 MDX frontmatter에 `guiding_question`, `reader_promise`, `expected_words`, `status`, `illustration_idea`, `interactive_idea` 필드가 존재한다.
- [ ] 목차가 6~8개 섹션, 각 섹션 3~5개 article로 구성된다.

### 타이포그래피 & 레이아웃

- [ ] h1, h2, h3, body, label, code의 크기 계층이 뚜렷하다.
- [ ] `font-weight: bold`가 어디에도 없다 (Departure Mono, Neo둥근모 Code, D2Coding은 400 중심으로 사용).
- [ ] h2 상단에 horizontal rule + 섹션 번호가 있다.
- [ ] 수평선, 점선, 숫자가 핵심 그래픽 언어로 작동한다.

### 모션 & 인터랙션

- [ ] 첫 로드 시 masthead rule이 왼→오른으로 0.8초에 걸쳐 그려진다.
- [ ] TOC 항목 hover 시 baseline이 살짝 밀리고 잉크가 진해진다 (카드 튀어나옴 없음).
- [ ] dotted leader hover 시 점선이 미세하게 흐른다.
- [ ] chapter number가 viewport 진입 시 mechanical counter처럼 tick된다.
- [ ] SVG 다이어그램이 viewport 진입 시 line drawing 방식으로 그려진다.
- [ ] zkTLS 흐름도가 스크롤에 따라 점진적으로 활성화된다.
- [ ] 모든 애니메이션이 글 읽기를 방해하지 않는다 (`prefers-reduced-motion: reduce` 시 비활성화).

### 네비게이션

- [ ] 챕터 페이지에 sticky mini-TOC가 있고, 현재 섹션이 하이라이트된다.
- [ ] `SEARCH ⌘K` 라벨이 검색 트리거이고, `WORDS`는 읽기 전용 상태 라벨이다.
- [ ] `Cmd/Ctrl+K`로 검색 모달이 열린다.
- [ ] 챕터 하단에 prev/next 네비게이션이 있다.

### 기술적 무결성

- [ ] `pnpm dev`로 로컬 실행 시 에러 없이 동작한다.
- [ ] 라이트/다크 모드 전환이 깨지지 않는다.
- [ ] 모바일 (720px 이하)에서 레이아웃이 자연스럽게 축소된다.
- [ ] `prefers-reduced-motion: reduce` 미디어 쿼리를 존중한다.

---

> **이 문서는 구현 지시서가 아니라 디자인 의사 결정 기록이다.**
> 구현은 이 문서의 승인 후 별도 task로 진행한다.
