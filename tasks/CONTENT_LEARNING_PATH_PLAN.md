# zkTLS 독자 수준 기반 학습 경로 최종안

- 검토일: 2026-07-29
- 대상 독자: 정보보안기사 수준의 보안 용어와 웹·API·TLS의 기본 목적은 알지만, ZK·zkTLS를 설계하거나 구현한 경험은 없는 개발자·보안 엔지니어
- 대상 자료: `content/drafts/**/*.mdx` 48편, `content/article-roadmap.json`, `tasks/CONTENT_REBALANCE_PLAN.md`
- 검토 방식: 메인 재판정 후 비판 전담 서브에이전트의 독립 반증, 수치·본문 근거 재검산
- 편집 범위: 학습 경로와 원고 역할 판정
- 제외 범위: 원고·제목·H2·메타데이터 수정, 사실 최신화, 시각 컴포넌트 구현

## 최종 판정

기존 48편을 모두 순서대로 읽게 하는 구성은 이 독자에게 과설계다. 앞선 `4·5·8·4·5·5·8·9편` 재배치안도 주제 균형에는 적합하지만, 학습 경로로는 여전히 길다.

최종 구조는 다음과 같이 이원화한다.

1. **Start here 필수 경로 18편**
2. **구현 실습 확장 경로 2편**
3. **기존 48편을 보존하는 선택·참고 자료실**

기존 8개 챕터는 자료를 찾는 분류 체계로 유지할 수 있다. 그러나 처음 공부하는 독자에게는 챕터 전체가 아니라 별도 `Start here` 경로를 제공해야 한다.

`tasks/CONTENT_REBALANCE_PLAN.md`는 주제 중복과 편수 재배치에 대한 1차 감사로 남긴다. 이 문서가 독자 학습 경로에 대한 최종 판정을 우선한다.

## 독자 계약

### 이미 안다고 보는 것

- CIA의 기본 의미
- 인증과 인가의 기본 차이
- HTTP 요청·응답과 API
- TLS가 통신 기밀성과 무결성을 제공한다는 사실
- 해시, 대칭키, 공개키, 전자서명의 기본 목적

### 다시 연결해서 설명할 것

- trust boundary와 attack surface를 실제 데이터 흐름에 표시하는 법
- TLS handshake, certificate, record가 각각 맡는 역할
- 인증된 응답과 정당한 application claim의 차이
- nonce, challenge, freshness, replay의 관계

### 처음부터 설명할 것

- provenance 문제
- Origin, Prover, Notary, Verifier, Relying application의 역할
- TLS transcript와 제3자 검증의 간극
- receipt·attestation, selective opening, ZK proof, verifier decision의 차이
- statement, witness, public input, circuit
- commitment와 selective disclosure
- MPC와 MPC-TLS
- parser·canonicalization·field path가 claim 의미를 결정하는 방식

### 최종 학습 성과

필수 경로를 마친 독자는 다음을 설명할 수 있어야 한다.

1. HTTPS 응답 복사본이 제3자 증거가 되지 않는 이유
2. zkTLS가 단일 프로토콜이 아니라 여러 provenance·공개·검증 방식을 묶는 문제 영역인 이유
3. 각 참여자가 무엇을 보고, 만들고, 검증하고, 신뢰하는지
4. TLS bytes가 application claim으로 해석되기까지 필요한 binding
5. provenance 획득 방식, 검증 주체, 공개 방식이라는 세 축으로 zkTLS 구성을 비교하는 법
6. `Specify/Challenge → Fetch → Bind/Prove → Verify/Rely` 흐름
7. proof가 유효해도 claim 또는 업무 판단이 실패할 수 있는 조건

## 재검토에서 확인한 핵심 문제

### 1. 초급 원고가 zkTLS 사전지식을 요구한다

