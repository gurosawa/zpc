# zkTLS 원고 구조 재배치 검토

- 검토일: 2026-07-29
- 대상: `content/drafts/**/*.mdx` 48편
- 기준 자료: `content/article-roadmap.json`, 각 원고의 `Reader Question`, `Core Model`, `Failure Mode`, `Minimal Lab or Trace`, `zkTLS Bridge`
- 편집 범위: 구조 판정과 시각 자료 우선순위 제안
- 제외 범위: 원고 수정, 제목·H2 변경, 사실 최신화, 외부 자료 검증, 시각 컴포넌트 구현

## 결론

챕터마다 6편을 맞추는 규칙은 해제하는 편이 낫다. 다만 전체 분량을 더 늘리기보다 현재 48편을 유지하면서 기초·주변부 원고를 핵심 챕터로 재배치한다.

| 챕터 | 현재 | 권장 | 증감 | 핵심 조정 |
|---|---:|---:|---:|---|
| 01. Security Thinking | 6 | 4 | -2 | CIA와 위험 언어를 합치고, 인증·인가·감사는 Chapter 05로 이동 |
| 02. Cryptographic Primitives | 6 | 5 | -1 | 키 관리는 운영 수명주기와 함께 Chapter 06으로 이동 |
| 03. Web Trust and TLS | 6 | 8 | +2 | SSL 명칭 글은 HTTPS 글에 흡수하고, 0-RTT·ECH·QUIC·mTLS를 분리 |
| 04. Network Tunnels and Identity Planes | 6 | 4 | -2 | IPsec과 WireGuard를 비교 글로 합치고, DNS·ECH는 Chapter 03으로 이동 |
| 05. Application and API Security | 6 | 5 | -1 | OWASP 글은 장 도입부로 줄이고, 인증·인가·감사를 받아오며 API 운영 통제를 합침 |
| 06. Secure Systems and Supply Chain | 6 | 5 | -1 | SBOM과 CI/CD provenance를 합치고, 키 관리와 secrets 관리를 함께 다룸 |
| 07. Privacy-Preserving Proof Systems | 6 | 8 | +2 | 증명 구성 요소와 보장 속성을 분리하고, MPC와 garbled circuit을 분리 |
| 08. zkTLS Architectures and Labs | 6 | 9 | +3 | Fetch·Prove·Verify를 각각 다루고, toy circuit과 production readiness를 분리 |
| **합계** | **48** | **48** | **0** | 주변부를 줄이고 zkTLS 학습 경로를 확장 |

이 안의 핵심은 글을 덜 쓰는 것이 아니라 독자가 알아야 할 순서에 맞게 설명 단위를 다시 나누는 것이다.

## 현재 상태에서 확인한 병목

- 로드맵 기준 전체 목표 분량은 326,600이고 `actualWordCount` 합계는 337,178로 103.2%다. 총량 부족이 우선 문제는 아니다.
- 48편 모두 `Reader Question`부터 `References`까지 같은 10개 H2를 사용한다. 검토용 템플릿으로는 유용하지만 최종 원고에서는 주제에 맞는 설명 순서가 드러나지 않는다.
- `0-RTT, ECH, QUIC, mTLS`처럼 서로 다른 문제 네 개가 한 글에 들어간 반면, SSL과 TLS의 명칭 차이는 한 편을 차지한다.
- ECH는 Chapter 03과 Chapter 04에, mTLS는 Chapter 03과 Chapter 04에 중복 배치돼 있다.
- 키 관리와 secrets 관리, SBOM과 CI/CD provenance처럼 같은 수명주기에서 읽어야 할 글이 다른 단위로 흩어져 있다.
- 48편은 14개 `visualKey`를 공유하지만 현재 `ArtifactDiagram`이 실제로 그릴 수 있는 키에 연결된 글은 15편뿐이다. 33편은 9개 미구현 키를 사용한다.
- 같은 `risk-matrix`가 7편에 배정돼 있다. 시각 키를 재사용하더라도 글마다 데이터와 강조 관계가 달라야 한다.

## 판정 기준

