### 2. makingsoftware.com 스타일 기본 레이아웃 (엄격한 디자인 시스템)

다음의 디자인 토큰과 레이아웃 규칙을 **Tailwind CSS v4 커스텀 테마**로 정확히 구현할 것.

#### 컬러 토큰 (Tailwind config에 반영)
| 토큰명 | 라이트 모드 | 다크 모드 |
|---|---|---|
| `bg-primary` | `#faf9f6` | `#111110` |
| `bg-secondary` | `#f3f3f0` | `#1c1c1b` |
| `text-primary` | `#1a1a1a` | `#e5e4e1` |
| `text-secondary` | `#6b6b67` | `#8b8b85` |
| `accent` | `#d03801` | `#e8552e` |
| `border` | `#e6e5e1` | `#2c2c2a` |

#### 타이포그래피 시스템
- **본문**: Charter, Georgia, 'Times New Roman', serif (스택 순서대로, 시스템 폰트로 fallback)
  - `text-lg` (18px), `leading-relaxed` (1.75)
- **코드**: 'Söhne Mono', 'SF Mono', 'Fira Code', monospace
  - `text-sm` (14px), `leading-normal`
- **제목**: Charter bold 또는 시스템 세리프 bold
  - h1: `text-3xl` (30px), `font-bold`, `tracking-tight`
  - h2: `text-2xl` (24px), `font-semibold`
  - h3: `text-xl` (20px), `font-medium`

#### 레이아웃 구조 (정확한 사이즈)

┌─────────────────────────────────────────────┐
│ [사이드바 260px] │ [본문 max-width 700px] │
│ │ │
│ 로고/타이틀 │ h1 제목 │
│ ───────────── │ │
│ ● 챕터 1 (active)│ 본문 텍스트... │
│ ○ 1.1 │ │
│ ○ 1.2 │ [코드 블록] │
│ ○ 챕터 2 │ │
│ ○ 챕터 3 │ 본문 계속... │
│ │ │
│ (sticky, │ (padding: 3rem 2rem) │
│ overflow-y:auto)│ │
└─────────────────────────────────────────────┘

text

#### 사이드바 상세 규칙
- 너비: **260px** (고정)
- 위치: `sticky top-0 h-screen overflow-y-auto`
- 상단 패딩: `pt-8`
- 챕터 제목: `text-sm font-medium text-secondary uppercase tracking-wider`
- 액티브 항목: `text-accent`, 좌측에 3px `bg-accent` 막대(indicator) 표시
- 호버 시: `text-primary` (색상만 변경, 애니메이션 없음 — 정적 느낌 유지)
- 구분선: `border-r border-border` (사이드바 우측)

#### 코드 블록 스타일
```css
pre {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 1.25rem;
  font-size: 0.875rem;
  line-height: 1.6;
  overflow-x: auto;
}
code {
  font-family: 'Söhne Mono', 'SF Mono', monospace;
}
/* 인라인 코드는 accent 색상으로만 강조, 배경 없음 */
:not(pre) > code {
  color: var(--accent);
  background: none;
  font-weight: 500;
}
블록 인용구
css
blockquote {
  border-left: 3px solid var(--accent);
  padding-left: 1rem;
  margin-left: 0;
  font-style: normal; /* 기울임 없음 */
  color: var(--text-secondary);
}
팁/경고 박스
css
.callout {
  border-left: 4px solid var(--accent);
  background: var(--bg-secondary);
  padding: 1rem 1.25rem;
  border-radius: 0 6px 6px 0;
  margin: 1.5rem 0;
}
Tailwind v4 설정 파일 예시
css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-bg-primary: #faf9f6;
  --color-bg-secondary: #f3f3f0;
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #6b6b67;
  --color-accent: #d03801;
  --color-border: #e6e5e1;
  --font-body: 'Charter', 'Georgia', serif;
  --font-mono: 'Söhne Mono', 'SF Mono', 'Fira Code', monospace;
}

.dark {
  --color-bg-primary: #111110;
  --color-bg-secondary: #1c1c1b;
  --color-text-primary: #e5e4e1;
  --color-text-secondary: #8b8b85;
  --color-accent: #e8552e;
  --color-border: #2c2c2a;
}
애니메이션/인터랙션 규칙
호버 애니메이션 없음 — 정적 문서처럼 동작

페이지 전환은 CSS View Transitions API로 크로스페이드(단, 과하지 않게)

스크롤 위치는 URL 해시로 복원

다크 모드 토글은 즉시 전환(트랜지션 없음)

text

---

## 📋 전체 프롬프트에 병합하는 방법

1. 기존 최종 프롬프트에서 **"2. makingsoftware.com 스타일 기본 레이아웃"** 섹션을 찾습니다.
2. 해당 섹션을 위의 **"2. makingsoftware.com 스타일 기본 레이아웃 (엄격한 디자인 시스템)"** 전체로 교체합니다.
3. 나머지 기술 스택, 챕터 콘텐츠, WebGPU/WASM/Sandpack 요구사항은 그대로 유지합니다.
4. AI에게 전달할 때, 추가 지시로 다음 한 줄을 프롬프트 맨 앞에 붙이면 더 확실합니다:

```text
당신은 makingsoftware.com의 디자인을 픽셀 단위로 복제할 수 있는 프론트엔드 전문가입니다. 아래 디자인 토큰과 레이아웃 명세를 정확히 준수하여 구현하세요.
이렇게 하면 AI가 단순히 "비슷한 느낌"이 아니라, 컬러 코드, 폰트 스택, 여백 수치까지 정확히 일치하는 사이트를 생성할 가능성이 훨씬 높아집니다.
당신은 2026년의 프론트엔드/그래픽스 시니어 개발자이며, 동시에 암호학에 정통한 테크니컬 라이터입니다.
지금부터 "zkTLS Master Guide"라는 **완전한 풀스택 문서 사이트**를 처음부터 끝까지 구현합니다.