Chapter 01에서 `prover`, `verifier`, `witness`, `circuit`, `commitment`, `notary`, `MPC-TLS` 등 13개 전문 용어를 집계하면 `zkTLS Bridge` 이전 본문에 합계 198회 등장한다. 이 수치는 설명 누락을 직접 증명하지는 않지만, 기초 보안 개념과 zkTLS 역할이 강하게 섞였다는 신호다.

예를 들어 `trust-boundary-attack-surface.mdx`는 일반적인 경계를 정의한 직후 prover·verifier·notary·MPC-TLS를 예시로 사용한다. 독자는 trust boundary를 배우면서 동시에 처음 보는 architecture를 역추론해야 한다.

### 2. `proof`가 서로 다른 증거물을 뭉뚱그린다

현재 원고에서는 다음 결과물이 모두 `proof`라는 말 주변에 놓인다.

- TLS session provenance 자료
- notary가 서명한 receipt 또는 attestation
- commitment의 selective opening
- ZK predicate proof
- verifier가 policy에 따라 만든 application decision

`mpc-tls-tlsnotary.mdx`는 `signed Session Header`, opening, parser output과 ZK의 역할을 구분한다. 반면 `fetch-prove-verify-pipeline.mdx`는 `proofBytes`, `circuitVersion`이 있는 ZK형 object를 공통 기본형처럼 제시한다. 초반에 증거물 종류와 책임자를 나누지 않으면 모든 zkTLS 방식이 circuit proof를 만든다고 오해할 수 있다.

### 3. 28편 초안도 실제 학습량을 줄이지 못한다

1차 재판정에서 핵심 28편을 만들 때 사용한 기존 원고는 25편이다. 로드맵의 `actualWordCount` 합계는 175,091로 전체 337,178의 51.9%다. 기존 장문을 분할해 편수만 늘리면 핵심 경로는 여전히 장기 전문과정이 된다.

따라서 핵심 경로는 기존 원고를 이어 붙이지 않고 독자 질문 하나, 모델 하나, 실패 사례 하나를 중심으로 새로 압축해야 한다.

### 4. bytes와 claim 의미를 잇는 글이 없다

`canonicalization`, parser, field path, statement mismatch는 해시, Injection, TLS record, Merkle proof, ZK properties, MPC-TLS, toy circuit 원고에 흩어져 있다.

현재 `Injection과 output encoding`은 대부분 SQL·HTML·shell sink를 다룬다. 끝부분의 parser·canonicalization 설명만으로 핵심 연결 글을 대신할 수 없다. `HTTP/TLS bytes → parser → field path → predicate → public claim`을 독립적으로 설명해야 한다.

### 5. Verify 요구사항이 Fetch보다 먼저 와야 한다

현재 `Fetch-Prove-Verify` 순서는 구현 단계를 설명하기에는 간결하지만, statement와 verifier policy를 뒤늦게 정하는 것처럼 읽힐 수 있다.

audience, challenge, freshness, 허용 origin, request 조건, 공개 범위는 Fetch 전에 정해야 한다. 최종 공통 흐름은 다음과 같다.

```txt
Specify claim and policy
  → issue audience-bound challenge
  → Fetch
  → Bind / Prove
  → Verify
  → Rely or reject
```

## Start here 필수 경로 — 18편

각 글의 `assumes`는 앞선 글의 `introduces`에 포함돼야 한다. 참고 자료를 읽지 않아도 필수 경로만으로 다음 글에 진입할 수 있어야 한다.

### 필수 경로 분량 예산

편수만 줄이고 기존 장문을 이어 붙이는 일을 막기 위해 현행 로드맵의 `wordCountTarget`·`actualWordCount`와 같은 산정 방식을 사용해 상한을 둔다.

| Phase | 글 수 | 분량 상한 |
|---|---:|---:|
| Phase 1. 문제와 참여자 | 3 | 10,000 |
| Phase 2. TLS provenance 최소 토대 | 4 | 15,000 |
| Phase 3. 웹 응답을 claim으로 바꾸기 | 3 | 13,000 |
| Phase 4. Proof와 MPC의 최소 문법 | 4 | 15,000 |
| Phase 5. Architecture와 통합 검증 | 4 | 17,000 |
| **Start here 합계** | **18** | **70,000** |

