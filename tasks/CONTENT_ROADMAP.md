# zkTLS Master Guide Content Roadmap

Branch: `docs/p4-content-roadmap`  
Source of truth: `content/article-roadmap.json`  
Scope: content structure, metadata contract, branch plan, non-frontend validation. Frontend visual component, CSS, animation work remains owned by Antigravity Gemini 3.1 High.

## Operating Branch Sequence

```txt
docs/p4-content-roadmap
feature/p4a-content-metadata-hardening
feature/p4b-editorial-home-integration
feature/p4c-article-template-system
content/c01-a01-cia-triad
content/c01-a02-asset-threat-vulnerability
content/c02-a04-hmac-tag-verification
content/c03-a04-tls-record-layer
feature/p5a-content-review-dashboard
feature/p5b-visual-artifact-expansion
feature/p5c-organic-motion-polish
```

Each completed branch must run:

```txt
pnpm lint
pnpm test
pnpm build
```

If UI changes in a branch, additionally verify with a local dev server and browser/screenshot checks. When validation passes, commit and push. A deployment branch must also be reviewed for main-readiness and GitHub Actions / Azure Static Web Apps status.

## Source Verification Notes

- OWASP Top Ten current released version was checked against the official OWASP project page and is `2025`: https://owasp.org/www-project-top-ten/
- OWASP API Security Top 10 current project page is `2023`: https://owasp.org/www-project-api-security/
- OWASP LLM Top 10 project page exposes the 2025 LLM risk set: https://owasp.org/www-project-top-10-for-large-language-model-applications/
- TLS 1.3, HKDF, X.509, QUIC/TLS, DoH, DoT, ECH, IKEv2, and ESP references are anchored to IETF/RFC pages.
- NIST PQC references are anchored to FIPS 203/204/205 and the NIST PQC project page; HMAC and GCM include current NIST final or draft/update pages where relevant.
- Supply-chain references prefer CISA, NIST SSDF, OpenSSF/SLSA, and Kubernetes official documentation.

## Metadata Contract

The TypeScript contract is defined in `lib/content-roadmap.ts`; the populated registry is `content/article-roadmap.json`.

Required article fields:

```ts
type ChapterStatus = "planned" | "draft" | "review" | "stable";
type ArticleDifficulty = "foundation" | "intermediate" | "deep" | "lab";

type ArticleMeta = {
  id: string;
  chapterId: string;
  order: number;
  title: string;
  slug: string;
  branch: string;
  status: ChapterStatus;
  difficulty: ArticleDifficulty;
  wordCountTarget: number;
  actualWordCount?: number;
  visualKey: string;
  readerQuestion: string;
  whyItMatters: string;
  coreModel: string;
  protocolOrSystemArtifact: string;
  failureMode: string;
  minimalLabOrTrace: string;
  zktlsBridge: string;
  verificationChecklist: string[];
  references: string[];
};
```

Validation predicates:

- [x] `readerQuestion` 있음
- [x] `whyItMatters` 있음
- [x] `coreModel` 있음
- [x] `failureMode` 있음
- [x] `minimalLabOrTrace` 있음
- [x] `zkTLSBridge` 있음
- [x] `visualKey` 있음
- [x] `references` 있음
- [x] `status` 있음
- [x] `wordCountTarget` 있음
- [x] `branch` field 있음
- [ ] Gemini content review 통과
- [x] Codex metadata validation 통과

## Content Roadmap

### Chapter 01. Security Thinking

| # | Article | Branch | Status | Difficulty | Words | Visual | zkTLS Bridge |
|---:|---|---|---|---|---:|---|---|
| 01 | CIA는 왜 아직 유효한가 | `content/c01-a01-cia-triad` | planned | foundation | 4200 | risk-matrix | TLS 응답의 무결성과 출처 주장을 최소 공개 proof로 보존한다. |
| 02 | 자산·위협·취약점·위험의 관계 | `content/c01-a02-asset-threat-vulnerability` | planned | foundation | 4600 | risk-matrix | proof pipeline의 단계별 자산과 노출면을 분리한다. |
| 03 | Trust boundary와 attack surface | `content/c01-a03-trust-boundary-attack-surface` | planned | intermediate | 6200 | trust-boundary-map | proxy, notary, verifier가 어느 경계에서 무엇을 보는지 비교한다. |
| 04 | 인증·인가·감사의 차이 | `content/c01-a04-authentication-authorization-audit` | planned | foundation | 4400 | api-authz-object-graph | proof는 세션 권한이 아니라 검증 가능한 응답 기록이다. |
| 05 | Threat modeling 입문 | `content/c01-a05-threat-modeling-intro` | planned | intermediate | 6400 | trust-boundary-map | 각 zkTLS article의 trust assumption을 위협 모델로 연결한다. |
| 06 | 보안 통제는 어떻게 실패하는가 | `content/c01-a06-security-control-failure-modes` | planned | deep | 7800 | risk-matrix | proof, policy, circuit, key provenance가 함께 검증되어야 한다. |

