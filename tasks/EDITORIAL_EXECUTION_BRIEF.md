# Start here 20편 편집 실행 계약

## 계약 범위

- 대상: `c00-a01`부터 `c00-a20`까지의 신규 학습 경로 원고. `core`는 1~18, `developer-lab`은 19~20이다.
- 독자: 웹·API·기본 보안을 아는 개발자·보안 엔지니어. ZK·zkTLS 구현 경험은 없다.
- 총 목표 분량: 현행 로드맵 산정값 82,000. Phase 1=10,000, Phase 2=15,000, Phase 3=13,000, Phase 4=15,000, Phase 5=17,000, 실습=12,000이다.
- 모든 `assumes`는 앞선 글의 `introduces`에 있는 기계 판독용 키만 참조한다. 목록은 선행 글 전체를 다시 읽으라는 뜻이 아니라, 해당 개념이 이미 정의되었다는 계약이다.
- 팩트체크 정정은 선택 사항이 아니다. 아래의 “반영 정정”은 본문과 그림 설명에도 적용한다.

## 공통 frontmatter

```yaml
---
id: c00-aNN
order: NN
title: 한국어 제목
chapter: START HERE
chapterSlug: start-here
articleSlug: english-kebab-case
slug: english-kebab-case
pathRole: core # 19~20은 developer-lab
difficulty: foundation # foundation | intermediate | deep | lab
status: review
wordCountTarget: 0000
visualKey: c00-aNN
branch: content/c00-aNN-english-kebab-case
readerQuestion: 이 글이 답할 한 가지 질문
zktlsBridge: 앞뒤 필수 글과 연결되는 한 문장
assumes: []
introduces: []
checkpoint: 독자가 글을 읽고 설명할 수 있어야 하는 내용
readingBudget: 0000 # wordCountTarget과 같아야 함
references:
  - https://example.invalid/replace-with-primary-source
---
```

## 공통 H2 순서

1. `## Reader Question`
2. `## Why It Matters`
3. `## Core Model`
4. `## Protocol or System Artifact`
5. `## Failure Mode`
6. `## Minimal Lab or Trace`
7. `## zkTLS Bridge`
8. `## Verification Checklist`
9. `## References`

실습 글(19~20)도 같은 H2를 유지하되 `Core Model`에는 안전 경계, `Protocol or System Artifact`에는 절차, `Failure Mode`에는 거절 사례를 쓴다. 코드, 명령, URL, 직접 인용은 원문 작성 단계에서 보호 대상으로 취급한다.

## 편별 계약