- 일반 개념 글은 4,000을 넘기지 않는다.
- 사례 연구·통합 trace·capstone은 5,000을 넘기지 않는다.
- 개발자 실습 2편의 합계는 12,000을 넘기지 않는다.
- 상한을 넘는 세부 설명은 필수 글을 늘리지 않고 자료실 원고로 연결한다.
- 집필 전에 현재 콘텐츠 검증기가 사용하는 분량 산정법을 그대로 재사용해 단위 불일치를 막는다.

### Phase 1. 문제와 참여자

| # | 필수 글 | 새로 설명하는 것 | 완료 기준 | 주요 원천 |
|---:|---|---|---|---|
| 1 | 복사본·스크린샷·토큰 공유가 증거가 아닌 이유 | provenance gap, source와 copy의 차이 | 일반 TLS가 endpoint에는 authenticity를 주지만 제3자에게 바로 전이되지 않는 이유를 말한다. | c08-a01 |
| 2 | zkTLS 참여자와 증거물 지도 | Origin, Prover, Notary, Verifier, Relying application; session 자료, receipt, opening, ZK proof, decision | 누가 어떤 artifact를 만들고 확인하는지 구분한다. | c08-a01, c08-a03, c08-a05 |
| 3 | 익숙한 웹 흐름에서 그리는 trust boundary | 권한·소유자·가시성 변화, 최소 공격자 모델 | 브라우저–API–제3자 흐름에 보이는 데이터와 조작 가능한 입력을 표시한다. | c01-a03, c01-a05 |

Phase 1에서는 MPC-TLS, TLSNotary, DECO의 내부 구조를 설명하지 않는다. 역할 이름과 앞으로 비교할 문제만 예고한다.

### Phase 2. TLS provenance에 필요한 최소 토대

| # | 필수 글 | 새로 설명하는 것 | 완료 기준 | 주요 원천 |
|---:|---|---|---|---|
| 4 | HTTPS 보호 경로: handshake와 record | handshake, traffic secret, protected record | URL 요청이 인증된 application bytes가 되기까지의 큰 흐름을 그린다. | c03-a02 |
| 5 | TLS transcript와 origin binding | certificate chain, service identity, CertificateVerify, Finished, transcript | “어떤 서버와 맺은 어떤 세션인가”가 어디에 묶이는지 말한다. | c03-a02, c03-a03, c03-a05 |
| 6 | Record 인증과 제3자 전이의 간극 | AEAD, MAC/HMAC, tag, endpoint secret | client가 TLS 데이터를 받았다는 사실과 제3자가 그 출처를 검증하는 일이 다른 이유를 말한다. | c02-a02, c02-a04, c03-a04, c08-a03 |
| 7 | TLS 1.2·1.3과 구현 지원 경계 | version별 transcript·key schedule 차이가 구현 지원 범위에 주는 영향 | “TLS를 지원한다”가 단일 기능 플래그가 아닌 이유를 설명한다. | c03-a03 |

난수원·DRBG, cipher suite 카탈로그, 0-RTT·ECH·QUIC·mTLS 상세는 필수 경로에 넣지 않는다. nonce, challenge, freshness는 실제로 쓰이는 Phase 3에서 설명한다.

### Phase 3. 웹 응답을 claim으로 바꾸기