각 원고는 다음 질문으로 판정했다.

1. 독자 질문이 다른 글과 독립적인가?
2. 하나의 글이 서로 다른 프로토콜·역할·실패 원인을 과도하게 묶고 있지 않은가?
3. 현재 예상 독자가 이미 아는 웹·API·기본 보안 설명이 핵심 zkTLS 설명보다 길지 않은가?
4. 뒤 챕터를 이해하는 데 필요한 선행 개념인가?
5. zkTLS 연결이 단순 비유인지, 실제 설계 판단으로 이어지는지?
6. 실습이 글의 핵심 모델을 검증하는가?
7. 정적 도식, 단계 애니메이션, 인터랙티브 실습 중 하나가 이해도를 실제로 높이는가?

판정 용어는 다음과 같다.

- **유지**: 독립된 독자 질문과 학습 목표가 있다.
- **병합**: 별도 글보다 같은 흐름 안에서 읽을 때 인과관계가 선명하다.
- **분할**: 프로토콜·역할·실패 모델이 둘 이상이라 한 편에서 충분히 설명하기 어렵다.
- **이동**: 내용은 필요하지만 현재 챕터보다 다른 챕터의 학습 흐름에 맞는다.
- **비편수화**: 삭제하지 않고 장 도입부, 사이드바, 체크리스트 또는 부록으로 남긴다.

## 48편 판정표

### Chapter 01. Security Thinking

| ID | 현재 원고 | 판정 | 새 위치 | 근거 | 권장 시각 |
|---|---|---|---|---|---|
| c01-a01 | CIA는 왜 아직 유효한가 | 병합 | C01-01 | CIA는 보안 목표이고 자산·위험은 그 목표를 구체화하는 판단 순서다. 별도 글보다 하나의 도입 흐름이 낫다. | 목표→자산→실패 비용 정적 행렬 |
| c01-a02 | 자산·위협·취약점·위험의 관계 | 병합 | C01-01 | c01-a01의 추상 축을 실제 위험 판단으로 연결한다. | 위험 판단 사슬 |
| c01-a03 | Trust boundary와 attack surface | 유지 | C01-02 | 이후 proxy, MPC-TLS, browser, verifier 역할을 비교하는 공통 도구다. | 경계·관찰자 토글 지도 |
| c01-a04 | 인증·인가·감사의 차이 | 이동 | C05-01 | API 요청과 verifier decision을 설명할 때 가장 직접적으로 쓰인다. | subject-object-policy-event 그래프 |
| c01-a05 | Threat modeling 입문 | 유지 | C01-03 | 뒤의 architecture trust assumption을 읽기 위한 절차적 기초다. | 위협 모델 반복 루프 |
| c01-a06 | 보안 통제는 어떻게 실패하는가 | 유지 | C01-04 | proof validity와 product security가 다른 이유를 설명하는 장의 결론이다. | 통제 실패 유형 매트릭스 |

### Chapter 02. Cryptographic Primitives

| ID | 현재 원고 | 판정 | 새 위치 | 근거 | 권장 시각 |
|---|---|---|---|---|---|
| c02-a01 | 난수와 entropy | 유지 | C02-01 | nonce, challenge, salt, proof randomness의 차이를 설명하는 선행 개념이다. | entropy→DRBG→사용처 단계 애니메이션 |
| c02-a02 | 대칭키 암호와 AEAD | 유지 | C02-03 | TLS record와 tag 검증의 직접 선행 개념이다. | AEAD 입력·출력 봉투 애니메이션 |
| c02-a03 | 해시 함수와 충돌 저항성 | 유지·순서 조정 | C02-02 | commitment, transcript digest, Merkle tree보다 먼저 읽어야 한다. | 기존 `HashLab` 확장 |
| c02-a04 | MAC, HMAC, tag 검증 | 유지 | C02-04 | keyed authentication과 public hash의 차이를 분리할 필요가 있다. | 메시지 변경→tag reject 인터랙션 |
| c02-a05 | 공개키, 서명, 키 교환 | 유지 | C02-05 | TLS server authentication과 session key agreement를 구분하는 핵심 글이다. | 인증과 키 교환의 이중 경로 |
| c02-a06 | 키 관리와 crypto period | 이동·병합 | C06-03 | primitive 자체보다 생성·저장·회전·폐기라는 운영 수명주기에 속한다. | secret·key 상태 전이도 |