### Chapter 02. Cryptographic Primitives

| # | Article | Branch | Status | Difficulty | Words | Visual | zkTLS Bridge |
|---:|---|---|---|---|---:|---|---|
| 01 | 난수와 entropy | `content/c02-a01-randomness-entropy` | planned | foundation | 4500 | crypto-strip | replay와 linkage를 줄이는 proof randomness 요구를 설명한다. |
| 02 | 대칭키 암호와 AEAD | `content/c02-a02-symmetric-key-aead` | planned | intermediate | 6500 | crypto-strip | TLS record의 AEAD tag가 response provenance의 출발점이다. |
| 03 | 해시 함수와 충돌 저항성 | `content/c02-a03-hash-functions-collision-resistance` | planned | foundation | 5200 | hash-chain | transcript digest와 공개 필드를 안전하게 결합한다. |
| 04 | MAC, HMAC, tag 검증 | `content/c02-a04-hmac-tag-verification` | planned | intermediate | 6200 | crypto-strip | TLS tag와 transcript를 제3자 claim으로 옮기는 문제를 다룬다. |
| 05 | 공개키, 서명, 키 교환 | `content/c02-a05-public-key-signatures-key-exchange` | planned | intermediate | 6800 | crypto-strip | 서버 인증서와 key schedule이 출처 신호를 만든다. |
| 06 | 키 관리와 crypto period | `content/c02-a06-key-management-crypto-period` | planned | deep | 7800 | risk-matrix | verifier와 circuit key version이 proof 검증의 일부가 된다. |

### Chapter 03. Web Trust and TLS

| # | Article | Branch | Status | Difficulty | Words | Visual | zkTLS Bridge |
|---:|---|---|---|---|---:|---|---|
| 01 | SSL이 아니라 TLS라고 부르는 이유 | `content/c03-a01-ssl-vs-tls` | planned | foundation | 4200 | tls-record-strip | proof가 어떤 TLS version transcript를 다루는지 명확히 한다. |
| 02 | HTTPS 요청은 어떻게 보호되는가 | `content/c03-a02-https-protection-path` | planned | intermediate | 6500 | tls-handshake-transcript | HTTP field가 TLS-protected session에서 왔다는 경로를 다룬다. |
| 03 | TLS 1.2와 TLS 1.3의 구조적 차이 | `content/c03-a03-tls12-vs-tls13` | planned | deep | 8200 | tls-handshake-transcript | version별 message visibility와 secret share 전제를 비교한다. |
| 04 | TLS record layer와 AEAD | `content/c03-a04-tls-record-layer` | planned | deep | 8200 | tls-record-strip | record layer의 AEAD 검증과 transcript binding을 연결한다. |
| 05 | PKI, X.509, certificate chain | `content/c03-a05-pki-x509-certificate-chain` | planned | deep | 7600 | transcript-receipt | origin metadata와 certificate validation 맥락을 proof에 보존한다. |
| 06 | 0-RTT, ECH, QUIC, mTLS | `content/c03-a06-zero-rtt-ech-quic-mtls` | planned | deep | 8400 | tunnel-encapsulation-stack | 현대 TLS feature가 transcript 관측성과 verifier policy에 주는 영향을 다룬다. |

### Chapter 04. Network Tunnels and Identity Planes

| # | Article | Branch | Status | Difficulty | Words | Visual | zkTLS Bridge |
|---:|---|---|---|---|---:|---|---|
| 01 | VPN은 무엇을 숨기고 무엇을 못 숨기나 | `content/c04-a01-vpn-privacy-boundaries` | planned | foundation | 4600 | tunnel-encapsulation-stack | 경로 은닉과 TLS response provenance를 분리한다. |
| 02 | IPsec, IKEv2, ESP | `content/c04-a02-ipsec-ikev2-esp` | planned | deep | 8200 | tunnel-encapsulation-stack | 네트워크 계층 보호와 application provenance의 차이를 대비한다. |
| 03 | WireGuard와 modern VPN | `content/c04-a03-wireguard-modern-vpn` | planned | intermediate | 6600 | tunnel-encapsulation-stack | 작은 protocol surface와 명시적 trust assumption을 zkTLS 설계 교훈으로 연결한다. |
| 04 | DNS, DoH, DoT, ECH | `content/c04-a04-dns-doh-dot-ech` | planned | intermediate | 6800 | trust-layer-stack | origin proof와 metadata privacy를 별도 요구사항으로 취급한다. |
| 05 | Zero Trust Network Access | `content/c04-a05-zero-trust-network-access` | planned | intermediate | 6800 | trust-boundary-map | zkTLS claim도 verifier policy context 안에서 평가한다. |
| 06 | Service mesh와 mTLS | `content/c04-a06-service-mesh-mtls` | planned | intermediate | 6500 | trust-layer-stack | verification service의 내부 workload identity와 mTLS 보호를 연결한다. |

