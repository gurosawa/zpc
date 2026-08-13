# Start here 1–20 Evidence Ledger

## 1. 복사본·스크린샷은 증거가 아닌 이유
- 핵심 주장: (1) HTTPS 응답 복사본은 제3자 검증 가능한 출처 증명이 아니다. (2) 스크린샷은 시각 자료이지 암호학적 증거가 아니다. (3) provenance와 relying party의 판단은 별개다.
- 근거: https://tlsnotary.org/docs/intro/ · https://tlsnotary.org/docs/faq/
- 과장 금지: zkTLS가 모든 신뢰 문제를 해결한다고 쓰지 않는다.
- 시각 사실: 복사본·스크린샷·notarized artifact를 origin/integrity/privacy 축으로 비교할 수 있다.

## 2. zkTLS 참여자와 산출물
- 핵심 주장: (1) Origin은 TLS 서비스를 제공한다. (2) Prover는 검증할 statement에 필요한 artifact를 만든다. (3) Verifier 또는 relying application은 정책에 따라 수용 여부를 결정한다.
- 근거: https://tlsnotary.org/docs/intro/ · https://arxiv.org/abs/1909.00938
- 과장 금지: 모든 zkTLS 시스템에 notary가 반드시 있다고 일반화하지 않는다.
- 시각 사실: Origin→Prover→Verifier/Relying application의 artifact 흐름을 분리해 표시할 수 있다.

## 3. 신뢰 경계와 공격면
- 핵심 주장: (1) trust boundary는 권한·데이터 소유·신뢰 수준이 바뀌는 지점이다. (2) 입력 조작 가능 지점이 attack surface다. (3) 역할 간 경계가 명확해야 검증 책임도 명확해진다.
- 근거: https://owasp.org/www-community/Threat_Modeling · https://csrc.nist.gov/glossary/term/attack_surface
- 과장 금지: 경계도를 그렸다는 사실만으로 위협이 제거됐다고 쓰지 않는다.
- 시각 사실: 브라우저, API, prover, verifier 사이에 서로 다른 경계를 표시할 수 있다.

## 4. HTTPS 보호 경로
- 핵심 주장: (1) TLS handshake는 통신 상대와 보안 매개변수 설정에 쓰인다. (2) record layer는 application data를 보호한다. (3) handshake와 record의 역할은 다르다.
- 근거: https://www.rfc-editor.org/rfc/rfc8446 · https://www.rfc-editor.org/rfc/rfc5246
- 과장 금지: TLS가 응답 내용을 제3자에게 자동 서명한다고 쓰지 않는다.
- 시각 사실: handshake 뒤에 보호된 application record가 흐르는 순서를 보일 수 있다.

## 5. TLS transcript와 origin binding
- 핵심 주장: (1) 인증서는 서비스 identity를 연결한다. (2) CertificateVerify와 Finished는 handshake transcript에 결합된다. (3) transcript는 세션 맥락을 검증하는 입력이다.
- 근거: https://www.rfc-editor.org/rfc/rfc8446 · https://www.rfc-editor.org/rfc/rfc5280
- 과장 금지: 인증서만으로 특정 HTTP 응답의 진실성이 증명된다고 쓰지 않는다.
- 시각 사실: certificate chain, CertificateVerify, Finished가 transcript로 모이는 모습을 표시할 수 있다.

## 6. record 인증과 출처 검증의 차이
- 핵심 주장: (1) AEAD tag는 record 무결성 검증에 사용된다. (2) endpoint secret을 아는 당사자는 record를 만들 수 있다. (3) 수신 사실과 제3자 출처 증명은 다른 요구다.
- 근거: https://www.rfc-editor.org/rfc/rfc8446 · https://csrc.nist.gov/pubs/sp/800/38/d/final
- 과장 금지: AEAD가 공개 검증 가능한 서명이라고 쓰지 않는다.
- 시각 사실: endpoint-only 검증과 third-party verification을 나란히 비교할 수 있다.

## 7. TLS 1.2·1.3과 구현 지원 경계
- 핵심 주장: (1) TLS 1.2와 1.3의 handshake·key schedule은 다르다. (2) 지원 범위는 프로토콜 버전과 구현에 좌우된다. (3) version 지원은 단일 기능 플래그가 아니다.
- 근거: https://www.rfc-editor.org/rfc/rfc5246 · https://www.rfc-editor.org/rfc/rfc8446
- 과장 금지: 한 버전을 지원하면 다른 버전도 같은 보장을 준다고 쓰지 않는다.
- 시각 사실: TLS 1.2와 1.3의 key establishment 흐름을 두 열로 비교할 수 있다.