## 프로젝트 개요
- **목표**: zkTLS(영지식 TLS)의 기초 암호학, 표준 TLS, 고급 영지식 증명, zkTLS 아키텍처, 실제 구현까지 5장에 걸쳐 배울 수 있는 **인터랙티브 학습 플랫폼**
- **디자인**: https://www.makingsoftware.com/ 와 동일한 미니멀 문서 스타일
  - 좌측 사이드바 네비게이션, 우측 넓은 본문 (max-width 800px), 다크 모드 지원, 깔끔한 타이포그래피, 넉넉한 여백
  - h1, h2, h3 계층적 제목, 코드 블록, 인용구, 경고/팁 박스 등
- **결과물**: 로컬에서 `pnpm dev` 실행 시 즉시 작동하는 완전한 소스 코드

---

## 기술 스택 (절대 준수)
- **Framework**: Next.js 16 (App Router, React Server Components, Partial Prerendering)
- **Content**: MDX (각 챕터는 MDX 파일로 작성)
- **Styling**: Tailwind CSS v4 (CSS-first configuration, 다크 모드 클래스 기반)
- **Package Manager**: pnpm
- **Graphics & Compute**:
  - **WebGPU** 우선 사용 (Compute Shader, Render Pipeline)
  - WebGPU 미지원 환경(예: 구형 브라우저, 일부 모바일)에서는 **Canvas 2D 또는 SVG 기반 fallback** 제공, 문서 자체는 항상 정상 표시
- **3D TLS 시뮬레이터**: Three.js (WebGL) 또는 WebGPU 렌더러, 사용자 환경에 따라 선택
- **WASM**: Rust로 작성한 **작은 결정론적(deterministic) 데모 함수**(예: Poseidon 해시, AES-GCM 암호화 등)를 `wasm-pack`으로 빌드하여 `@/wasm` 모듈로 연동
- **실습 환경**:
  - **Sandpack**을 이용해 하나의 "toy circuit" 예제(Circom 코드 편집) 제공
  - WebGPU 기반의 toy hash/commitment 시각화 (예: 데이터를 입력하면 SHA-256 해시값을 브라우저에서 생성하고, GPU 가속 파이프라인을 애니메이션으로 표현)

---

## 구현 우선순위
아래 순서대로 모든 파일을 생성하세요.

### 1. Next.js + MDX 문서 구조
- `app/layout.tsx`, `app/page.tsx` (랜딩 페이지)
- `app/guide/[chapter]/page.tsx` (동적 라우트로 각 장 렌더링)
- `content/` 디렉토리에 모든 MDX 파일
- `.vitepress` 같은 것이 아니라 Next.js의 MDX Remote 또는 `next-mdx-remote`를 사용하여 빌드 타임에 MDX를 처리

### 2. makingsoftware.com 스타일 기본 레이아웃
- 좌측 사이드바 (챕터 목록, 현재 위치 하이라이트)
- 다크 모드 토글 (Tailwind의 `dark:` 클래스 전환)
- 본문 타이포그래피: `prose` 클래스 커스텀 (Tailwind Typography 플러그인 또는 수동 스타일)
- 상단 헤더: 사이트 제목, GitHub 링크, 다크 모드 버튼

### 3. 제2장 3D TLS 흐름 시뮬레이터 (반드시 구현)
- TLS 1.2, TLS 1.3, zkTLS(MPC 기반)의 키 교환 흐름을 **3D 노드 그래프**로 표현
- 클라이언트, 서버, Notary 노드가 나타나고 패킷이 오가는 애니메이션
- WebGPU 가속 Three.js (또는 native WebGPU renderer)를 사용하되, 미지원 시 Three.js WebGL fallback
- 이 시뮬레이터는 `content/chapter2/simulation.mdx`에 `InteractiveTLS` 컴포넌트로 삽입