| # | 필수 글 | 새로 설명하는 것 | 완료 기준 | 주요 원천 |
|---:|---|---|---|---|
| 8 | Claim specification: verifier가 먼저 정해야 할 것 | origin, request method/path/body, auth context, response scope, field path, predicate, audience, challenge, freshness, policy | Fetch 전에 statement와 허용 조건을 작성한다. | c08-a05, c01-a06, c07-a03 |
| 9 | Bytes-to-claim binding | HTTP/JSON parser, canonicalization, redirect, compression, duplicate key, Unicode·숫자 표현, redaction | 같은 bytes를 서로 다른 claim으로 읽는 혼동을 설명하고 막을 조건을 적는다. | c02-a03, c03-a04, c05-a03, c07-a02, c07-a03, c08-a06 |
| 10 | Credential 격리와 “진짜 응답 ≠ 정당한 claim” | session/token 비노출, 인증·인가, BOLA 반례, provenance와 truth·reliance의 차이 | origin에서 온 응답도 권한·현실의 진실·업무상 수용을 자동 보장하지 않음을 설명한다. | c01-a04, c05-a02, c05-a04, c08-a01 |

일반 BOLA 공격 유형, OAuth/OIDC 상세, SQL·HTML·shell Injection 카탈로그는 참고 자료로 남긴다.

### Phase 4. Proof와 MPC의 최소 문법

| # | 필수 글 | 새로 설명하는 것 | 완료 기준 | 주요 원천 |
|---:|---|---|---|---|
| 11 | Prover, Verifier, statement, witness, public input, circuit | proof relation의 역할과 공개·비공개 입력 | “무엇을 증명하고 무엇을 숨기는가”를 입력과 관계로 쓴다. | c07-a03 |
| 12 | Commitment와 selective disclosure | hiding, binding, opening, 공개 범위 | 원문 전체를 공개하지 않고 특정 값·범위만 묶어 공개하는 구조를 말한다. | c07-a01 |
| 13 | Completeness, soundness, zero-knowledge와 under-constrained circuit | 보장 성질, statement mismatch, constraint 누락 | 유효한 proof가 잘못된 claim을 증명하는 사례를 찾는다. | c07-a03, c08-a06 |
| 14 | MPC 기초: 입력 분리, key share, adversary model | 공동 계산, semi-honest·malicious 차이, collusion, abort | MPC-TLS라는 이름 없이 두 참여자가 secret을 나누는 이유와 남는 가정을 설명한다. | c07-a05 |

Merkle tree, SNARK/STARK, garbled circuit·oblivious transfer, VC·anonymous credential은 선택 심화로 둔다.

### Phase 5. Architecture와 통합 검증

| # | 필수 글 | 새로 설명하는 것 | 완료 기준 | 주요 원천 |
|---:|---|---|---|---|
| 15 | Architecture 결정 축: provenance 획득·검증 주체·공개 방식 | provenance 획득은 proxy·MPC-TLS·DECO 계열, 검증 주체는 online verifier·delegated notary, 공개 방식은 selective opening·ZK predicate로 분리 | 구체적인 시스템을 세 축에 각각 배치하고 notarization을 독립 protocol 계열로 오해하지 않는다. | c08-a02, c08-a03, c08-a04 |
| 16 | TLSNotary/MPC-TLS 사례 연구 | MPC-TLS phase, Session Header, commitment, opening, parser | 한 구현에서 provenance 자료와 application claim이 어떻게 분리되는지 추적한다. | c08-a03 |
| 17 | 통합 trace: Specify/Challenge에서 Verify/Rely까지 | artifact ownership, 단계별 입력·출력·실패 | 한 합성 사례를 처음부터 끝까지 추적한다. | c08-a05 |
| 18 | Negative-test capstone | wrong origin/request/path, stale challenge, replay, 과다 공개, policy mismatch, parser mismatch, collusion·abort | 정상 성공 사례가 아니라 거부되어야 할 변형을 설명한다. | c01-a06, c08-a05, c08-a06 |

## 개발자 실습 확장 경로 — 2편

필수 경로를 이해하는 것과 구현하는 것은 구분한다. 코드를 직접 다루려는 독자만 다음 두 편을 이어서 읽는다.