### Chapter 03. Web Trust and TLS

| ID | 현재 원고 | 판정 | 새 위치 | 근거 | 권장 시각 |
|---|---|---|---|---|---|
| c03-a01 | SSL이 아니라 TLS라고 부르는 이유 | 병합 | C03-01 도입부 | 독립된 학습 목표보다 HTTPS 보호 경로를 읽기 위한 명칭·버전 전제에 가깝다. | 짧은 버전 계보 |
| c03-a02 | HTTPS 요청은 어떻게 보호되는가 | 유지·확장 | C03-01 | TLS 챕터 전체의 기준 경로다. c03-a01을 흡수한다. | handshake→record→HTTP 단계 애니메이션 |
| c03-a03 | TLS 1.2와 TLS 1.3의 구조적 차이 | 유지 | C03-02 | zkTLS 구현 비용과 transcript 구조 차이를 직접 설명한다. | 두 버전 동기화 타임라인 |
| c03-a04 | TLS record layer와 AEAD | 유지 | C03-03 | application claim을 TLS ciphertext와 연결하는 바닥이다. | record 분해 인터랙션 |
| c03-a05 | PKI, X.509, certificate chain | 유지 | C03-04 | origin binding을 설명하는 독립된 검증 절차다. | 인증서 경로 검증 지도 |
| c03-a06 | 0-RTT, ECH, QUIC, mTLS | 분할 | C03-05~C03-08 | 성능·replay, metadata privacy, transport 통합, client identity는 실패 모델과 실습이 서로 다르다. | 기능별 고유 시각물 4개 |

### Chapter 04. Network Tunnels and Identity Planes

| ID | 현재 원고 | 판정 | 새 위치 | 근거 | 권장 시각 |
|---|---|---|---|---|---|
| c04-a01 | VPN은 무엇을 숨기고 무엇을 못 숨기나 | 유지 | C04-01 | network path privacy와 origin proof의 차이를 가장 짧게 설명한다. | 관찰자별 가시성 토글 |
| c04-a02 | IPsec, IKEv2, ESP | 병합 | C04-02 | WireGuard와 별도 명세 해설을 두기보다 tunnel state와 trust surface를 비교하는 편이 목적에 맞다. | IPsec·WireGuard 비교 스택 |
| c04-a03 | WireGuard와 modern VPN | 병합 | C04-02 | c04-a02와 같은 독자 질문인 “경로 보호가 무엇을 보장하는가”에 답한다. | IPsec·WireGuard 비교 스택 |
| c04-a04 | DNS, DoH, DoT, ECH | 이동·병합 | C03-06 | ECH의 DNS bootstrap과 ClientHello privacy는 TLS 흐름 안에서 읽어야 한다. | DNS→ECH 가시성 계층 |
| c04-a05 | Zero Trust Network Access | 유지 | C04-03 | response provenance와 접근 결정 context의 차이를 설명한다. | policy decision flow |
| c04-a06 | Service mesh와 mTLS | 유지·범위 축소 | C04-04 | mTLS mechanics는 Chapter 03에 두고, 여기서는 workload identity와 policy plane에 집중한다. | mesh identity·policy plane 지도 |

### Chapter 05. Application and API Security