## 8. claim specification
- 핵심 주장: (1) verifier policy는 fetch 전에 정해야 한다. (2) statement에는 origin, request 범위, field path, predicate가 포함될 수 있다. (3) challenge와 freshness는 재사용 위험을 줄이는 정책 입력이다.
- 근거: https://tlsnotary.org/docs/intro/ · https://www.rfc-editor.org/rfc/rfc9449
- 과장 금지: challenge가 모든 replay를 자동 차단한다고 쓰지 않는다.
- 시각 사실: Specify→Challenge→Fetch→Prove→Verify 순서를 표시할 수 있다.

## 9. bytes-to-claim binding
- 핵심 주장: (1) HTTP/JSON bytes를 claim으로 바꾸려면 parser 규칙이 필요하다. (2) canonicalization 차이는 같은 데이터를 다르게 해석하게 할 수 있다. (3) field path와 predicate는 검증 대상 claim을 고정한다.
- 근거: https://www.rfc-editor.org/rfc/rfc8259 · https://www.rfc-editor.org/rfc/rfc9110
- 과장 금지: JSON을 사용하면 해석 모호성이 사라진다고 쓰지 않는다.
- 시각 사실: bytes→parser→field path→predicate→public claim 파이프라인을 그릴 수 있다.

## 10. credential 격리와 응답 claim
- 핵심 주장: (1) session·token은 비공개 credential이다. (2) 인증된 응답이 곧 relying party에 대한 인가를 뜻하지는 않는다. (3) provenance, truth, reliance는 분리해 평가해야 한다.
- 근거: https://www.rfc-editor.org/rfc/rfc6750 · https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/
- 과장 금지: 유효한 proof가 업무상 사용 권한을 보장한다고 쓰지 않는다.
- 시각 사실: credential은 prover 내부에, selected claim만 verifier로 가는 경계를 보일 수 있다.

## 11. prover·verifier와 proof relation
- 핵심 주장: (1) prover는 statement가 참임을 보이는 proof를 만든다. (2) witness는 공개하지 않는 증명 입력이다. (3) public input과 circuit은 verifier가 확인할 relation을 정한다.
- 근거: https://people.cs.georgetown.edu/jthayer/Proofs/zk.pdf · https://z.cash/technology/zksnarks/
- 과장 금지: ZK proof가 statement 자체의 정책 적합성을 정한다고 쓰지 않는다.
- 시각 사실: witness는 prover 안에, public input·proof는 verifier 쪽에 배치할 수 있다.

## 12. commitment와 selective disclosure
- 핵심 주장: (1) commitment는 값을 숨긴 채 고정하는 데 쓰인다. (2) opening은 commitment와 값의 일치를 확인하게 한다. (3) selective disclosure는 필요한 범위만 공개하는 설계다.
- 근거: https://www.iacr.org/archive/crypto1991/05760139/05760139.pdf · https://arxiv.org/abs/1909.00938
- 과장 금지: selective disclosure가 모든 메타데이터 누출을 없앤다고 쓰지 않는다.
- 시각 사실: 전체 응답 중 선택 필드만 opening으로 공개하는 마스크 도식을 쓸 수 있다.

## 13. soundness와 under-constrained circuit
- 핵심 주장: (1) soundness는 거짓 statement 수용 가능성과 관련된다. (2) zero-knowledge는 witness 비공개 성질이다. (3) circuit constraint 누락은 의도와 다른 statement를 증명하게 할 수 있다.
- 근거: https://people.cs.georgetown.edu/jthayer/Proofs/zk.pdf · https://z.cash/technology/zksnarks/
- 과장 금지: proof가 valid하면 application claim도 자동으로 정확하다고 쓰지 않는다.
- 시각 사실: intended constraint와 누락된 constraint가 서로 다른 수용 영역을 만드는 그림을 쓸 수 있다.