| # | 실습 | 범위 | 제외 |
|---:|---|---|---|
| 19 | 합성 fixture를 사용하는 Fetch·credential 격리 실습 | 허용 origin, challenge, private token, response fixture, disclosure manifest | 실제 계정·실제 토큰·실서비스 자동화 |
| 20 | Toy predicate와 Verify reject-case 실습 | statement, witness, public input, constraint, wrong-path·stale·policy mismatch test | production 보안 보장 주장 |

## 기존 48편 재판정

판정 용어:

- **핵심 재작성**: 필수 경로의 중심 원천이지만 현재 원고를 그대로 쓰지 않는다.
- **부분 추출**: 필요한 설명만 필수 글에 옮기고 원문 전체는 참고 자료로 둔다.
- **참고 유지**: 필수 경로의 선행 조건이 아니며 자료실에서 선택해 읽는다.
- **통합·비편수화**: 독립 글보다 도입부, 점검표 또는 다른 참고 글에 합친다.

### Chapter 01. Security Thinking

| ID | 현재 원고 | 최종 판정 | 필수 경로에서의 쓰임 |
|---|---|---|---|
| c01-a01 | CIA는 왜 아직 유효한가 | 통합·비편수화 | 준비도 점검과 용어 recap |
| c01-a02 | 자산·위협·취약점·위험의 관계 | 통합·비편수화 | 준비도 점검과 위협 모델 worksheet |
| c01-a03 | Trust boundary와 attack surface | 핵심 재작성 | 필수 3; 일반 웹 흐름 뒤에 zkTLS 역할을 붙임 |
| c01-a04 | 인증·인가·감사의 차이 | 부분 추출 | 필수 10; proof와 authorization·decision 구분 |
| c01-a05 | Threat modeling 입문 | 부분 추출 | 필수 3·18; 최소 공격자 모델과 negative test |
| c01-a06 | 보안 통제는 어떻게 실패하는가 | 부분 추출 | 필수 8·17·18; freshness·policy binding·secret-free audit |

### Chapter 02. Cryptographic Primitives

| ID | 현재 원고 | 최종 판정 | 필수 경로에서의 쓰임 |
|---|---|---|---|
| c02-a01 | 난수와 entropy | 참고 유지 | nonce·challenge 관련 부분만 필수 8·18에 반영 |
| c02-a02 | 대칭키 암호와 AEAD | 부분 추출 | 필수 6 |
| c02-a03 | 해시 함수와 충돌 저항성 | 부분 추출 | 필수 9·12; canonical bytes와 binding |
| c02-a04 | MAC, HMAC, tag 검증 | 부분 추출 | 필수 6 |
| c02-a05 | 공개키, 서명, 키 교환 | 부분 추출 | 필수 4·5; server identity와 session 형성 |
| c02-a06 | 키 관리와 crypto period | 참고 유지 | production·operations 자료실 |

### Chapter 03. Web Trust and TLS

| ID | 현재 원고 | 최종 판정 | 필수 경로에서의 쓰임 |
|---|---|---|---|
| c03-a01 | SSL이 아니라 TLS라고 부르는 이유 | 통합·비편수화 | 필수 4의 짧은 명칭·버전 상자 |
| c03-a02 | HTTPS 요청은 어떻게 보호되는가 | 핵심 재작성 | 필수 4·5 |
| c03-a03 | TLS 1.2와 TLS 1.3의 구조적 차이 | 부분 추출 | 필수 5·7; 상세 비교는 참고 유지 |
| c03-a04 | TLS record layer와 AEAD | 핵심 재작성 | 필수 6·9 |
| c03-a05 | PKI, X.509, certificate chain | 부분 추출 | 필수 5; SAN·chain·CertificateVerify에 집중 |
| c03-a06 | 0-RTT, ECH, QUIC, mTLS | 참고 유지·향후 분할 | 현대 TLS 확장 자료실 |

### Chapter 04. Network Tunnels and Identity Planes