| ID | 현재 원고 | 판정 | 새 위치 | 근거 | 권장 시각 |
|---|---|---|---|---|---|
| c05-a01 | OWASP Top 10 최신판 읽는 법 | 비편수화 | Chapter 05 도입부·참고 상자 | 현재 독자에게 분류표 읽는 법보다 실제 API failure trace가 중요하다. 버전 의존 설명도 별도 글보다 짧은 참고 상자가 안정적이다. | 버전·범주 대응표 |
| c05-a02 | Broken Access Control과 BOLA | 유지 | C05-02 | origin에서 온 진짜 응답도 권한 없는 객체의 응답일 수 있다는 핵심 반례다. | 객체 접근 행렬 인터랙션 |
| c05-a03 | Injection과 output encoding | 유지 | C05-03 | response parser, redaction engine, verifier UI가 모두 interpreter boundary를 가진다. | source→transform→sink 추적도 |
| c05-a04 | Authentication, session, token 실패 | 유지 | C05-04 | credential을 verifier에게 넘기는 것과 증명하는 것의 차이를 설명한다. | session·token 수명주기 |
| c05-a05 | API inventory, shadow API, rate limit | 병합 | C05-05 | c05-a06과 함께 승인된 proof source, 호출 budget, 관측 가능성을 다루는 운영 통제로 묶을 수 있다. | API coverage 지도 |
| c05-a06 | Logging, alerting, exceptional conditions | 병합 | C05-05 | inventory·rate limit의 결과를 탐지하고 감사하는 같은 운영 흐름이다. | event→alert→decision 파이프라인 |

추가로 c01-a04를 C05-01로 이동한다.

### Chapter 06. Secure Systems and Supply Chain

| ID | 현재 원고 | 판정 | 새 위치 | 근거 | 권장 시각 |
|---|---|---|---|---|---|
| c06-a01 | Secure by Design | 유지 | C06-01 | 안전한 기본값과 제품 책임을 장 전체의 기준으로 제시한다. | outcome·default·evidence·owner 그리드 |
| c06-a02 | Dependency risk와 SBOM | 병합 | C06-02 | c06-a04의 provenance와 함께 읽어야 component에서 배포 artifact까지 이어진다. | source→dependency→artifact provenance 그래프 |
| c06-a03 | Secrets management | 병합·확장 | C06-03 | c02-a06의 crypto period를 받아 secret과 key의 서로 다른 수명주기를 비교한다. | secret·key 상태 전이도 |
| c06-a04 | CI/CD signing, provenance, attestation | 병합 | C06-02 | SBOM이 “무엇이 들어갔는가”, attestation이 “어떻게 만들어졌는가”를 함께 답한다. | 공급망 provenance 그래프 |
| c06-a05 | Container / Kubernetes security posture | 유지 | C06-04 | verifier runtime compromise가 proof acceptance를 무너뜨리는 독립된 운영 경계다. | workload runtime 경계 지도 |
| c06-a06 | Memory safety와 Rust 전환 | 유지 | C06-05 | parser·verifier의 attacker-controlled input 경계를 다루는 구현 안전성 글이다. | safe·unsafe·FFI 경계도 |

### Chapter 07. Privacy-Preserving Proof Systems

| ID | 현재 원고 | 판정 | 새 위치 | 근거 | 권장 시각 |
|---|---|---|---|---|---|
| c07-a01 | Commitment와 selective disclosure | 유지 | C07-01 | 숨김과 binding을 이해하는 첫 진입점이다. | commit→open→verify 인터랙션 |
| c07-a02 | Merkle proof와 inclusion claim | 유지 | C07-02 | 큰 응답에서 선택한 필드를 root에 묶는 독립된 자료구조다. | Merkle branch 인터랙션 |
| c07-a03 | 영지식 증명의 completeness, soundness, zero-knowledge | 분할 | C07-03, C07-04 | statement·witness·public input·circuit은 구성 요소이고, 세 속성은 보장 성질이다. 초심자에게 동시에 소개하면 개념이 몰린다. | 회로 구성도 + 보장 실패 사례 |
| c07-a04 | SNARK vs STARK trade-off | 유지 | C07-05 | 앞선 구성 요소와 보장 성질을 이해한 뒤 선택 문제로 읽을 수 있다. | 비교 매트릭스 |
| c07-a05 | MPC와 garbled circuit | 분할 | C07-06, C07-07 | MPC는 문제 설정이고 garbled circuit은 특정 구현 계열이다. 입력·출력·실패 모델이 다르다. | 참여자 가시성 + wire label 애니메이션 |
| c07-a06 | Verifiable credentials와 anonymous credentials | 유지·선택 읽기 | C07-08 | zkTLS 결과를 credential 생태계와 연결하지만 핵심 프로토콜 선행 개념은 아니다. | disclosure 토글 카드 |