## 14. MPC 기초
- 핵심 주장: (1) MPC는 여러 참여자가 입력을 직접 공개하지 않고 공동 계산하는 방식이다. (2) 보장 범위는 adversary model에 의존한다. (3) collusion·abort는 별도 고려 대상이다.
- 근거: https://eprint.iacr.org/2017/472 · https://www.cs.cmu.edu/~odonnell/crypto/lecture19.pdf
- 과장 금지: MPC가 어떤 참여자 조합에서도 항상 비밀을 지킨다고 쓰지 않는다.
- 시각 사실: 두 참여자의 secret share가 공동 계산으로 들어가는 그림을 쓸 수 있다.

## 15. architecture 결정 축
- 핵심 주장: (1) provenance 획득 방식, verifier 주체, 공개 방식은 별개의 축이다. (2) proxy·MPC-TLS·DECO 계열은 신뢰 가정이 다르다. (3) notarization을 하나의 동일한 프로토콜로 취급하면 안 된다.
- 근거: https://tlsnotary.org/docs/intro/ · https://arxiv.org/abs/1909.00938
- 과장 금지: 한 architecture가 모든 제품 요구에 최선이라고 쓰지 않는다.
- 시각 사실: 획득/검증/공개 3축의 architecture matrix를 만들 수 있다.

## 16. TLSNotary/MPC-TLS artifact
- 핵심 주장: (1) TLSNotary는 MPC-TLS와 proxy mode를 구분한다. (2) session artifact와 application claim은 구분해 다뤄야 한다. (3) parser와 disclosure 규칙이 claim 범위를 좌우한다.
- 근거: https://tlsnotary.org/docs/intro/ · https://tlsnotary.org/docs/protocol/proxy-mode/
- 과장 금지: TLSNotary artifact가 원문 전체를 항상 공개한다고 쓰지 않는다.
- 시각 사실: TLS session→commitment/opening→parser→claim의 단계도를 쓸 수 있다.

## 17. 통합 trace
- 핵심 주장: (1) Specify부터 Rely까지 단계별 입력·출력·실패 조건을 추적해야 한다. (2) artifact ownership은 단계마다 달라질 수 있다. (3) verify 성공과 rely 허용은 별도 결정이다.
- 근거: https://tlsnotary.org/docs/intro/ · https://www.rfc-editor.org/rfc/rfc9449
- 과장 금지: verify가 성공하면 반드시 서비스가 수용한다고 쓰지 않는다.
- 시각 사실: 단계별 actor와 artifact ownership을 swimlane으로 표시할 수 있다.

## 18. negative-test capstone
- 핵심 주장: (1) wrong origin·request·path·policy mismatch는 거부돼야 한다. (2) stale challenge와 replay는 freshness 정책의 시험 대상이다. (3) parser mismatch와 과다 공개도 실패 조건이다.
- 근거: https://owasp.org/www-community/Threat_Modeling · https://www.rfc-editor.org/rfc/rfc9449
- 과장 금지: 정상 경로 테스트만으로 보안 보장이 입증됐다고 쓰지 않는다.
- 시각 사실: 각 실패 입력이 reject gate로 향하는 decision table을 만들 수 있다.

## 19. fixture 기반 Fetch·credential 격리 실습
- 핵심 주장: (1) fixture는 실제 계정·토큰 없이 흐름을 재현하는 입력이다. (2) allowed origin과 challenge를 명시해야 한다. (3) disclosure manifest는 공개 범위를 기록한다.
- 근거: https://tlsnotary.org/docs/intro/ · https://www.rfc-editor.org/rfc/rfc6750
- 과장 금지: fixture 실습 결과를 production 보안 보장으로 제시하지 않는다.
- 시각 사실: private token은 fixture boundary 안에, manifest는 외부에 두는 도식을 쓸 수 있다.

## 20. toy predicate·reject-case 실습
- 핵심 주장: (1) toy circuit은 statement·witness·public input 관계를 학습하는 도구다. (2) wrong-path·stale·policy mismatch는 reject case로 시험한다. (3) constraint와 verifier policy를 함께 확인해야 한다.
- 근거: https://z.cash/technology/zksnarks/ · https://people.cs.georgetown.edu/jthayer/Proofs/zk.pdf
- 과장 금지: toy predicate가 production circuit의 안전성을 보장한다고 쓰지 않는다.
- 시각 사실: valid input과 세 가지 reject input을 같은 verifier gate로 연결할 수 있다.

## 검증 메모
- 모든 항목은 핵심 주장 3개, URL 2개, 과장 금지 문구 1개, 시각 사실 1개를 포함한다.
- TLSNotary는 공식 문서, DECO는 원 논문 URL만 사용했다.