| ID | 현재 원고 | 최종 판정 | 필수 경로에서의 쓰임 |
|---|---|---|---|
| c04-a01 | VPN은 무엇을 숨기고 무엇을 못 숨기나 | 참고 유지 | network path privacy와 provenance 비교 |
| c04-a02 | IPsec, IKEv2, ESP | 참고 유지·병합 후보 | c04-a03과 tunnel 비교 자료 |
| c04-a03 | WireGuard와 modern VPN | 참고 유지·병합 후보 | c04-a02와 tunnel 비교 자료 |
| c04-a04 | DNS, DoH, DoT, ECH | 참고 유지 | TLS metadata privacy 확장 |
| c04-a05 | Zero Trust Network Access | 참고 유지 | 접근 policy context |
| c04-a06 | Service mesh와 mTLS | 참고 유지 | workload identity와 내부 trust plane |

### Chapter 05. Application and API Security

| ID | 현재 원고 | 최종 판정 | 필수 경로에서의 쓰임 |
|---|---|---|---|
| c05-a01 | OWASP Top 10 최신판 읽는 법 | 통합·비편수화 | Chapter 05 자료실 도입부 |
| c05-a02 | Broken Access Control과 BOLA | 부분 추출 | 필수 10의 “진짜 응답 ≠ 정당한 claim” 반례 |
| c05-a03 | Injection과 output encoding | 부분 추출 | 필수 9에는 parser·canonicalization 부분만 사용; 일반 Injection은 참고 유지 |
| c05-a04 | Authentication, session, token 실패 | 부분 추출 | 필수 10의 credential 격리 |
| c05-a05 | API inventory, shadow API, rate limit | 참고 유지 | 운영 자료실 |
| c05-a06 | Logging, alerting, exceptional conditions | 부분 추출 | 필수 18의 secret-free reason·audit; 전체는 운영 자료실 |

### Chapter 06. Secure Systems and Supply Chain

| ID | 현재 원고 | 최종 판정 | 필수 경로에서의 쓰임 |
|---|---|---|---|
| c06-a01 | Secure by Design | 참고 유지 | production 설계 원칙 |
| c06-a02 | Dependency risk와 SBOM | 참고 유지 | 공급망 자료실 |
| c06-a03 | Secrets management | 참고 유지 | credential·service secret 운영 |
| c06-a04 | CI/CD signing, provenance, attestation | 참고 유지 | verifier·circuit build provenance |
| c06-a05 | Container / Kubernetes security posture | 참고 유지 | verifier runtime hardening |
| c06-a06 | Memory safety와 Rust 전환 | 참고 유지 | parser·FFI implementation safety |

### Chapter 07. Privacy-Preserving Proof Systems

| ID | 현재 원고 | 최종 판정 | 필수 경로에서의 쓰임 |
|---|---|---|---|
| c07-a01 | Commitment와 selective disclosure | 핵심 재작성 | 필수 12 |
| c07-a02 | Merkle proof와 inclusion claim | 참고 유지·부분 추출 | canonicalization 사례를 필수 9에 반영 |
| c07-a03 | 영지식 증명의 completeness, soundness, zero-knowledge | 핵심 분할 재작성 | 필수 11·13 |
| c07-a04 | SNARK vs STARK trade-off | 참고 유지 | proof backend 선택 |
| c07-a05 | MPC와 garbled circuit | 핵심·참고 분리 | MPC는 필수 14, garbled circuit·OT는 참고 유지 |
| c07-a06 | Verifiable credentials와 anonymous credentials | 참고 유지 | credential 생태계 확장 |

### Chapter 08. zkTLS Architectures and Labs