### 01. c00-a01 — 복사본·스크린샷·토큰 공유가 증거가 아닌 이유

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 1 / `copies-screenshots-and-tokens-are-not-evidence` / core / foundation / 3,400 |
| visualKey | `c00-a01` |
| assumes | `[]` |
| introduces | `[provenance-gap, endpoint-authentication, relying-policy]` |
| checkpoint | 일반 HTTP 응답 사본과 서버가 별도 서명한 객체를 구분하고, TLS endpoint 인증이 제3자 검증으로 자동 전이되지 않는 이유를 설명한다. |
| 독자 질문 | “내가 HTTPS로 받은 화면을 보여 주는 것과, 다른 사람이 그 출처를 검증하는 것은 왜 다른가?” |
| 범위 / 제외 | 일반 복사본·스크린샷·토큰 공유와 provenance 간극만 다룬다. 서버의 별도 서명 객체, 특정 제품 구현, 모든 신뢰 문제 해결 주장은 제외한다. |
| 반영 정정 | “복사본은 증거가 아니다”라고 절대화하지 않는다. 서버의 별도 검증 가능 서명이 없는 일반 HTTP 응답 사본이라는 범위를 밝히고, TLS 보장은 endpoint에 한정한다고 쓴다. |
| 권장 1차 refs | [TLSNotary 소개](https://tlsnotary.org/docs/intro/), [TLSNotary FAQ](https://tlsnotary.org/docs/faq/), [DECO](https://arxiv.org/abs/1909.00938), [RFC 8446 §1](https://www.rfc-editor.org/rfc/rfc8446#section-1) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | 사본과 검증 가능한 산출물 | 사본이 provenance를 대체하지 못하는 이유 | 3열 비교표 | 복사본·스크린샷·notarized artifact, origin·integrity·privacy 축 | 일반 사본과 스크린샷은 제3자 TLS 출처 검증 정보를 제공하지 않으며, 검증 가능한 산출물은 별도 프로토콜과 가정을 가진다. |
| 2 | endpoint와 relying party | TLS 보장 범위를 분리 | 경계 다이어그램 | client·server endpoint, 제3자 relying party, 끊긴 검증 경로 | TLS 연결의 두 endpoint는 연결을 검증하지만, 제3자는 일반 사본만으로 같은 검증을 수행할 수 없다. |

### 02. c00-a02 — zkTLS 참여자와 증거물 지도

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 2 / `zktls-actors-and-artifact-map` / core / foundation / 3,300 |
| visualKey | `c00-a02` |
| assumes | `[provenance-gap, relying-policy]` |
| introduces | `[origin, prover, verifier, relying-application, notary-optional, artifact-layers]` |
| checkpoint | Origin, Prover, Verifier, relying application의 책임과 session 자료·receipt·opening·ZK proof·결정의 층위를 혼동 없이 구분한다. |
| 독자 질문 | “누가 무엇을 만들고, 누가 무엇을 검증하며, notary는 왜 항상 필요하지 않은가?” |
| 범위 / 제외 | 역할과 산출물의 지도만 제공한다. MPC-TLS·DECO 내부 구조 및 특정 artifact 형식은 제외한다. |
| 반영 정정 | TLSNotary의 Server를 이 글의 Origin과 대응시킨다. notary를 모든 zkTLS의 필수 참여자로 일반화하지 않으며 proof·receipt·정책 결정은 서로 다른 산출물로 쓴다. |
| 권장 1차 refs | [TLSNotary 소개](https://tlsnotary.org/docs/intro/), [DECO](https://arxiv.org/abs/1909.00938) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | 참여자와 책임 | 역할별 생성·검증 책임 표시 | actor-flow | Origin→Prover→Verifier/Relying application, optional notary | Origin은 TLS 데이터를 제공하고 Prover는 산출물을 만들며 Verifier와 relying application은 각각 검증과 수락 정책을 맡는다. |
| 2 | 증거물의 층위 | 비슷한 말을 proof로 뭉개지 않기 | 적층 도식 | session 자료·receipt/attestation·opening·ZK proof·decision | TLS session 자료, 공개용 산출물, ZK proof, 애플리케이션 결정은 같은 종류의 증거가 아니다. |

### 03. c00-a03 — 익숙한 웹 흐름에서 그리는 trust boundary

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 3 / `trust-boundaries-in-a-familiar-web-flow` / core / foundation / 3,300 |
| visualKey | `c00-a03` |
| assumes | `[origin, prover, verifier, relying-application]` |
| introduces | `[threat-model-scope, trust-boundary, attack-surface, verification-responsibility]` |
| checkpoint | 브라우저·API·prover·verifier 사이에서 데이터 소유와 검증 책임이 바뀌는 지점, 조작 가능한 입력을 표시한다. |
| 독자 질문 | “어떤 경계를 넘어갈 때 무엇이 공격자가 바꿀 수 있는 입력이 되는가?” |
| 범위 / 제외 | 하나의 웹/API 흐름으로 위협 모델을 작성한다. 경계도만으로 위협이 제거된다는 주장과 zkTLS 아키텍처 상세는 제외한다. |
| 반영 정정 | OWASP를 보편적 boundary 정의의 직접 근거로 쓰지 않는다. 이 문서가 경계를 설계 산출물로 명시한다고 쓰며, 경계도는 보안 증거가 아님을 밝힌다. |
| 권장 1차 refs | [OWASP Threat Modeling](https://owasp.org/www-community/Threat_Modeling), [NIST attack surface 용어](https://csrc.nist.gov/glossary/term/attack_surface) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | 웹 흐름의 경계 | 책임과 가시성 변화 표시 | 경계도 | browser·API·prover·verifier, 데이터 흐름과 소유자 | 브라우저, API, prover, verifier는 서로 다른 데이터 접근과 검증 책임을 가진 경계로 연결된다. |
| 2 | 최소 공격자 모델 | 조작 지점을 구체화 | 입력 변조 표 | 요청·응답·claim·policy 입력별 조작자와 방어자 | 각 입력은 누가 만들고 누가 바꿀 수 있으며 누가 검증해야 하는지 표로 확인한다. |

### 04. c00-a04 — HTTPS 보호 경로: handshake와 record

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 4 / `https-protection-path-handshake-and-records` / core / foundation / 3,750 |
| visualKey | `c00-a04` |
| assumes | `[endpoint-authentication]` |
| introduces | `[tls-handshake, tls-record, traffic-key, protected-application-data]` |
| checkpoint | handshake의 상대 인증·보안 매개변수 설정과 record의 application data 보호를 분리해 설명한다. |
| 독자 질문 | “URL 요청이 보호된 application bytes가 되기까지 handshake와 record는 각각 무엇을 하는가?” |
| 범위 / 제외 | TLS 1.2/1.3의 큰 역할 분리만 다룬다. cipher suite 목록, 0-RTT·ECH·QUIC·mTLS 세부는 제외한다. |
| 반영 정정 | TLS가 application data를 제3자에게 자동 서명하는 것처럼 쓰지 않는다. TLS 1.2 RFC는 1.2 설명에만 쓰고 1.3과 혼용하지 않는다. |
| 권장 1차 refs | [RFC 8446 §1](https://www.rfc-editor.org/rfc/rfc8446#section-1), [RFC 5246](https://www.rfc-editor.org/rfc/rfc5246) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | handshake 뒤 record | TLS 단계 역할 분리 | 순서도 | handshake, traffic key 수립, protected record | TLS handshake가 보안 매개변수를 수립한 뒤 record가 application data를 보호한다. |
| 2 | 보호 범위 | TLS가 하지 않는 일 표시 | 포함/제외 도식 | endpoint 인증·기밀성·무결성, 제3자 서명 제외 | TLS는 endpoint 사이의 통신을 보호하지만 일반 HTTP 응답에 공개 검증 서명을 부여하지 않는다. |

### 05. c00-a05 — TLS transcript와 origin binding

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 5 / `tls-transcript-and-origin-binding` / core / intermediate / 3,750 |
| visualKey | `c00-a05` |
| assumes | `[tls-handshake, protected-application-data]` |
| introduces | `[tls-transcript, certificate-identity, certificate-verify, finished-message, origin-binding]` |
| checkpoint | TLS 1.3 transcript의 인증 맥락과 특정 HTTP 응답의 제3자 provenance가 서로 다른 범위임을 설명한다. |
| 독자 질문 | “인증서와 Finished가 보여 주는 세션 맥락은 왜 특정 HTTP 응답의 공개 provenance와 같지 않은가?” |
| 범위 / 제외 | TLS 1.3 중심의 transcript·certificate identity를 다룬다. CA 운영, 인증서 발급 절차, HTTP 응답 진실성 단정은 제외한다. |
| 반영 정정 | CertificateVerify·Finished 설명을 TLS 1.3에 한정한다. TLS 1.2에는 별도 구조가 있음을 명시하고, 인증서만으로 HTTP 응답 provenance가 생기지 않는다고 쓴다. |
| 권장 1차 refs | [RFC 8446 §4.4](https://www.rfc-editor.org/rfc/rfc8446#section-4.4), [RFC 5246](https://www.rfc-editor.org/rfc/rfc5246), [RFC 5280](https://www.rfc-editor.org/rfc/rfc5280), [DECO](https://arxiv.org/abs/1909.00938) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | TLS 1.3 transcript 구성 | identity와 handshake 무결성의 결합 | 수렴 도식 | certificate chain·CertificateVerify·Finished→transcript hash | TLS 1.3에서 인증서 관련 검증과 Finished는 transcript 맥락에 결합된다. |
| 2 | 세션 인증과 응답 provenance | 보장 범위의 경계 | 두 층 비교 | TLS session context, HTTP response, third-party proof gap | TLS 세션의 endpoint 인증은 특정 HTTP 응답을 제3자에게 증명하는 별도 문제와 구분된다. |

### 06. c00-a06 — Record 인증과 제3자 전이의 간극

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 6 / `record-authentication-and-third-party-provenance-gap` / core / intermediate / 3,750 |
| visualKey | `c00-a06` |
| assumes | `[tls-record, traffic-key, origin-binding]` |
| introduces | `[aead-record-authentication, directional-traffic-key, symmetric-verification, third-party-provenance]` |
| checkpoint | 수신 endpoint의 대칭키 record 검증과 독립 제3자의 공개 검증 요구를 구분한다. |
| 독자 질문 | “AEAD tag가 유효하다면 왜 제3자에게 ‘서버가 이 응답을 보냈다’고 바로 증명할 수 없는가?” |
| 범위 / 제외 | TLS 1.3 record와 대칭키 검증의 의미만 다룬다. AEAD 설계·MAC 알고리즘·구체 notarization 구현은 제외한다. |
| 반영 정정 | 모호한 endpoint secret 대신 송신 방향 traffic key를 사용한다. AEAD tag를 공개 검증 서명처럼 설명하지 않으며, 제3자 provenance는 상위 프로토콜·신뢰 가정에 달렸다고 쓴다. |
| 권장 1차 refs | [RFC 8446 §5](https://www.rfc-editor.org/rfc/rfc8446#section-5), [NIST SP 800-38D](https://csrc.nist.gov/pubs/sp/800/38/d/final), [DECO](https://arxiv.org/abs/1909.00938) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | 방향별 record 검증 | 대칭키 검증 주체를 보이기 | 방향 화살표 도식 | sender traffic key, receiver verification, protected record | 송신 방향 traffic key로 보호한 record를 수신 endpoint가 검증한다. |
| 2 | endpoint 검증과 공개 검증 | 두 요구의 차이를 비교 | 나란한 비교 | endpoint-only check와 independent third party, 필요한 추가 binding | 대칭키 record 검증은 연결 당사자용이며 제3자 provenance에는 추가 프로토콜이 필요하다. |

### 07. c00-a07 — TLS 1.2·1.3과 구현 지원 경계

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 7 / `tls-12-tls-13-and-implementation-support-boundaries` / core / intermediate / 3,750 |
| visualKey | `c00-a07` |
| assumes | `[tls-handshake, tls-transcript]` |
| introduces | `[tls-version-boundary, key-schedule-difference, implementation-support-scope]` |
| checkpoint | “TLS 지원”이 버전·cipher suite·구현 경로에 따른 여러 지원 약속임을 설명한다. |
| 독자 질문 | “한 구현이 TLS를 지원한다는 말만으로 zkTLS 보장 범위를 판단할 수 없는 이유는 무엇인가?” |
| 범위 / 제외 | TLS 1.2와 1.3 handshake·키 파생 차이를 높은 수준에서 비교한다. 지원 여부 추정, 제품 기능표 작성, 확장 기능 상세는 제외한다. |
| 반영 정정 | TLS 1.2·1.3의 보장과 구조를 같은 것으로 쓰지 않는다. 실제 지원 범위는 구현의 공식 사양으로 확인해야 한다고 쓴다. |
| 권장 1차 refs | [RFC 8446 §1.2](https://www.rfc-editor.org/rfc/rfc8446#section-1.2), [RFC 5246](https://www.rfc-editor.org/rfc/rfc5246) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | TLS 1.2와 1.3의 흐름 | 버전별 키 수립 차이 | 2열 비교 | 각 버전의 handshake와 key establishment 단계 | TLS 1.2와 TLS 1.3은 handshake와 키 파생 구성이 서로 다르다. |
| 2 | 지원 범위 질문표 | 단일 플래그 오해 방지 | 체크리스트 | protocol version·cipher suite·implementation path | 구현 지원 여부는 TLS라는 이름 하나가 아니라 구체 버전과 구현 경로로 확인한다. |

### 08. c00-a08 — Claim specification: verifier가 먼저 정해야 할 것

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 8 / `claim-specification-what-the-verifier-decides-first` / core / intermediate / 4,300 |
| visualKey | `c00-a08` |
| assumes | `[provenance-gap, verifier, relying-policy, threat-model-scope]` |
| introduces | `[claim-profile, request-scope, field-path, predicate, audience, freshness-policy, verifier-nonce]` |
| checkpoint | fetch 전에 origin·request scope·field path·predicate·audience·freshness 정책을 명세하고, nonce만으로 replay가 자동 차단되지 않음을 설명한다. |
| 독자 질문 | “왜 prove할 데이터를 가져오기 전에 verifier의 수락 조건부터 써야 하는가?” |
| 범위 / 제외 | claim 프로필과 freshness 설계 원칙을 다룬다. DPoP를 zkTLS 표준으로 제시하거나 nonce 프로토콜을 고정하지 않는다. |
| 반영 정정 | RFC 9449는 DPoP 문맥임을 표시한다. freshness에는 nonce 외에도 발급자·대상·유효 시간·재사용 정책과 verifier 상태가 필요하다고 쓴다. |
| 권장 1차 refs | [TLSNotary 소개](https://tlsnotary.org/docs/intro/), [RFC 9449 §§3, 8, 11.1](https://www.rfc-editor.org/rfc/rfc9449) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | claim 명세 선행 흐름 | Fetch 전에 정책을 고정하는 순서 | 단계도 | Specify→Challenge→Fetch→Prove→Verify→Rely, 설계 표기법 표시 | 이 문서의 설계 표기법은 claim과 정책을 먼저 정하고 이후 단계를 추적한다. |
| 2 | freshness 정책의 구성 | nonce 단독 해결책 오해 방지 | 정책 입력표 | nonce 발급자·대상·시간·재사용 추적·수락 정책 | freshness는 nonce 값 하나가 아니라 발급과 검증 정책을 함께 필요로 한다. |

### 09. c00-a09 — Bytes-to-claim binding

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 9 / `bytes-to-claim-binding` / core / intermediate / 4,300 |
| visualKey | `c00-a09` |
| assumes | `[claim-profile, request-scope, field-path, predicate]` |
| introduces | `[parser-binding, json-duplicate-name, deterministic-parser-profile, canonicalization-scope, disclosure-boundary]` |
| checkpoint | bytes→parser→field path→predicate→public claim의 각 연결을 명시하고 중복 JSON 이름과 해석 차이를 거절 조건으로 만든다. |
| 독자 질문 | “동일한 HTTP/JSON 응답을 서로 다른 claim으로 읽는 일을 어떻게 막는가?” |
| 범위 / 제외 | HTTP/JSON parsing·field path·정규화 범위만 다룬다. injection 카탈로그, 모든 데이터 형식의 canonicalization 표준화는 제외한다. |
| 반영 정정 | RFC 8259가 canonicalization을 정의한다고 쓰지 않는다. 중복 이름 거부와 숫자·문자열·경로 규칙을 프로필에 명시하며, 원본 bytes와 단일 결정적 parser를 증명할 때 canonicalization이 항상 필수는 아님을 밝힌다. |
| 권장 1차 refs | [RFC 8259 §4](https://www.rfc-editor.org/rfc/rfc8259#section-4), [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | bytes에서 public claim까지 | binding 지점 식별 | 파이프라인 | HTTP/JSON bytes→parser→field path→predicate→claim | claim은 원본 bytes에서 parser와 경로, predicate를 거쳐 만들어지며 각 규칙이 고정돼야 한다. |
| 2 | 중복 이름의 분기 | parser 차이 위험 표시 | 분기 다이어그램 | duplicate key, last value·error·all pairs 결과 | 중복 JSON 이름은 구현마다 다르게 처리될 수 있으므로 claim 프로필은 이를 거부해야 한다. |

### 10. c00-a10 — Credential 격리와 “진짜 응답 ≠ 정당한 claim”

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 10 / `credential-isolation-and-valid-response-is-not-authorized-claim` / core / intermediate / 4,400 |
| visualKey | `c00-a10` |
| assumes | `[prover, verifier, relying-application, claim-profile, parser-binding]` |
| introduces | `[bearer-credential, credential-isolation, provenance-truth-reliance, authorization-check]` |
| checkpoint | access token·인증 쿠키는 공개하지 않고, provenance 검증·사실성·relying party 인가를 분리한다. |
| 독자 질문 | “출처가 확인된 응답인데도 relying application이 별도로 authorization을 해야 하는 이유는 무엇인가?” |
| 범위 / 제외 | bearer credential과 object-level authorization의 경계만 다룬다. OAuth/OIDC 상세 및 BOLA 전체 분류는 제외한다. |
| 반영 정정 | session을 일괄 credential이라고 단정하지 않는다. 보유 자체가 접근 권한에 영향을 주는 access token·인증 쿠키를 예로 들고, BOLA를 모든 정책의 규정으로 일반화하지 않는다. |
| 권장 1차 refs | [RFC 6750 §§1.2–1.3](https://www.rfc-editor.org/rfc/rfc6750#section-1.2), [OWASP API1:2023 BOLA](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | credential과 claim 경계 | 비밀과 공개 산출물 분리 | 경계도 | prover 내부 token/cookie, 외부 selected claim | 접근 권한에 영향을 주는 credential은 prover 안에 남고 선택된 claim만 외부로 전달된다. |
| 2 | provenance·truth·reliance | 세 판단을 분리 | 3단 판단표 | 출처 검증·내용 평가·업무 인가, 독립 gate | 응답의 출처가 확인되어도 내용의 업무상 수용과 대상 객체 권한은 별도 검사한다. |

### 11. c00-a11 — Prover, Verifier, statement, witness, public input, circuit

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 11 / `prover-verifier-statement-witness-public-input-and-circuit` / core / intermediate / 3,750 |
| visualKey | `c00-a11` |
| assumes | `[prover, verifier, claim-profile, parser-binding]` |
| introduces | `[statement, witness, public-input, relation, circuit, proof-verification]` |
| checkpoint | `(x,w) ∈ R` 관계에서 공개 입력·비공개 witness·proof 검증을 구분하고 애플리케이션 claim이 별도 binding을 요구함을 설명한다. |
| 독자 질문 | “회로가 검증하는 관계와 사람이 읽는 application claim은 왜 같은 문장이 아닌가?” |
| 범위 / 제외 | 일반 relation 기반 ZK 모델만 다룬다. proof·argument·proof of knowledge의 세부 정의 및 특정 proving system 구현은 제외한다. |
| 반영 정정 | prover가 자연어 주장 전체를 자동 확정한다고 쓰지 않는다. verifier는 proof·public input·검증 키 또는 회로 정의에 대한 relation 수락을 확인하며 parser와 policy도 별도 binding 대상이라고 쓴다. |
| 권장 1차 refs | [Goldwasser–Micali–Rackoff](https://doi.org/10.1145/22145.22178), [Groth16](https://eprint.iacr.org/2016/260) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | relation의 입력 분리 | x와 w의 가시성 표시 | prover/verifier 양쪽 도식 | private witness, public input, proof, verifier check | Prover는 비공개 witness와 공개 입력의 relation을 만족하는 proof를 만들고 Verifier는 공개 정보를 검증한다. |
| 2 | relation과 application claim | 과도한 결론 방지 | binding 레이어 | circuit relation, parser, claim profile, relying policy | proof가 검증하는 relation은 parser·claim 프로필·정책에 묶일 때만 애플리케이션 주장에 연결된다. |

### 12. c00-a12 — Commitment와 selective disclosure

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 12 / `commitments-and-selective-disclosure` / core / intermediate / 3,750 |
| visualKey | `c00-a12` |
| assumes | `[statement, witness, public-input, relation, disclosure-boundary]` |
| introduces | `[commitment, hiding, binding, opening, selective-disclosure-protocol]` |
| checkpoint | commitment의 hiding·binding, opening의 입력, selective disclosure가 primitive 자체가 아니라 프로토콜 설계 결과임을 설명한다. |
| 독자 질문 | “값을 고정하면서 숨기는 것과 필요한 범위만 공개하는 것은 어떻게 다른가?” |
| 범위 / 제외 | commitment·opening·선택 공개의 관계만 다룬다. 모든 메타데이터 누출 제거, 특정 scheme의 세부 수학은 제외한다. |
| 반영 정정 | opening은 값과 보통 decommitment 정보를 함께 사용한다고 쓴다. selective disclosure는 선택 범위 opening 또는 숨긴 데이터의 ZK predicate를 조합한 프로토콜 성질이며 자동 성질이 아님을 명시한다. |
| 권장 1차 refs | [Pedersen](https://www.iacr.org/cryptodb/data/paper.php?pubkey=1151), [DECO](https://arxiv.org/abs/1909.00938), [TLSNotary tlsn v0.1.0-alpha.15](https://github.com/tlsnotary/tlsn/releases/tag/v0.1.0-alpha.15) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | commitment과 opening | 숨김·고정·검증의 입력 표시 | 3단 도식 | value+randomness→commitment, value+decommitment→verify | commitment는 값을 숨긴 채 고정하고 opening은 값과 decommitment로 그 고정을 확인한다. |
| 2 | 선택 공개의 두 경로 | protocol-level 성질 강조 | 분기 도식 | selected opening과 ZK predicate, 비공개 원문 | selective disclosure는 선택 범위를 열거나 숨긴 데이터에 대한 predicate를 증명하도록 프로토콜을 설계해 얻는다. |

### 13. c00-a13 — Completeness, soundness, zero-knowledge와 under-constrained circuit

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 13 / `completeness-soundness-zero-knowledge-and-under-constrained-circuits` / core / intermediate / 3,750 |
| visualKey | `c00-a13` |
| assumes | `[relation, circuit, proof-verification, parser-binding]` |
| introduces | `[completeness, soundness, zero-knowledge, intended-relation, under-constrained-circuit]` |
| checkpoint | soundness와 zero-knowledge를 분리하고, 누락 제약이 proof system의 soundness 붕괴가 아니라 회로/statement 명세 오류일 수 있음을 설명한다. |
| 독자 질문 | “유효한 proof가 있는데도 application claim이 잘못될 수 있는 경우는 언제인가?” |
| 범위 / 제외 | 보안 성질과 intended relation의 불일치만 다룬다. 구체 취약점, field arithmetic·range check 구현법은 제외한다. |
| 반영 정정 | soundness는 실제로 검증하는 relation에만 적용한다고 쓴다. 약해진 회로에 대해 proof가 sound할 수 있어도 의도한 claim을 보장하지 못할 수 있음을 명시한다. |
| 권장 1차 refs | [Goldwasser–Micali–Rackoff](https://doi.org/10.1145/22145.22178), [Groth16](https://eprint.iacr.org/2016/260) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | 세 보장 성질 | 개념 혼동 방지 | 비교표 | completeness·soundness·zero-knowledge의 질문과 범위 | completeness, soundness, zero-knowledge는 서로 다른 질문에 답하는 별개 성질이다. |
| 2 | 누락 제약의 수용 영역 | intended relation과 실제 회로 비교 | 겹침 도식 | intended set, weaker circuit accepted set, unintended inputs | 누락된 제약은 실제 회로가 의도하지 않은 입력까지 수용하게 만들 수 있다. |

### 14. c00-a14 — MPC 기초: 입력 분리, key share, adversary model

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 14 / `mpc-basics-input-separation-key-shares-and-adversary-models` / core / intermediate / 3,750 |
| visualKey | `c00-a14` |
| assumes | `[prover, verifier, threat-model-scope]` |
| introduces | `[mpc, shared-computation, adversary-model, collusion-threshold, abort, fairness]` |
| checkpoint | MPC의 공동 계산 목적과 adversary model별 프라이버시·정확성·공모·abort·fairness 차이를 설명한다. |
| 독자 질문 | “입력을 나눠 계산한다고 해서 어떤 공모와 중단에도 항상 안전한 것은 아닌 이유는 무엇인가?” |
| 범위 / 제외 | MPC의 최소 문법과 보안 정의 확인 항목만 다룬다. MPC-TLS, garbled circuit, OT, 특정 secret sharing 구현은 제외한다. |
| 반영 정정 | secret sharing을 MPC의 필요조건이나 단일 방식으로 쓰지 않는다. 허용 공모 수, malicious abort, fairness, 결과 전달은 프로토콜·adversary model에 따라 확인해야 한다고 쓴다. |
| 권장 1차 refs | [Goldreich–Micali–Wigderson](https://doi.org/10.1145/62212.62222), [SPDZ](https://eprint.iacr.org/2011/535) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | 공동 계산의 입력 흐름 | 각자가 원문 입력을 직접 주지 않는 구조 표시 | 2-party 계산 도식 | two inputs/shares, joint computation, designated output | 두 참여자는 원문 입력을 모두 공개하지 않고 지정한 함수를 함께 계산한다. |
| 2 | adversary model 질문표 | 자동 보장 오해 방지 | 매트릭스 | semi-honest/malicious, collusion, abort, fairness, output delivery | MPC의 보장은 adversary model과 프로토콜이 명시한 공모·중단·결과 전달 조건에 달려 있다. |

### 15. c00-a15 — Architecture 결정 축: provenance 획득·검증 주체·공개 방식

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 15 / `architecture-axes-provenance-verification-and-disclosure` / core / deep / 4,250 |
| visualKey | `c00-a15` |
| assumes | `[third-party-provenance, mpc, selective-disclosure-protocol, verifier, relying-policy]` |
| introduces | `[architecture-analysis-frame, provenance-acquisition, verification-actor, disclosure-method, proxy-mode, mpc-tls, deco-family]` |
| checkpoint | provenance binding, 검증 주체, 공개 방식을 별도 비교 축으로 기록하고 이를 표준 taxonomy가 아닌 분석 프레임으로 설명한다. |
| 독자 질문 | “proxy·MPC-TLS·DECO를 한 줄 순위가 아니라 어떤 질문으로 비교해야 하는가?” |
| 범위 / 제외 | 세 비교 축과 trust assumption 기록 방법만 다룬다. 어떤 architecture가 보편적으로 최선이라는 결론, 상호 배타적 표준 분류는 제외한다. |
| 반영 정정 | 세 축은 저자의 분석 프레임이라고 표시한다. TLSNotary의 MPC-TLS·proxy mode와 DECO를 동일 표준 taxonomy의 범주처럼 쓰지 않는다. |
| 권장 1차 refs | [TLSNotary MPC-TLS](https://tlsnotary.org/docs/protocol/mpc-tls/), [TLSNotary proxy mode](https://tlsnotary.org/docs/protocol/proxy-mode/), [DECO](https://arxiv.org/abs/1909.00938) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | architecture 비교 3축 | 비교 질문을 분리 | 3축 매트릭스 | provenance acquisition·verification actor·disclosure method | 설계 비교는 provenance 결합 방식, 검증 주체, 공개 방식을 별도 축으로 기록한다. |
| 2 | trust 가정 기록 카드 | 단순 순위화 방지 | 사례 카드 | MPC-TLS·proxy mode·DECO, 각기 다른 가정과 공개 방식 | 각 계열은 서로 다른 trust 가정과 절차를 가지며 한 줄 순위로 환원되지 않는다. |

### 16. c00-a16 — TLSNotary/MPC-TLS 사례 연구

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 16 / `tlsnotary-and-mpc-tls-case-study` / core / deep / 4,250 |
| visualKey | `c00-a16` |
| assumes | `[mpc, mpc-tls, proxy-mode, commitment, opening, parser-binding, architecture-analysis-frame]` |
| introduces | `[tlsnotary-artifact-separation, transcript-provenance, attestation, session-artifact, application-claim-binding]` |
| checkpoint | 기본 MPC-TLS와 대안 proxy mode를 구분하고 transcript commitment/opening·attestation·parser 결과·claim·정책 결정을 다른 산출물로 추적한다. |
| 독자 질문 | “TLSNotary 산출물 중 무엇이 세션 맥락이고, 무엇이 application claim이며, 누가 그 연결을 검사하는가?” |
| 범위 / 제외 | TLSNotary 공식 문서와 명시 버전의 사례만 다룬다. API 안정성 보장, artifact 형식 고정, 모든 구현 일반화는 제외한다. |
| 반영 정정 | MPC-TLS는 공동 TLS 연산, proxy mode는 사후 ZK 검증과 추가 network-path 가정을 둔다는 차이를 쓴다. parser·disclosure rule이 claim 의미를 자동 확정하지 않고 verifier의 명시 binding이 필요하다고 쓴다. |
| 권장 1차 refs | [TLSNotary 소개](https://tlsnotary.org/docs/intro/), [MPC-TLS handshake](https://tlsnotary.org/docs/protocol/mpc-tls/handshake/), [proxy mode](https://tlsnotary.org/docs/protocol/proxy-mode/), [tlsn v0.1.0-alpha.15](https://github.com/tlsnotary/tlsn/releases/tag/v0.1.0-alpha.15) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | MPC-TLS와 proxy mode | 두 경로의 가정과 단계 분리 | 병렬 단계도 | joint TLS computation vs observed traffic+ZK verification, network-path assumption | TLSNotary의 MPC-TLS와 proxy mode는 provenance를 다루는 절차와 신뢰 가정이 다르다. |
| 2 | TLSNotary 산출물 연결 | artifact와 claim 혼동 방지 | artifact graph | transcript, commitment/opening or attestation, parser result, claim, policy decision | transcript 관련 산출물, parser 결과, application claim, 정책 결정은 별개이며 verifier가 연결을 검사한다. |

### 17. c00-a17 — 통합 trace: Specify/Challenge에서 Verify/Rely까지

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 17 / `integrated-trace-from-specify-challenge-to-verify-rely` / core / deep / 4,250 |
| visualKey | `c00-a17` |
| assumes | `[claim-profile, freshness-policy, parser-binding, proof-verification, application-claim-binding, authorization-check]` |
| introduces | `[trace-notation, artifact-ownership, verification-decision, reliance-decision, policy-gate]` |
| checkpoint | 이 문서의 설계·감사 표기법으로 claim 명세부터 정책 결정까지 입력·출력·소유권·실패 조건을 추적하고 verify와 rely를 분리한다. |
| 독자 질문 | “proof 검증 성공 뒤 relying application이 추가로 판단해야 하는 것은 무엇인가?” |
| 범위 / 제외 | 하나의 합성 trace를 분석 표기법으로 제시한다. 모든 zkTLS 시스템에 동일 단계명·소유권이 존재한다고 주장하거나 DPoP를 일반 표준으로 쓰지 않는다. |
| 반영 정정 | `Specify→…→Rely`는 이 문서의 설계·감사 표기법이라고 명시한다. verify는 policy 입력이며 issuer trust·audience·freshness·authorization 등의 추가 정책 검사가 있어야 허용한다고 쓴다. |
| 권장 1차 refs | [TLSNotary 소개](https://tlsnotary.org/docs/intro/), [TLSNotary FAQ](https://tlsnotary.org/docs/faq/), [RFC 9449 §3](https://www.rfc-editor.org/rfc/rfc9449#section-3) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | end-to-end trace | actor·artifact ownership 추적 | swimlane | Specify, Challenge, Fetch, Bind/Prove, Verify, Rely와 actor별 산출물 | 설계 표기법의 각 단계에서 누가 어떤 입력과 산출물을 소유하고 전달하는지 추적한다. |
| 2 | verify와 rely의 두 gate | 암호 검증과 업무 수락 분리 | 연속 게이트 | protocol/claim validation gate, issuer·audience·freshness·authorization gate | proof 또는 attestation 검증 성공은 수락 정책의 입력일 뿐 최종 허용 결정이 아니다. |

### 18. c00-a18 — Negative-test capstone

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 18 / `negative-test-capstone` / core / deep / 4,250 |
| visualKey | `c00-a18` |
| assumes | `[claim-profile, freshness-policy, parser-binding, disclosure-boundary, artifact-ownership, policy-gate, adversary-model]` |
| introduces | `[negative-test, binding-mismatch, replay-test, privacy-policy-violation, reject-or-detect]` |
| checkpoint | origin·request scope·field path·challenge·policy 식별자·공개 범위의 변형이 실제 검증 입력 또는 신뢰된 policy input에 결합됐는지 시험한다. |
| 독자 질문 | “불일치를 거절해야 한다고 요구하기 전에, 그 값이 실제로 무엇에 binding되었는지 어떻게 확인하는가?” |
| 범위 / 제외 | claim 프로필별 negative test 설계와 해석을 다룬다. 정상 경로만으로 보안 보장을 증명하는 것, 모든 시스템의 공통 거절 규칙 단정은 제외한다. |
| 반영 정정 | mismatch가 암호 검증에서 자동 거절된다고 쓰지 않는다. over-disclosure는 암호 실패가 아니라 privacy policy 위반으로 별도 검출될 수 있고, freshness는 설계별 replay 범위가 다름을 명시한다. |
| 권장 1차 refs | [TLSNotary proxy mode](https://tlsnotary.org/docs/protocol/proxy-mode/), [RFC 9449 §§8, 11.1](https://www.rfc-editor.org/rfc/rfc9449), [DECO](https://arxiv.org/abs/1909.00938), [OWASP Threat Modeling](https://owasp.org/www-community/Threat_Modeling) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | negative-test 결정표 | 변형별 기대 결과와 binding 확인 | decision table | origin·request·path·challenge·policy·disclosure 변형, reject/detect 이유 | 각 변형은 해당 값이 검증 대상 또는 신뢰된 정책 입력에 포함될 때에만 기대한 거절을 유발한다. |
| 2 | replay와 과다 공개 | 실패 종류 구분 | 두 갈래 흐름 | freshness/replay rejection, privacy-policy detection | 재생은 freshness 정책으로, 과다 공개는 privacy policy로 각각 검출될 수 있다. |

### 19. c00-a19 — fixture 기반 Fetch·credential 격리 실습

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 19 / `fixture-based-fetch-and-credential-isolation-lab` / developer-lab / lab / 6,000 |
| visualKey | `c00-a19` |
| assumes | `[claim-profile, request-scope, verifier-nonce, credential-isolation, disclosure-boundary, negative-test]` |
| introduces | `[safe-fixture, allowed-origin, disclosure-manifest, lab-scope]` |
| checkpoint | 실제 bearer token·인증 쿠키·개인정보 없이 fixture에 허용 origin·요청 범위·공개 필드·freshness 가정을 기록하고 결과 범위를 해석한다. |
| 독자 질문 | “실제 계정 없이 fetch와 공개 범위 검사를 어떻게 재현하고, 통과 결과를 어디까지 해석할 수 있는가?” |
| 범위 / 제외 | fixture, challenge, allowed origin, disclosure manifest의 안전한 실습 흐름을 다룬다. 실제 서비스 자동화·실계정·실제 토큰·production 보안 보장은 제외한다. |
| 반영 정정 | fixture와 manifest의 형식은 프로젝트가 정의한 교육용 산출물이지 TLSNotary나 RFC 6750의 프로토콜 요구가 아니라고 쓴다. fixture 통과는 해당 입력에서의 동작만 보인다고 제한한다. |
| 권장 1차 refs | [RFC 6750 §1.2](https://www.rfc-editor.org/rfc/rfc6750#section-1.2), [TLSNotary 소개](https://tlsnotary.org/docs/intro/) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | fixture 안전 경계 | secret-free lab 입력 설명 | 경계도 | synthetic fixture, private token 금지, allowed origin·challenge | 실습 fixture는 실제 token·쿠키·개인정보 없이 허용 origin과 challenge를 포함한다. |
| 2 | disclosure manifest | 공개 범위 기록 방법 | manifest 예시 도식 | response fixture, selected fields, excluded private values, consumer | disclosure manifest는 어떤 필드가 어떤 수신자에게 공개되는지 기록하며 fixture 자체의 보안 보장을 뜻하지 않는다. |

### 20. c00-a20 — toy predicate·reject-case 실습

| 필드 | 계약 |
|---|---|
| order / slug / 역할 / 난이도 / 목표 | 20 / `toy-predicate-and-reject-case-lab` / developer-lab / lab / 6,000 |
| visualKey | `c00-a20` |
| assumes | `[statement, witness, public-input, relation, circuit, policy-gate, negative-test, lab-scope]` |
| introduces | `[toy-predicate, reject-case, production-limitation]` |
| checkpoint | toy predicate에서 public input·witness·constraint·verifier policy를 실제 연결하고 wrong path·stale·policy mismatch를 모델링한 경우에만 거절됨을 보인다. |
| 독자 질문 | “reject case를 회로나 policy에 넣지 않았는데 verifier가 거절할 것이라고 기대하면 왜 안 되는가?” |
| 범위 / 제외 | 작은 relation 기반 모델과 거절 사례를 다룬다. production proving system, soundness·parser binding·key management·end-to-end 보장 주장은 제외한다. |
| 반영 정정 | stale·policy mismatch는 실제 검증 입력 또는 policy gate에 모델링돼야 한다고 쓴다. 실습 통과를 production circuit 안전성으로 일반화하지 않는다. |
| 권장 1차 refs | [Goldwasser–Micali–Rackoff](https://doi.org/10.1145/22145.22178), [Groth16](https://eprint.iacr.org/2016/260) |

| VisualPlaceholder | title | purpose | recommended | mustShow | alt |
|---|---|---|---|---|---|
| 1 | toy predicate 관계 | 학습용 relation의 연결 표시 | verifier gate 도식 | public input·witness·constraint·policy gate | toy predicate는 공개 입력과 witness, constraint, verifier policy가 연결된 제한된 학습 모델이다. |
| 2 | valid와 reject 입력 | reject 조건의 실제 모델링 표시 | 입력-결과 표 | valid, wrong path, stale value, policy identifier와 각 결과 | wrong path·stale·policy mismatch는 검증 입력 또는 policy gate에 포함될 때에만 거절 사례가 된다. |

## 역할 handoff와 반송 규칙

| 역할 | 인수 조건 | 산출물 | 반송 조건 |
|---|---|---|---|
| 아키텍트 | 이 계약과 증거 ledger | 편별 id·의존성·범위·정정·visualKey | 목표 분량 합계, 선행 의존성, 팩트체크 범위를 바꾸려는 요청은 아키텍트로 반송 |
| 리서처 | 해당 편의 권장 1차 refs와 정정 문장 | 주장별 출처 메모, 버전·가정·미확인 항목 | 1차 근거 없이 새 사실·수치·제품 보장을 추가하려면 반송 |
| 원고 작성자 | 확정된 article 계약과 리서치 메모 | frontmatter, 고정 H2 순서, 초안, 두 `VisualPlaceholder` 호출 | assumes에 없는 개념, 범위 밖 구현 상세, proof/receipt/decision 혼동은 선행 편 또는 아키텍트로 반송 |
| 기술 검토자 | 초안과 source memo | 사실·버전·보장 강도 판정 | TLS endpoint 보장을 제3자 provenance로 전이, DPoP를 일반 zkTLS 표준화, MPC·ZK 자동 보장, parser/policy binding 누락은 반송 |
| 시각 자료 담당 | article의 두 visual 표와 확정 용어 | `VisualPlaceholder` props: title, purpose, recommended, mustShow, alt | 그림이 새 사실·수치·보장 또는 다른 참여자 역할을 추가하면 원고 작성자·리서처로 반송 |
| 편집자 | 기술 검토 통과본 | 독자 이해도 윤문과 한국어 문체 검토본 | 보호 대상 변경, H2 재구성, 의미·조건·부정·의무 강도 변화는 반송 |

반송본은 문제 문장, 위반한 계약 필드, 필요한 수정, 근거 URL을 함께 기록한다. 원고 작성자는 반송 사유를 해결한 뒤 같은 `id`, `order`, `slug`, `visualKey`를 유지해 재제출한다.

## 완료 판정

- 20개 article record가 정확한 `c00-a01`~`c00-a20`, order 1~20, 역할, 목표 분량, visualKey를 가진다.
- 모든 `assumes` 키는 앞선 `introduces`에 존재하며, 각 글은 시각 자료 표 두 행을 가진다.
- 각 원고는 공통 H2 순서와 두 `VisualPlaceholder`의 필수 props를 지키며, 권장 refs 2~4개를 유지한다.
- 팩트체크의 한정 조건과 과장 금지가 본문·캡션·alt에 모두 반영되고, 새 사실은 검증 전까지 추가하지 않는다.