### Chapter 05. Application and API Security

| # | Article | Branch | Status | Difficulty | Words | Visual | zkTLS Bridge |
|---:|---|---|---|---|---:|---|---|
| 01 | OWASP Top 10 최신판 읽는 법 | `content/c05-a01-owasp-top-10-reading` | planned | foundation | 5000 | risk-matrix | app risk는 proof가 자동으로 제거하지 못하는 source quality 문제다. |
| 02 | Broken Access Control과 BOLA | `content/c05-a02-broken-access-control-bola` | planned | deep | 8000 | api-authz-object-graph | 출처가 맞아도 권한 버그로 잘못 반환된 응답일 수 있다. |
| 03 | Injection과 output encoding | `content/c05-a03-injection-output-encoding` | planned | intermediate | 6600 | api-authz-object-graph | 오염된 response의 provenance를 증명할 수 있다는 위험을 다룬다. |
| 04 | Authentication, session, token 실패 | `content/c05-a04-authentication-session-token-failures` | planned | deep | 7800 | transcript-receipt | user token을 proof flow 밖으로 넘기지 않는 경계를 정의한다. |
| 05 | API inventory, shadow API, rate limit | `content/c05-a05-api-inventory-shadow-api-rate-limit` | planned | intermediate | 6200 | api-authz-object-graph | proof fetch 단계의 endpoint policy와 abuse limit을 연결한다. |
| 06 | Logging, alerting, exceptional conditions | `content/c05-a06-logging-alerting-exceptional-conditions` | planned | intermediate | 6200 | risk-matrix | proof id, policy version, reason code가 audit evidence가 된다. |

### Chapter 06. Secure Systems and Supply Chain

| # | Article | Branch | Status | Difficulty | Words | Visual | zkTLS Bridge |
|---:|---|---|---|---|---:|---|---|
| 01 | Secure by Design | `content/c06-a01-secure-by-design` | planned | foundation | 5200 | supply-chain-provenance | consent, redaction, secure default를 product requirement로 둔다. |
| 02 | Dependency risk와 SBOM | `content/c06-a02-dependency-risk-sbom` | planned | intermediate | 6800 | supply-chain-provenance | verifier/circuit dependency provenance를 추적한다. |
| 03 | Secrets management | `content/c06-a03-secrets-management` | planned | deep | 7400 | risk-matrix | user token을 저장하지 않고 최소 권한 secret만 다룬다. |
| 04 | CI/CD signing, provenance, attestation | `content/c06-a04-cicd-provenance-attestation` | planned | deep | 8200 | supply-chain-provenance | verifier binary와 circuit build provenance를 proof result에 연결한다. |
| 05 | Container / Kubernetes security posture | `content/c06-a05-container-kubernetes-security-posture` | planned | deep | 8000 | trust-boundary-map | verifier runtime compromise가 proof correctness를 무너뜨릴 수 있다. |
| 06 | Memory safety와 Rust 전환 | `content/c06-a06-memory-safety-rust-transition` | planned | intermediate | 6200 | trust-boundary-map | transcript parser와 verifier의 memory-safe boundary를 다룬다. |

### Chapter 07. Privacy-Preserving Proof Systems

| # | Article | Branch | Status | Difficulty | Words | Visual | zkTLS Bridge |
|---:|---|---|---|---|---:|---|---|
| 01 | Commitment와 selective disclosure | `content/c07-a01-commitment-selective-disclosure` | planned | foundation | 5200 | witness-public-circuit | 원본 TLS 응답과 공개 claim 사이의 binding을 표현한다. |
| 02 | Merkle proof와 inclusion claim | `content/c07-a02-merkle-proof-inclusion-claim` | planned | intermediate | 6400 | hash-chain | 응답 필드가 committed transcript 구조 안에 포함됨을 보여준다. |
| 03 | 영지식 증명의 completeness, soundness, zero-knowledge | `content/c07-a03-zk-proof-properties` | planned | intermediate | 6800 | witness-public-circuit | TLS provenance statement와 app predicate를 정확히 회로화한다. |
| 04 | SNARK vs STARK trade-off | `content/c07-a04-snark-stark-tradeoff` | planned | deep | 8200 | circuit-grid | proof system 선택을 user latency와 verifier environment에 맞춘다. |
| 05 | MPC와 garbled circuit | `content/c07-a05-mpc-garbled-circuit` | planned | deep | 8400 | circuit-grid | MPC-TLS가 session key 단독 통제를 줄이는 이유를 설명한다. |
| 06 | Verifiable credentials와 anonymous credentials | `content/c07-a06-verifiable-anonymous-credentials` | planned | deep | 8000 | transcript-receipt | TLS origin data를 credential ecosystem으로 옮기는 bridge를 다룬다. |