| ID | 현재 원고 | 최종 판정 | 필수 경로에서의 쓰임 |
|---|---|---|---|
| c08-a01 | zkTLS가 해결하는 provenance 문제 | 핵심 재작성 | 필수 1·2·10; 초반 architecture 이름 과밀 제거 |
| c08-a02 | Proxy 방식과 신뢰 가정 | 부분 추출 | 필수 15; 상세 proxy 운영은 참고 유지 |
| c08-a03 | MPC-TLS와 TLSNotary | 핵심 재작성 | 필수 2·6·14·16 |
| c08-a04 | DECO 계열 설계 | 부분 추출 | 필수 15의 비교 축; 상세 lineage는 참고 유지 |
| c08-a05 | Fetch-Prove-Verify pipeline | 핵심 재작성 | 필수 2·8·17·18; Specify/Challenge를 앞으로 이동 |
| c08-a06 | Toy circuit에서 production risk까지 | 핵심·참고 분리 | 필수 13·18, 실습 20; 운영 상세는 참고 유지 |

## 난이도와 필수 여부를 분리한다

현재 `foundation`, `intermediate`, `deep`, `lab`은 주제 난이도만 표현한다. 독자에게 필요한 순서를 나타내기 위해 별도 메타데이터가 필요하다.

```ts
type PathRole = "core" | "developer-lab" | "deep-dive" | "reference";

type LearningMeta = {
  pathRole: PathRole;
  assumes: string[];
  introduces: string[];
  checkpoint: string;
  readingBudget: number;
};
```

검증 조건:

- `core` 글의 `assumes`는 앞선 `core` 글의 `introduces` 합집합에 포함된다.
- `core` 글은 `reference` 글을 필수 선행 조건으로 요구하지 않는다.
- 처음 등장하는 zkTLS 전문 용어는 이름보다 역할을 먼저 설명한다.
- 문단 하나에 설명 없는 신규 ZK·zkTLS 개념을 2개 넘기지 않는다.
- 글 하나는 하나의 핵심 독자 질문에 답한다.
- `proof`라고 쓸 때 receipt, opening, ZK proof, decision 중 무엇인지 표시한다.
- 글과 Phase의 합산 분량이 선언한 `readingBudget`을 넘지 않는다.

## 준비도 점검

필수 경로 앞에 짧은 비편수형 준비도 점검을 둔다.

- 해시와 전자서명의 차이를 말할 수 있는가?
- 대칭키 암호와 무결성 tag의 역할을 구분하는가?
- TLS가 browser와 server 사이에서 무엇을 보호하는지 말할 수 있는가?
- 인증과 인가를 구분하는가?
- HTTP 요청·응답과 JSON field path를 읽을 수 있는가?

모르는 항목만 Chapter 01·02·03·05의 참고 글로 연결한다. 준비도 점검을 통과한 독자에게 기초 원고 전체를 강제로 읽히지 않는다.

## 누적 예시

필수 18편은 하나의 합성 사례를 계속 사용한다.

```txt
Origin: https://member.example.invalid
Request: GET /api/me
Private credential: session cookie
Response field: /membership/tier
Claim: membership tier == "gold"
Audience: verifier.example.invalid
Freshness: challenge-bound, short validity window
```

각 단계에서 같은 사례에 정보를 하나씩 추가한다.

- Phase 1: 누가 무엇을 보는가?
- Phase 2: 어떤 TLS session과 bytes인가?
- Phase 3: 어떤 request·field·predicate인가?
- Phase 4: 무엇을 숨기고 무엇을 증명하는가?
- Phase 5: 어떤 architecture와 policy가 받아들이는가?

## 시각 자료 우선순위

챕터마다 하나씩 만드는 방식보다 필수 경로의 개념 관문에 맞춰 제작한다.

| 순서 | 시각 자료 | 형식 | 연결 글 |
|---:|---|---|---|
| 1 | 참여자와 증거물 지도 | 정적 + 단계 강조 | 필수 2 |
| 2 | trust boundary와 data visibility | hover·toggle | 필수 3 |
| 3 | handshake·transcript·record | 단계 애니메이션 | 필수 4~6 |
| 4 | request bytes에서 claim까지 | parser·field-path 인터랙션 | 필수 8~10 |
| 5 | witness·public input·circuit 관계 | 인터랙티브 | 필수 11~13 |
| 6 | 세 architecture 결정 축과 통합 trace | 축별 비교표 + swimlane 애니메이션 | 필수 15~18 |