### Chapter 08. zkTLS Architectures and Labs

| ID | 현재 원고 | 판정 | 새 위치 | 근거 | 권장 시각 |
|---|---|---|---|---|---|
| c08-a01 | zkTLS가 해결하는 provenance 문제 | 유지 | C08-01 | 전체 가이드의 도착점과 평가 기준을 제시한다. | screenshot→token→proof 증거 사다리 |
| c08-a02 | Proxy 방식과 신뢰 가정 | 유지 | C08-02 | 가장 단순한 architecture의 장점과 관찰자 비용을 독립적으로 비교한다. | proxy 관찰 경계 지도 |
| c08-a03 | MPC-TLS와 TLSNotary | 유지 | C08-03 | 역할 분리와 online cost를 함께 다루는 핵심 architecture 글이다. | 역할별 swimlane 애니메이션 |
| c08-a04 | DECO 계열 설계 | 유지 | C08-04 | provenance, selective disclosure, oracle policy의 설계 계보를 설명한다. | architecture decision matrix |
| c08-a05 | Fetch-Prove-Verify pipeline | 분할 | C08-05~C08-07 | credential 격리, statement 생성, verifier policy는 소유자·artifact·실패 결과가 서로 다르다. | 단계별 고유 파이프라인 3개 |
| c08-a06 | Toy circuit에서 production risk까지 | 분할 | C08-08, C08-09 | constraint·parser binding 문제와 release·성능·incident 운영 문제를 한 글에 묶지 않는다. | circuit playground + readiness chain |

## 권장 48편 목차

### Chapter 01. Security Thinking — 4편

1. 보안 목표·자산·위험을 한 흐름으로 읽기
2. Trust boundary와 attack surface
3. Threat modeling 입문
4. 보안 통제는 어떻게 실패하는가

### Chapter 02. Cryptographic Primitives — 5편

1. 난수와 entropy
2. 해시 함수와 충돌 저항성
3. 대칭키 암호와 AEAD
4. MAC, HMAC, tag 검증
5. 공개키, 서명, 키 교환

### Chapter 03. Web Trust and TLS — 8편

1. HTTPS 요청은 어떻게 보호되는가
2. TLS 1.2와 TLS 1.3의 구조적 차이
3. TLS record layer와 AEAD
4. PKI, X.509, certificate chain
5. Session resumption과 0-RTT replay
6. DNS bootstrap과 ECH metadata privacy
7. QUIC에서 TLS 1.3은 어떻게 작동하는가
8. mTLS와 client identity

### Chapter 04. Network Tunnels and Identity Planes — 4편

1. VPN은 무엇을 숨기고 무엇을 못 숨기나
2. IPsec과 WireGuard의 경계 비교
3. Zero Trust Network Access
4. Service mesh의 workload identity와 policy plane

### Chapter 05. Application and API Security — 5편

1. 인증·인가·감사의 차이
2. Broken Access Control과 BOLA
3. Injection과 안전한 proof consumption
4. Authentication, session, token 실패
5. API inventory, rate budget, logging

`OWASP Top 10 최신판 읽는 법`의 핵심 내용은 장 도입부와 참고 상자로 유지한다.

### Chapter 06. Secure Systems and Supply Chain — 5편

1. Secure by Design
2. SBOM, build provenance, attestation
3. Secrets, cryptographic keys, crypto period
4. Container / Kubernetes verifier posture
5. Memory safety와 parser·FFI boundary

### Chapter 07. Privacy-Preserving Proof Systems — 8편

1. Commitment와 selective disclosure
2. Merkle proof와 inclusion claim
3. Statement, witness, public input, circuit
4. Completeness, soundness, zero-knowledge
5. SNARK와 STARK의 선택 기준
6. MPC의 역할·입력·adversary model
7. Garbled circuit과 oblivious transfer
8. Verifiable credentials와 anonymous credentials