### 4. 제5장 WebGPU toy hash / commitment 시각화
- 사용자가 문자열을 입력하면, WebGPU Compute Shader로 SHA-256(또는 가벼운 해시)을 병렬로 계산하고 그 과정을 시각적 파티클로 표현
- WebGPU 미지원 시 Canvas 2D로 간단한 해시 연산 시뮬레이션
- `content/chapter5/hash-lab.mdx`에 포함

### 5. Rust WASM deterministic demo
- Rust로 구현한 `poseidon_hash` 함수 (또는 `aes_gcm_encrypt`)를 `wasm-bindgen`으로 감싸 `@/wasm`으로 제공
- 이 함수를 MDX 내에서 호출하여 입력값 → 결과값을 실시간으로 확인할 수 있는 간단한 인터랙티브 위젯 제공
- WASM 모듈은 빌드 타임에 미리 준비되며, `public/wasm`에 복사

### 6. Sandpack toy circuit 예제 1개
- `content/chapter5/circuit-playground.mdx`에 Sandpack 컴포넌트 삽입
- 간단한 Circom 템플릿(예: `pragma circom 2.0; template Multiplier() { ... }`)을 편집할 수 있는 환경 제공
- 실제 증명 생성은 하지 않고, 문법 강조 + 구조 설명만 제공 (교육용)

---

## 로컬 문서 검색 (AI 없음, 서버 비용 없음)
- `3-3`의 AI 챗봇은 **완전히 제거**
- 대신, **빌드 타임에 MDX 문서를 청크(문단 단위)로 분할**하여 JSON 인덱스를 생성 (`scripts/build-search-index.mjs`)
- 생성된 인덱스(`public/search-index.json`)를 클라이언트에서 가져와, 사이트 내 `Search` 버튼/모달을 통해 검색 가능 (간단한 FlexSearch.js, Lunr.js, 또는 client-side Fuse.js 사용)
- 검색 결과 클릭 시 해당 MDX 페이지의 앵커로 이동

---

## 챕터별 MDX 콘텐츠 (반드시 충실히 작성)
각 챕터는 아래 상세 목차에 맞추어 **원어민 수준의 한국어 설명(최소 300단어)**, 코드 스니펫, 다이어그램, 그리고 위에 정의된 인터랙티브 컴포넌트를 포함해야 합니다.

### 제1장: 기초 암호학
1.1 대칭키/공개키 암호화: AES, RSA, ECC 차이, Go/JS 예제  
1.2 해시 함수와 디지털 서명: SHA-256, ECDSA, 무결성 검증 원리  
1.3 MAC & AEAD: HMAC, AES-GCM 동작 원리

### 제2장: TLS 프로토콜
2.1 HTTPS와 TLS 역할: 평문 전달 과정  
2.2 TLS 핸드셰이크 분석: TLS 1.2 vs 1.3 Diffie-Hellman  
2.3 PKI와 X.509 인증서  
2.4 기존 TLS의 한계 (MAC 키 대칭성 문제)  
→ **3D 시뮬레이터 포함**

### 제3장: 고급 암호학
3.1 영지식 증명 기초: Prover/Verifier, Completeness/Soundness  
3.2 zk-SNARKs vs zk-STARKs  
3.3 MPC: 2PC, Garbled Circuits

### 제4장: zkTLS 구조와 동작 원리
4.1 등장 배경 및 Use Cases (Web2 → Web3 오라클)  
4.2 아키텍처 비교: Proxy vs MPC (DECO, TLSNotary)  
4.3 zkTLS 파이프라인: Fetch → Proof → Verify  
4.4 보안 모델과 신뢰 가정

### 제5장: 실제 구현 및 동작
5.1 주요 오픈소스 분석 (TLSNotary, DECO)  
5.2 ZK Circuit 실습 (Circom, Halo2)  
5.3 Hands-on: zkTLS 세션, 증명 생성, 온체인 검증  
→ **WebGPU 해시 랩, WASM demo, Sandpack 포함**

---

## 안전 및 정책 준수
- 모든 코드는 **교육 목적**으로만 사용됩니다.
- 실제 금융/소셜 API를 호출하지 않으며, 더미 데이터와 로컬 시뮬레이션만 사용합니다.
- 개인 식별 정보(PII)나 실제 계정 정보를 요구하지 않습니다.
- "해킹", "우회" 대신 "프라이버시 보호 증명", "검증 가능한 연산" 표현을 사용합니다.

---