애니메이션은 handshake, MPC-TLS 역할 분리, 통합 trace처럼 시간 순서가 핵심인 경우에만 사용한다.

## 비판 검토 반영 기록

비판 전담 서브에이전트가 지적한 다음 항목을 최종안에 반영했다.

- 28편 초안은 기존 장문 25편을 보존해 실제 학습량을 충분히 줄이지 못한다.
- `proof` artifact taxonomy가 선행돼야 한다.
- 일반 Injection 글을 제목만 바꿔 핵심 parser 글로 사용할 수 없다.
- BOLA 전체보다 provenance·truth·reliance의 차이가 핵심이다.
- verifier statement, challenge, audience, freshness가 Fetch보다 앞서야 한다.
- Proxy와 DECO의 개별 심화보다 architecture 비교표가 먼저다.
- production 상세는 참고로 두되 credential 비노출, freshness, policy binding, secret-free audit은 필수에 남겨야 한다.
- notarization을 독립 architecture로 분류하지 않고 provenance 획득·검증 주체·공개 방식의 직교 축으로 나눠야 한다.
- 핵심 경로에 명시적인 읽기 분량 상한이 있어야 한다.

메인 초안에서 유지한 결정:

- 48편 전부를 직선 필수 과정으로 만들지 않는다.
- 8개 챕터는 자료실 분류로 유지한다.
- trust boundary를 architecture보다 먼저 가르친다.
- transcript는 TLS에서, MPC는 MPC-TLS보다 먼저 설명한다.
- 현대 TLS 확장, network/identity, 공급망, proof 생태계는 선택 경로로 둔다.

비판안에서 조정한 부분:

- proof 역할 문법을 commitment보다 먼저 배치했다.
- architecture 일반 비교 뒤에 TLSNotary/MPC-TLS 사례 하나만 필수로 남겼다.
- production readiness 전체를 필수에서 제외하되 negative-test capstone으로 최소 안전 경계를 보존했다.
- Start here 전체 상한을 70,000, 개발자 실습 합계를 12,000으로 고정했다.

## 실행 순서

1. 이 학습 경로안을 확정한다.
2. 필수 1~3의 독자 질문·역할·용어 사전을 설계한다.
3. 필수 8~10의 claim specification과 parser contract를 먼저 새로 쓴다.
4. 필수 15~18에서 사용할 architecture 비교 축과 negative-test matrix를 고정한다.
5. 그다음 TLS·proof 원고를 필요한 범위로 압축한다.
6. 원본을 덮어쓰지 않고 필수 경로 검토본과 diff를 만든다.
7. 이해도 윤문 후 `humanize-korean` 문체 윤문을 수행한다.
8. `assumes ⊆ 이전 introduces`, 보호 대상, 의미, MDX 렌더링을 검증한다.

필수 8~10을 먼저 설계하는 이유는 이 세 글이 TLS, proof, architecture를 연결하는 누락된 중심축이기 때문이다. 이 계약을 먼저 고정해야 앞뒤 원고에서 무엇을 줄이고 남길지 결정할 수 있다.

## 검토 한계

- 실제 독자 사용성 테스트는 아직 없다.
- 전문 용어 출현 횟수는 인지 부하의 신호이지 설명 품질의 단독 판정 기준이 아니다.
- 이번 검토는 구조·메타데이터·핵심 충돌 본문을 대상으로 했으며 337,178 전체를 문장 단위로 사실 검증하지 않았다.
- 외부 자료의 최신성과 개별 protocol 설명의 정확성은 이번 범위가 아니다.
- 원고와 기존 로드맵은 변경하지 않았다.