### Chapter 08. zkTLS Architectures and Labs

| # | Article | Branch | Status | Difficulty | Words | Visual | zkTLS Bridge |
|---:|---|---|---|---|---:|---|---|
| 01 | zkTLS가 해결하는 provenance 문제 | `content/c08-a01-zktls-provenance-problem` | planned | foundation | 5400 | transcript-receipt | 전체 가이드의 최종 문제 설정으로 앞선 장을 묶는다. |
| 02 | Proxy 방식과 신뢰 가정 | `content/c08-a02-zktls-proxy-trust-assumptions` | planned | intermediate | 7000 | proof-pipeline | proxy architecture를 MPC-TLS와 비교하는 한쪽 축으로 둔다. |
| 03 | MPC-TLS와 TLSNotary | `content/c08-a03-mpc-tls-tlsnotary` | planned | deep | 8800 | proof-pipeline | TLSNotary를 실제 protocol API 기준점으로 설명한다. |
| 04 | DECO 계열 설계 | `content/c08-a04-deco-design-lineage` | planned | deep | 9000 | proof-pipeline | DECO를 zkTLS 연구적 뿌리와 oracle model로 다룬다. |
| 05 | Fetch-Prove-Verify pipeline | `content/c08-a05-fetch-prove-verify-pipeline` | planned | lab | 9000 | proof-pipeline | 모든 article의 bridge를 실제 구현 흐름으로 모은다. |
| 06 | Toy circuit에서 production risk까지 | `content/c08-a06-toy-circuit-production-risk` | planned | lab | 9600 | circuit-grid | lab과 production guarantee의 경계를 명확히 한다. |

## Full Drafts Written

None. This branch intentionally creates the complete roadmap and article briefs only. No article full draft target was specified.

## Known Gaps

- Current route surface is still chapter-oriented (`/guide/[chapter]`), not article-oriented. Article route/scaffold work belongs in `feature/p4c-article-template-system`.
- Several requested visual artifact keys are represented in metadata but not implemented as final SVG diagrams. Visual implementation remains Gemini/p5 scope.
- Existing five chapter MDX files remain legacy draft content; this branch hardens the roadmap and registry without rewriting full chapter prose.
- `Gemini content review 통과` remains unchecked until Gemini reviews the branch output.

## Handoff to Gemini

- Treat `content/article-roadmap.json` as the canonical content contract for editorial TOC rendering.
- The home TOC should be dense editorial reference material, not a SaaS landing page, blog index, or exam summary.
- Visual slots are article/section artifacts, not small icons. Metadata already provides artifact keys such as `risk-matrix`, `tls-record-strip`, `proof-pipeline`, `transcript-receipt`, `circuit-grid`, `supply-chain-provenance`, and `tunnel-encapsulation-stack`.
- Use `status`, `difficulty`, `wordCountTarget`, `branch`, `readerQuestion`, and `zktlsBridge` for review/dashboard surfaces.
- Keep Making Software as grammar inspiration only; do not clone it pixel-for-pixel.

## Gemini Review Prompt

You are Antigravity Gemini 3.1 High.

Review the Codex content branch for `zkTLS Master Guide`.

Your job is not to rewrite everything. Your job is to review whether the content roadmap, metadata, and article drafts support a dense editorial technical reference manual inspired by makingsoftware.com, adapted for zkTLS.

Check the following:

1. Does the roadmap cover security thinking, cryptographic primitives, TLS, VPN/IPsec, application/API security, supply chain, privacy-preserving proofs, and zkTLS architecture?
2. Is the structure deeper than an exam-prep summary?
3. Does every article have a clear reader question?
4. Does every article have a zkTLS bridge?
5. Does every article imply or specify a visual artifact?
6. Are current security topics verified against primary sources?
7. Are OWASP, TLS, NIST, CISA, OpenSSF, or protocol references used carefully?
8. Are there any shallow, generic, or filler sections?
9. Does the metadata support the p3a SVG artifact system?
10. Does the content give the frontend enough information for word counts, status labels, dotted leaders, visual slots, and 3-column editorial TOC rendering?

Return:

- Verdict: Approve / Request Changes / Reject
- Critical Issues
- Required Changes
- Suggested Improvements
- Content Depth Score: 1-10
- zkTLS Relevance Score: 1-10
- Editorial TOC Readiness Score: 1-10
- Design Handoff Notes