### Chapter 08. zkTLS Architectures and Labs — 9편

1. zkTLS가 해결하는 provenance 문제
2. Proxy 방식과 신뢰 가정
3. MPC-TLS와 TLSNotary
4. DECO 계열 설계와 architecture 선택
5. Fetch: credential 격리와 transcript 획득
6. Prove: claim spec, parser, circuit binding
7. Verify: origin, freshness, audience, policy
8. Toy circuit과 under-constrained statement
9. Production readiness: 성능, 키, release, incident

## 시각 자료 제작 전략

48편마다 서로 다른 대형 일러스트를 만들 필요는 없다. 챕터마다 하나의 대표 시각 시스템을 만들고, 글별로 데이터와 강조 상태를 바꾸는 방식이 효율적이다.

| 챕터 | 대표 시각 시스템 | 형식 | 우선순위 |
|---|---|---|---|
| 01 | trust boundary 위에 asset·threat·control을 겹치는 캔버스 | 정적 + hover | B |
| 02 | 입력을 바꾸면 hash·tag·AEAD 결과가 달라지는 암호 실험대 | 인터랙티브 | B |
| 03 | TLS 1.2/1.3 handshake와 record 보호 경로 | 단계 애니메이션 + 버전 토글 | A |
| 04 | observer별로 보이는 metadata와 tunnel 경계 | 정적 + 가시성 토글 | C |
| 05 | request가 identity·policy·object·audit를 통과하는 흐름 | 인터랙티브 trace | B |
| 06 | source·dependency·build·runtime·decision provenance | 정적 그래프 | C |
| 07 | witness·public input·circuit·proof·verifier 관계 | 인터랙티브 | A |
| 08 | Prover·Server·Notary·Verifier의 Fetch–Prove–Verify swimlane | 단계 애니메이션 | A |

우선 구현할 대표 시각물은 Chapter 08, Chapter 07, Chapter 03 순이다. 이 세 시각물이 확정되면 Chapter 01·02·05의 설명 수준도 역으로 결정할 수 있다.

애니메이션은 시간 순서나 상태 전이가 이해의 핵심일 때만 사용한다.

- 적합: TLS handshake, 0-RTT replay, MPC-TLS 역할 분리, garbled circuit, Fetch–Prove–Verify
- 정적 도식이 더 적합: 위험 행렬, SNARK/STARK 비교, 공급망 provenance, Kubernetes posture
- 인터랙션이 더 적합: hash 변화, tag mismatch, BOLA object 선택, commitment opening, Merkle branch, toy circuit constraint

## 다음 작업 순서

1. 이 재배치안을 확정한다.
2. Chapter 08의 9편을 독자 질문과 선행 개념 기준으로 먼저 설계한다.
3. Chapter 07과 Chapter 03을 재구성해 Chapter 08에 필요한 기초를 채운다.
4. 나머지 챕터는 새 목차에 맞춰 병합·이동 범위를 확정한다.
5. 각 챕터의 원고가 안정될 때 대표 시각물 하나를 제작한다.
6. 이해도 윤문 후 `humanize-korean` 문체 윤문을 수행한다.
7. 보호 대상, 의미, MDX 구조와 렌더링을 최종 검증한다.

원고 수정 단계에서는 기존 파일을 덮어쓰지 않고 새 검토본과 diff를 먼저 만든다. 제목·H2·순서 변경은 이 보고서 승인과 별도로 원본 반영 요청을 받은 뒤 수행한다.

## 미확정 사항

- 실제 독자 행동 데이터와 사용성 테스트가 없으므로 병합 후보의 최종 분량은 파일별 윤문 단계에서 다시 확인해야 한다.
- 현재 원고의 사실 정확성과 2026년 최신성은 이번 구조 감사의 검증 범위가 아니다.
- `actualWordCount`는 로드맵에 기록된 값을 사용했으며 독립적으로 다시 산정하지 않았다.
- 시각 자료의 상세 레이아웃과 motion spec은 원고 구조가 확정된 뒤 정한다.
